import { useCallback, useMemo, useRef } from 'react';

import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';
import { useLiveRef } from '../useLiveRef';

import { UseFrameExtendedCallback, UseFrameExtendedReturn } from './types';

/**
 * A React hook that provides an extended animation loop using `requestAnimationFrame`.
 * Includes controls to start, stop, and restart the loop, and provides detailed timing info
 * for each frame callback such as total elapsed time and time since last start.
 *
 * @param callback - A function that is invoked on every animation frame with timing data.
 * @returns An object with `start`, `stop`, and `restart` methods to control the loop.
 *
 * @example
 * ```tsx
 * const { start, stop, restart } = useFrameExtended(({ frame, deltaTime }) => {
 *   console.log(`Frame: ${frame}, Delta: ${deltaTime}ms`);
 * });
 *
 * useLayoutEffect(() => {
 *   start();
 * }, []);
 * ```
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useFrameExtended.md
 */
export function useFrameExtended(callback: UseFrameExtendedCallback) {
  // Store the latest version of the callback to avoid stale closures
  const callbackLiveRef = useLiveRef(callback);

  // Shared state between frames
  const sharedOptionsRef = useRef({
    frame: 1,
    isDeferredStart: false,
    isFirstStart: true,
    isInitial: true,
    isStarted: false,
    lastStartTime: 0,
    prevFrameTime: 0,
    requestId: 0,
    startTime: 0,
  });

  // Frame handler: executes callback and schedules next frame
  const frameHandler = useCallback<FrameRequestCallback>((currentTime) => {
    const sharedOptions = sharedOptionsRef.current;

    callbackLiveRef.current({
      frame: sharedOptions.frame,
      deltaTime: currentTime - sharedOptions.prevFrameTime,
      timeSinceLastStart: currentTime - sharedOptions.lastStartTime,
      timeSinceStart: currentTime - sharedOptions.startTime,
    });

    sharedOptions.frame++;
    sharedOptions.prevFrameTime = currentTime;

    sharedOptions.requestId = requestAnimationFrame(frameHandler);
  }, []);

  // Memoized methods for external control
  const methods = useMemo<UseFrameExtendedReturn>(() => {
    const sharedOptions = sharedOptionsRef.current;

    return {
      restart: () => {
        // If it's still the initial render, just start
        if (sharedOptions.isInitial) {
          return methods.start();
        }

        // Reset base values
        sharedOptions.frame = 1;
        sharedOptions.startTime = performance.now();
        methods.start();
      },

      start: () => {
        if (sharedOptions.isInitial) {
          // Defer start until after mount
          sharedOptions.isDeferredStart = true;
          return;
        }

        if (sharedOptions.isFirstStart) {
          // Set global start time once
          sharedOptions.startTime = performance.now();
          sharedOptions.isFirstStart = false;
        }

        if (sharedOptions.isStarted) {
          // Stop previous loop if running
          methods.stop();
        }

        // Set time markers for this session
        sharedOptions.lastStartTime = performance.now();
        sharedOptions.prevFrameTime = sharedOptions.lastStartTime;
        sharedOptions.isStarted = true;

        // Kick off animation loop
        sharedOptions.requestId = requestAnimationFrame(frameHandler);
      },

      stop: () => {
        if (sharedOptions.isStarted) {
          cancelAnimationFrame(sharedOptions.requestId);
          sharedOptions.isStarted = false;
        }
      },
    };
  }, []);

  // Handle initial mount and deferred start
  useIsomorphicLayoutEffect(() => {
    const sharedOptions = sharedOptionsRef.current;
    sharedOptions.isInitial = false;

    if (sharedOptions.isDeferredStart) {
      methods.start();
    }

    // Clean up loop on unmount
    return methods.stop;
  }, []);

  return methods;
}
