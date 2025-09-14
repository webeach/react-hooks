import { useEffect, useMemo, useRef } from 'react';

import { useDemandStructure } from '../useDemandStructure';
import { useLiveRef } from '../useLiveRef';
import { useRefState } from '../useRefState';
import { useUnmount } from '../useUnmount';

import {
  UseTimeoutExtendedCallback,
  UseTimeoutExtendedReturn,
  UseTimeoutExtendedState,
} from './types';

/**
 * Creates a **manually controlled** timeout with a **default delay**.
 *
 * - The timer does **not** start automatically — call `start()`/`restart()` to begin.
 * - The `delayMs` here acts as the **default delay** used when `start()` is called
 *   **without** an override argument.
 * - If a run was started **without** an override and the timer is pending,
 *   changing `delayMs` will **re-schedule** to honor the new **total** duration
 *   measured from the original start moment.
 *
 * @example
 * const timeout = useTimeoutExtended(callback, 1000);
 * timeout.start();            // uses default 1000ms
 * // later, while pending:
 * // change external state so that `delayMs` becomes 600 → it will fire 600ms from the original start (i.e., remaining time is adjusted).
 *
 * @param callback - Called after completion with the measured elapsed time (ms).
 * @param delayMs  - Default delay (ms) used by `start()` when no override is provided.
 * @returns Combined state & methods object: `{ isPending, isDone, start, restart, cancel }`.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useTimeoutExtended.md
 */
function useTimeoutExtended(
  callback: UseTimeoutExtendedCallback,
  delayMs: number,
): UseTimeoutExtendedReturn;

/**
 * Creates a **manually controlled** timeout **without a default delay**.
 *
 * - The timer does **not** start automatically — you must call `start(delayMs)` (or `restart(delayMs)`).
 * - Runs started with an **override** delay ignore subsequent external `delayMs` changes for that run.
 *
 * @example
 * const timeout = useTimeoutExtended(cb);
 * timeout.start(300);   // required: provide a delay
 *
 * @param callback - Called after completion with the measured elapsed time (ms).
 * @returns Combined state & methods object where `start(delayMs)` requires an argument.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useTimeoutExtended.md
 */
function useTimeoutExtended(
  callback: UseTimeoutExtendedCallback,
): UseTimeoutExtendedReturn<true>;

function useTimeoutExtended(
  callback: UseTimeoutExtendedCallback,
  delayMs = 0,
): UseTimeoutExtendedReturn<any> {
  // Store state in a ref to avoid unnecessary re-renders,
  // and enable controlled re-rendering only when the consumer
  // actually accesses state via demand-structure.
  const [stateRef, setRefState, { enableUpdate }] =
    useRefState<UseTimeoutExtendedState>({
      isDone: false,
      isPending: false,
    });

  // Always call the latest callback (stable between renders).
  const callbackLiveRef = useLiveRef(callback);

  // Keep the latest delay value for implicit starts (without override).
  const delayMsLiveRef = useLiveRef(delayMs);

  // Shared mutable control data for the active run.
  const sharedOptionsRef = useRef({
    timeoutId: 0,
    startTime: 0,
    withOverrideDelayMs: false,
  });

  // Memoized methods for external control
  const methods = useMemo(() => {
    const sharedOptions = sharedOptionsRef.current;

    return {
      /**
       * Cancel the pending timer (if any).
       * @returns true if a pending timer was cancelled, false otherwise.
       */
      cancel: () => {
        methods._cancelInternal();

        if (stateRef.current.isPending) {
          setRefState({
            isDone: false,
            isPending: false,
          });

          return true;
        }

        return false;
      },

      /**
       * Start (or restart) the timer.
       *
       * - If `overrideDelayMs` is provided, this run will **ignore** subsequent `delayMs` prop changes.
       * - If omitted, the run uses the latest `delayMs` value and will auto-reschedule
       *   if `delayMs` changes while pending (to match the new total duration).
       */
      start: (overrideDelayMs?: number) => {
        sharedOptions.startTime = performance.now();
        sharedOptions.withOverrideDelayMs = overrideDelayMs !== undefined;

        methods._startInternal(overrideDelayMs ?? delayMsLiveRef.current);
      },

      // ---- internal helpers ----

      /** Clear any active timeout without touching state. */

      _cancelInternal: () => {
        window.clearTimeout(sharedOptions.timeoutId);
      },

      /** Schedule a new timeout with the given final delay. */
      _startInternal: (finalDelayMs: number) => {
        methods._cancelInternal();

        setRefState({
          isDone: false,
          isPending: true,
        });

        sharedOptions.timeoutId = window.setTimeout(() => {
          const actualTime = performance.now() - sharedOptions.startTime;

          setRefState({
            isDone: true,
            isPending: false,
          });

          callbackLiveRef.current(actualTime);
        }, finalDelayMs);
      },
    };
  }, []);

  // Auto-reschedule logic:
  // If the timer is pending and was started *without* override,
  // then changing `delayMs` adjusts the remaining time to honor the
  // new total duration from the original start moment.
  useEffect(() => {
    const sharedOptions = sharedOptionsRef.current;

    if (!sharedOptions.withOverrideDelayMs && stateRef.current.isPending) {
      const differenceMs = performance.now() - sharedOptions.startTime;
      const finalMs = Math.max(delayMs - differenceMs, 0);

      methods._startInternal(finalMs);
    }
  }, [delayMs]);

  // Ensure we do not leak timers.
  useUnmount(methods._cancelInternal);

  // Expose hybrid API via demand-structure:
  // - State fields (`isPending`, `isDone`) trigger re-render only when first accessed.
  // - Methods are exposed as stable getters.
  return useDemandStructure({
    cancel: () => methods.cancel,
    isDone: (isInitialAccess) => {
      if (isInitialAccess) {
        // Enable re-renders for subsequent state updates once the consumer uses this field.
        enableUpdate(true);
      }

      return stateRef.current.isDone;
    },
    isPending: (isInitialAccess) => {
      if (isInitialAccess) {
        // Enable re-renders for subsequent state updates once the consumer uses this field.
        enableUpdate(true);
      }

      return stateRef.current.isPending;
    },
    // `restart` is an alias of `start` for API clarity.
    restart: () => methods.start,
    start: () => methods.start,
  });
}

export { useTimeoutExtended };
