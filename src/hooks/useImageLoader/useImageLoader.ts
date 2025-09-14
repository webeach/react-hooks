import { useEffect } from 'react';

import { __DEVELOPMENT__ } from '../../constants/common';
import { mapStatusStateToDemandStructure } from '../../functions/mapStatusStateToDemandStructure';
import { useDemandStructure } from '../useDemandStructure';
import { useStatus } from '../useStatus';

import { UseImageLoaderReturn } from './types';

/**
 * React hook that loads an image and provides structured loading state with demand-evaluated accessors.
 *
 * It returns a demand structure that exposes flags like `isPending`, `isSuccess`, `isError`, and `error`,
 * which update automatically as the image loads, fails, or is aborted.
 *
 * This hook also logs a warning in development mode if `imageUrl` is an empty string.
 *
 * @param imageUrl - The source URL of the image to load.
 * @returns A demand structure (`UseImageReturn`) with current status flags and error (if any).
 *
 * @example
 * // Object-based usage
 * const { isPending, isSuccess, isError, error } = useImageLoader(url);
 *
 * if (isPending) showSpinner();
 * if (isSuccess) showImage();
 * if (isError) showError(error?.message);
 *
 * @example
 * // Tuple-based usage
 * const [isPending, isSuccess, isError, error] = useImageLoader(url);
 *
 * if (isPending) {
 *   console.log('Loading...');
 * }
 * if (isSuccess) {
 *   console.log('Image loaded!');
 * }
 * if (isError) {
 *   console.error('Failed to load image:', error?.message);
 * }
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useImageLoader.md
 */
export function useImageLoader(imageUrl: string) {
  const statusState = useStatus();

  useEffect(() => {
    const imageElement = new Image();

    if (__DEVELOPMENT__ && imageUrl === '') {
      console.warn(
        '[useImageLoader] Empty imageUrl provided. This may cause the browser to request the current page as an image.',
      );
    }

    const handleAbort = () => {
      statusState.setError(
        new Error('[useImageLoader] Image loading aborted.'),
      );
    };

    const handleError = () => {
      statusState.setError(new Error('[useImageLoader] Failed to load image.'));
    };

    const handleLoad = () => {
      statusState.setSuccess();
    };

    statusState.setPending();

    imageElement.onabort = handleAbort;
    imageElement.onerror = handleError;
    imageElement.onload = handleLoad;

    imageElement.src = imageUrl;

    return () => {
      imageElement.onabort = null;
      imageElement.onerror = null;
      imageElement.onload = null;
    };
  }, [imageUrl]);

  return useDemandStructure(
    mapStatusStateToDemandStructure(statusState),
  ) as UseImageLoaderReturn;
}
