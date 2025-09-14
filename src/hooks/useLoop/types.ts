/**
 * User-provided function invoked on each loop tick.
 *
 * The function receives timing info and a `resume` callback that can be used to
 * continue the loop when `manual` mode is enabled.
 *
 * @param options Details about the current tick and a way to continue.
 */
export type UseLoopCallback = (options: UseLoopCallbackOptions) => void;

/**
 * Options passed to the loop callback.
 */
export type UseLoopCallbackOptions = {
  /**
   * Actual elapsed time in **milliseconds** since the current interval started.
   * Useful to account for scheduling drift.
   */
  actualTime: number;
  /**
   * Request the loop to schedule the **next cycle**.
   *
   * In `manual: true` mode, the loop performs a single tick and waits; calling
   * `resume()` (or `run()` externally) tells it to continue. In automatic mode
   * (`manual: false`) this is typically not needed.
   */
  resume: UseLoopRunFunction;
};

/**
 * Configuration options for the loop.
 */
export type UseLoopOptions = {
  /**
   * Start the loop automatically on mount.
   * @default false
   */
  autorun?: boolean;

  /**
   * Pause the loop externally. Switching back to `false` resumes it.
   * @default false
   */
  disabled?: boolean;

  /**
   * Timeout duration (milliseconds) for each tick.
   */
  durationMs: number;

  /**
   * If `true`, perform a **single** tick and wait to be continued
   * (by calling `resume()` inside the callback or `run()` externally).
   * If `false`, the loop auto-reschedules after each tick.
   * @default false
   */
  manual?: boolean;

  /**
   * Control whether the **remaining time** is preserved when the loop resumes
   * (or when `durationMs` changes). If `true`, the next wait starts from the
   * full `durationMs`; if `false`, it continues with the remaining portion.
   * @default false
   */
  resetElapsedOnResume?: boolean;
};

/**
 * Public return shape. The hook supports both tuple and object styles for
 * ergonomic consumption.
 */
export type UseLoopReturn = UseLoopReturnTuple & UseLoopReturnObject;

/**
 * Object-style API.
 */
export type UseLoopReturnObject = {
  /** Start (or continue) the loop using the current configuration. */
  run: UseLoopRunFunction;
};

/**
 * Tuple-style API (useful for array destructuring).
 */
export type UseLoopReturnTuple = readonly [
  /** Start (or continue) the loop using the current configuration. */
  run: UseLoopRunFunction,
];

/**
 * Function that starts or continues the loop by arming a timeout for the
 * current `durationMs`.
 */
export type UseLoopRunFunction = () => void;
