import { useEffect } from 'react';

import { useLiveRef } from '../useLiveRef';

import { UseUnmountCallback } from './types';

/**
 * React hook that invokes the provided callback **once** when the component unmounts.
 *
 * - The callback reference is kept fresh via `useLiveRef`, so the **latest** version
 *   is called at unmount time.
 * - The callback does **not** run on mount or updates.
 * - Useful for cleanup, final logging, saving drafts, cancelling requests, etc.
 *
 * @param {UseUnmountCallback} callback Function to run on unmount.
 * @returns {void}
 *
 * @example
 * useUnmount(() => {
 *   clearInterval(timerId);
 *   controller.abort();
 * });
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useUnmount.md
 */
export function useUnmount(callback: UseUnmountCallback) {
  const callbackLiveRef = useLiveRef(callback);

  return useEffect(() => {
    return () => {
      callbackLiveRef.current();
    };
  }, []);
}
