/**
 * Callback function used in `useFrameExtended`.
 *
 * Called on each animation frame while the hook is active.
 *
 * @param options - Frame timing details and counters.
 */
export type UseFrameExtendedCallback = (
  options: UseFrameExtendedCallbackOptions,
) => void;

/**
 * Timing-related values provided to the `useFrameExtended` callback on each frame.
 */
export interface UseFrameExtendedCallbackOptions {
  /**
   * The current frame number, starting from 0 on the first frame after `start()` or `restart()`.
   */
  frame: number;

  /**
   * Total elapsed time in milliseconds since the hook was first started.
   */
  timeSinceStart: number;

  /**
   * Time in milliseconds since the last call to `start()` or `restart()`.
   */
  timeSinceLastStart: number;

  /**
   * Time in milliseconds since the previous animation frame.
   */
  deltaTime: number;
}

/**
 * Control interface returned by `useFrameExtended`.
 *
 * Allows you to manually control the frame loop.
 */
export interface UseFrameExtendedReturn {
  /**
   * Starts the frame loop.
   * If already running, does nothing.
   */
  start: () => void;

  /**
   * Stops the frame loop.
   */
  stop: () => void;

  /**
   * Restarts the frame loop and resets counters.
   */
  restart: () => void;
}
