import { useCallback, useRef } from 'react';

import { useLiveRef } from '../useLiveRef';
import { useUnmount } from '../useUnmount';

/**
 * Creates a **debounced** function that delays invoking `callback` until
 * after `delayMs` milliseconds have elapsed since the **last** time
 * the debounced function was called.
 *
 * Characteristics:
 * - **Stable identity** — the returned function is memoized and safe to pass to deps.
 * - **Latest closure** — uses `useLiveRef` so the *current* `callback` and `delayMs`
 *   are read at call time (no stale props/state inside the timeout handler).
 * - **Unmount‑safe** — pending timeout is automatically cleared on unmount.
 * - **Behavior on change** — updating `delayMs` or `callback` does **not** recreate
 *   the debounced function; already scheduled timeouts keep their originally used delay.
 *
 * @template CallbackArgs Tuple of argument types accepted by `callback`.
 * @param callback The function to debounce. It will be invoked with the most recent arguments.
 * @param delayMs Debounce delay in **milliseconds**.
 * @returns A stable debounced function: `(...args: CallbackArgs) => void`.
 *
 * @example
 * // Search input with debounced network call
 * const handleQuery = useDebounceCallback((query: string) => {
 *   fetch(`/api/search?q=${encodeURIComponent(query)}`);
 * }, 300);
 *
 * <input onChange={(event) => handleQuery(event.target.value)} />
 *
 * @example
 * // Debounce expensive layout work while ensuring latest state is used
 * const [scale, setScale] = useState(1);
 * const recompute = useDebounceCallback(() => {
 *   // reads latest `scale` thanks to useLiveRef inside the hook
 *   doHeavyWork(scale);
 * }, 200);
 *
 * window.addEventListener('resize', recompute);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDebounceCallback.md
 */
export function useDebounceCallback<CallbackArgs extends any[]>(
  callback: (...args: CallbackArgs) => unknown,
  delayMs: number,
) {
  // Keep latest callback & delay in a ref to avoid stale closures.
  const sharedOptionsLiveRef = useLiveRef({ callback, delayMs });

  // Holds the active timeout id so we can cancel/reschedule.
  const timeoutIdRef = useRef(0);

  // Clear any pending timeout on unmount to prevent late executions.
  useUnmount(() => {
    window.clearTimeout(timeoutIdRef.current);
  });

  // Stable debounced function. Always clears previous timeout
  // and schedules a new one with the latest delay & callback.
  return useCallback((...args: CallbackArgs) => {
    window.clearTimeout(timeoutIdRef.current);

    timeoutIdRef.current = window.setTimeout(() => {
      sharedOptionsLiveRef.current.callback(...args);
    }, sharedOptionsLiveRef.current.delayMs);
  }, []);
}
