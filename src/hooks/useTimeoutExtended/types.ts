/**
 * Callback function passed to `useTimeoutExtended`.
 *
 * Called exactly once after the timeout completes.
 *
 * @param actualTime - The actual elapsed time (in milliseconds) between `start()` and completion.
 */
export type UseTimeoutExtendedCallback = (actualTime: number) => void;

/**
 * Methods exposed by `useTimeoutExtended` for controlling the timer.
 *
 * @template RequiredDelayMs - If `true`, `start()` and `restart()` require a delay argument.
 *                           If `false`, they accept an optional override delay.
 */
export type UseTimeoutExtendedMethods<RequiredDelayMs extends boolean = false> =
  {
    /**
     * Cancel the pending timer (if any).
     * @returns `true` if a pending timer was cancelled, otherwise `false`.
     */
    cancel: () => boolean;

    /**
     * Restart the timer (alias of `start`).
     *
     * - If `RequiredDelayMs` is `true`, a delay argument is required.
     * - Otherwise, you may omit the argument to use the default delay.
     *
     * @param delayMs - (Optional) Override delay in milliseconds.
     */
    restart: RequiredDelayMs extends true
      ? (delayMs: number) => void
      : (overrideDelayMs?: number) => void;

    /**
     * Start (or restart) the timer.
     *
     * - If `RequiredDelayMs` is `true`, a delay argument is required.
     * - Otherwise, you may omit the argument to use the default delay.
     *
     * @param delayMs - (Optional) Override delay in milliseconds.
     */
    start: RequiredDelayMs extends true
      ? (delayMs: number) => void
      : (overrideDelayMs?: number) => void;
  };

/**
 * Full return type of `useTimeoutExtended`.
 * Combines state fields and control methods into one object.
 *
 * @template RequiredDelayMs - If `true`, `start()`/`restart()` require a delay argument.
 */
export type UseTimeoutExtendedReturn<RequiredDelayMs extends boolean = false> =
  UseTimeoutExtendedMethods<RequiredDelayMs> & UseTimeoutExtendedState;

/**
 * Reactive state exposed by `useTimeoutExtended`.
 */
export type UseTimeoutExtendedState = {
  /**
   * Whether the timeout has already completed.
   */
  isDone: boolean;

  /**
   * Whether the timeout is currently pending.
   */
  isPending: boolean;
};
