import { useEffect, useMemo, useRef } from 'react';

import { useDemandStructure } from '../useDemandStructure';
import { useLiveRef } from '../useLiveRef';

import { UseLoopCallback, UseLoopOptions, UseLoopReturn } from './types';

/**
 * Create a looping timer powered by `setTimeout` with pause/resume semantics.
 *
 * This overload accepts a fixed `durationMs` and exposes a single `run()` control.
 *
 * Behavior:
 * - Invokes `callback` each time the timeout elapses.
 * - If `manual` (in options) is **false** (default), the loop **auto-reschedules** itself after each tick.
 * - If `manual` is **true**, the loop performs a **single** tick and then waits. To continue, either
 *   call the **`resume`** function received *inside* the callback, **or** call `run()` again externally.
 * - If `disabled` is true, the loop pauses mid-interval; resuming can **preserve** elapsed time or **reset**
 *   from scratch depending on `resetElapsedOnResume`.
 *
 * @example
 * const [run] = useLoop(({ actualTime, resume }) => {
 *   // do work...
 *   // in manual mode you may choose to continue immediately:
 *   // resume();
 * }, 1000);
 *
 * // later
 * run(); // start the loop
 *
 * @param callback Function invoked on each tick; receives `{ actualTime, resume }`.
 * @param durationMs Timeout duration in milliseconds for each tick.
 * @returns A stable control API that includes `run()` (tuple/object form depends on `useDemandStructure`).
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useLoop.md
 */
function useLoop(callback: UseLoopCallback, durationMs: number): UseLoopReturn;

/**
 * Create a looping timer with full configuration.
 *
 * Use this overload to control `autorun`, `manual`, `disabled`, `durationMs`, and `resetElapsedOnResume`.
 *
 * Key options:
 * - `autorun` — start automatically on mount (default `false`).
 * - `manual` — if `true`, perform **one** tick and wait for an explicit continuation
 *   (either call `resume()` from the callback, or call `run()` again externally). Default `false`.
 * - `disabled` — externally pauses/resumes the loop.
 * - `durationMs` — timeout duration in milliseconds.
 * - `resetElapsedOnResume` — when resuming after pause or when `durationMs` changes,
 *   if `true` the next wait starts from full `durationMs`; if `false`, the remaining time is preserved (default `false`).
 *
 * @example
 * const [run] = useLoop(({ actualTime, resume }) => {
 *   // do work per tick
 * }, {
 *   durationMs: 500,
 *   autorun: true,
 *   manual: false,
 *   resetElapsedOnResume: false,
 * });
 *
 * @param callback Function invoked on each tick; receives `{ actualTime, resume }`.
 * @param options Full configuration for loop behavior.
 * @returns A stable control API that includes `run()` (tuple/object form depends on `useDemandStructure`).
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useLoop.md
 */
function useLoop(
  callback: UseLoopCallback,
  options: UseLoopOptions,
): UseLoopReturn;

function useLoop(
  callback: UseLoopCallback,
  optionsOrDurationMs: number | UseLoopOptions,
): UseLoopReturn {
  const options =
    typeof optionsOrDurationMs === 'number'
      ? { durationMs: optionsOrDurationMs }
      : (optionsOrDurationMs ?? {});

  const {
    autorun = false,
    disabled = false,
    durationMs,
    manual = false,
    resetElapsedOnResume = false,
  } = options;

  // Shared mutable control data for the active run (lives across renders).
  const sharedOptionsRef = useRef({
    elapsedDurationBeforeDisabled: 0, // elapsed time in the current interval when disabled was set
    isPaused: false, // whether we are currently paused due to `disabled`
    isPending: false, // whether a timeout is currently scheduled
    lastFinalDurationMs: 0, // last computed wait duration used to arm the timeout
    timeoutId: 0, // id of the active timeout
    startTime: 0, // performance.now() at the moment the current timeout was armed
  });

  // Latest dynamic inputs for the loop, kept in a live ref to avoid stale closures.
  const sharedOptionsLiveRef = useLiveRef({
    callback,
    disabled,
    durationMs,
    manual,
    resetElapsedOnResume,
  });

  // Memoized methods for external control
  const methods = useMemo(() => {
    const sharedOptions = sharedOptionsRef.current;

    return {
      /**
       * Run/rerun the loop using the current `durationMs`.
       */
      run: () => {
        sharedOptions.startTime = performance.now();

        methods._runInternal(sharedOptionsLiveRef.current.durationMs);
      },

      // ---- internal helpers ----

      /** Clear any scheduled timeout and mark as not pending. */
      _cancelInternal: () => {
        sharedOptions.isPending = false;
        window.clearTimeout(sharedOptions.timeoutId);
      },

      /** Schedule a new timeout with the given final duration. */
      _runInternal: (finalDurationMs: number) => {
        const sharedOptionsLive = sharedOptionsLiveRef.current;

        methods._cancelInternal();

        sharedOptions.lastFinalDurationMs = finalDurationMs;

        // If externally disabled, do not schedule.
        if (sharedOptionsLive.disabled) {
          return;
        }

        sharedOptions.isPending = true;

        sharedOptions.timeoutId = window.setTimeout(() => {
          const actualTime = performance.now() - sharedOptions.startTime;

          let resumeWasCalledIn = false;

          sharedOptionsLive.callback({
            actualTime,
            resume: () => {
              resumeWasCalledIn = true;
            },
          });

          // Auto-reschedule if `resume()` was requested or we are not in manual mode.
          if (resumeWasCalledIn || !sharedOptionsLive.manual) {
            methods.run();
          }
        }, finalDurationMs);
      },
    };
  }, []);

  // React to `durationMs` changes: optionally recompute the remaining time
  // for the current cycle when not disabled and preservation is desired.
  useEffect(() => {
    const sharedOptions = sharedOptionsRef.current;
    const sharedOptionsLive = sharedOptionsLiveRef.current;

    if (
      !sharedOptionsLive.disabled &&
      !sharedOptionsLive.resetElapsedOnResume &&
      sharedOptions.isPending
    ) {
      const differenceMs = performance.now() - sharedOptions.startTime; // time already elapsed in this interval
      const finalMs = Math.max(durationMs - differenceMs, 0); // remaining time to wait

      methods._runInternal(finalMs);
    }
  }, [durationMs]);

  // React to external `disabled` state: pause and (optionally) resume with remaining time.
  useEffect(() => {
    const sharedOptions = sharedOptionsRef.current;

    // Transition to disabled: capture elapsed portion and cancel current timeout.
    if (disabled && sharedOptions.isPending) {
      sharedOptions.elapsedDurationBeforeDisabled =
        performance.now() - sharedOptions.startTime;
      sharedOptions.isPaused = true;
      methods._cancelInternal();
    }

    // Transition to enabled: compute remaining time and continue the cycle.
    if (!disabled && sharedOptions.isPaused) {
      const finalMs = Math.max(
        sharedOptions.lastFinalDurationMs -
          sharedOptions.elapsedDurationBeforeDisabled,
        0,
      );

      sharedOptions.isPaused = false;
      methods._runInternal(finalMs);
    }
  }, [disabled]);

  // On mount: optionally autorun; on unmount: cancel any pending timeout.
  useEffect(() => {
    const sharedOptionsLive = sharedOptionsLiveRef.current;

    if (autorun && !sharedOptionsLive.disabled) {
      methods.run();
    }

    return methods._cancelInternal;
  }, []);

  // Expose a hybrid API via useDemandStructure; now only `run` is exported.
  return useDemandStructure([
    {
      alias: 'run',
      accessor: () => methods.run,
    },
  ]);
}

export { useLoop };
