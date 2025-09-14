import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';
import { useLiveRef } from '../useLiveRef';

import { UseFrameCallback } from './types';

/**
 * A React hook that invokes a callback on every animation frame.
 *
 * The callback receives useful timing information:
 * - `frame`: current frame number (starts from 1)
 * - `deltaTime`: time in milliseconds since the previous frame
 * - `timeSinceStart`: time in milliseconds since the first frame
 *
 * @param callback - A function called on every `requestAnimationFrame`
 *
 * @example
 * useFrame(({ frame, deltaTime, timeSinceStart }) => {
 *   console.log(`Frame: ${frame}`);
 *   console.log(`Δ: ${deltaTime.toFixed(2)}ms`);
 *   console.log(`Total: ${timeSinceStart.toFixed(2)}ms`);
 * });
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useFrame.md
 */
export function useFrame(callback: UseFrameCallback) {
  const callbackLiveRef = useLiveRef(callback);

  useIsomorphicLayoutEffect(() => {
    const startTime = performance.now();

    let frame = 1;
    let prevFrameTime = startTime;
    let requestId = 0;

    const frameHandler: FrameRequestCallback = (currentTime) => {
      callbackLiveRef.current({
        frame,
        deltaTime: currentTime - prevFrameTime,
        timeSinceStart: currentTime - startTime,
      });

      frame++;
      prevFrameTime = currentTime;

      requestId = requestAnimationFrame(frameHandler);
    };

    requestId = requestAnimationFrame(frameHandler);

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, []);
}
