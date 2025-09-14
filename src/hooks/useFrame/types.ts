/**
 * A callback function used by `useFrame`.
 * Called on each animation frame with timing information.
 *
 * @param options - Frame timing details including frame count, delta time, and time since start.
 */
export type UseFrameCallback = (options: UseFrameCallbackOptions) => void;

/**
 * Options passed to the frame callback in `useFrame`.
 */
export interface UseFrameCallbackOptions {
  /**
   * The current frame number, starting from 0 at the first `requestAnimationFrame` call.
   */
  frame: number;

  /**
   * Total elapsed time in milliseconds since the first frame.
   */
  timeSinceStart: number;

  /**
   * Time elapsed in milliseconds since the previous frame.
   */
  deltaTime: number;
}
