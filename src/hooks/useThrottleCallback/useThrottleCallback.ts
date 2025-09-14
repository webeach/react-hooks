import { useCallback, useRef } from 'react';

import { useLiveRef } from '../useLiveRef';
import { useUnmount } from '../useUnmount';

import { SharedOptions } from './types';

/**
 * Create a **throttled** function that limits how often `callback` can run.
 *
 * Semantics (leading + trailing):
 * - **Leading**: if invoked after the quiet period, `callback` runs **immediately**.
 * - **Trailing**: if invoked again **within** the quiet period, a single **deferred** run
 *   is scheduled for the end of that period with the **latest** arguments.
 *
 * Characteristics:
 * - **Stable identity** — the returned function is memoized and safe for deps/event listeners.
 * - **Latest closure** — `useLiveRef` ensures the most recent `callback`/`delayMs` are read at call time.
 * - **Unmount‑safe** — any pending trailing timeout is cleared on unmount.
 * - **Changing `delayMs`** — affects computations for **new calls**; an already scheduled trailing run keeps
 *   its originally computed delay.
 *
 * @template CallbackArgs Tuple of argument types accepted by `callback`.
 * @param callback Function to throttle; may be called with the latest args either immediately (leading)
 *                 or at the end of the wait window (trailing).
 * @param delayMs Minimum time window in **milliseconds** between consecutive executions.
 * @returns A stable throttled function: `(...args: CallbackArgs) => void`.
 *
 * @example
 * // Throttle scroll handler (fire at most once per 100ms, trailing calls coalesce)
 * const onScrollThrottled = useThrottleCallback(() => {
 *   updateVisibleRegion();
 * }, 100);
 *
 * window.addEventListener('scroll', onScrollThrottled);
 *
 * @example
 * // Throttle a resize recalculation while always using latest state/props
 * const recompute = useThrottleCallback((width: number) => {
 *   doLayout(width);
 * }, 200);
 *
 * recompute(container.offsetWidth);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useThrottleCallback.md
 */
export function useThrottleCallback<CallbackArgs extends any[]>(
  callback: (...args: CallbackArgs) => unknown,
  delayMs: number,
) {
  // Internal rolling state for throttling window and latest arguments
  const sharedOptionsRef = useRef<SharedOptions<CallbackArgs>>({
    lastArgs: null, // most recent args seen during the current window
    lastCallTime: Number.NEGATIVE_INFINITY, // timestamp of the last execution baseline (performance.now)
    timeoutId: null, // scheduled trailing timeout id, if any
  });

  // Keep latest callback & delay in a ref to avoid stale closures.
  const sharedOptionsLiveRef = useLiveRef({ callback, delayMs });

  // Clear any pending timeout on unmount to prevent late executions.
  useUnmount(() => {
    const sharedOptions = sharedOptionsRef.current;

    if (sharedOptions.timeoutId !== null) {
      window.clearTimeout(sharedOptions.timeoutId);
      sharedOptions.timeoutId = null;
    }
  });

  // Stable throttled function
  return useCallback((...args: CallbackArgs) => {
    const sharedOptions = sharedOptionsRef.current;

    const currentTime = performance.now();
    const remainingTime =
      sharedOptionsLiveRef.current.delayMs -
      (currentTime - sharedOptions.lastCallTime);

    // Always remember the latest arguments seen during this window
    sharedOptions.lastArgs = args;

    if (remainingTime <= 0) {
      // Window has passed: execute immediately (leading)
      if (sharedOptions.timeoutId !== null) {
        window.clearTimeout(sharedOptions.timeoutId);
        sharedOptions.timeoutId = null;
      }

      sharedOptions.lastCallTime = currentTime;
      sharedOptionsLiveRef.current.callback(...sharedOptions.lastArgs!);
      sharedOptions.lastArgs = null; // consumed
      return;
    }

    // Inside the window: schedule a trailing execution if not already scheduled
    if (sharedOptions.timeoutId === null) {
      sharedOptions.timeoutId = window.setTimeout(() => {
        // Note: we use the baseline captured at schedule time for lastCallTime
        sharedOptions.lastCallTime = performance.now();
        sharedOptions.timeoutId = null;

        if (sharedOptions.lastArgs !== null) {
          sharedOptionsLiveRef.current.callback(...sharedOptions.lastArgs!);
          sharedOptions.lastArgs = null;
        }
      }, remainingTime);
    }
  }, []);
}
