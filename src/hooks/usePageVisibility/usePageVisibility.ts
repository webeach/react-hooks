import { useEffect } from 'react';

import { isServer } from '../../constants/common';
import {
  $DemandStructureUsingSymbol,
  useDemandStructure,
} from '../useDemandStructure';
import { useForceUpdate } from '../useForceUpdate';
import { useLiveRef } from '../useLiveRef';

import { UsePageVisibilityCallback, UsePageVisibilityReturn } from './types';

function checkDocumentIsVisible(): boolean {
  return document.visibilityState === 'visible';
}

/**
 * Tracks page visibility (visible vs hidden).
 *
 * Returns a hybrid structure that supports both tuple and object access:
 * - Tuple: `[isVisible]`
 * - Object: `{ isVisible }`
 *
 * Optionally accepts a callback that fires on each visibility change.
 *
 * @param callback - Optional function called on visibility change.
 * @returns Whether the page is currently visible.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/usePageVisibility.md
 */
export function usePageVisibility(
  callback?: UsePageVisibilityCallback,
): UsePageVisibilityReturn {
  const forceUpdate = useForceUpdate();
  const callbackLiveRef = useLiveRef(callback);

  const visibilityState = useDemandStructure([
    {
      alias: 'isVisible',
      accessor: () => (isServer ? true : checkDocumentIsVisible()),
    },
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only trigger update if value was accessed
      if (visibilityState[$DemandStructureUsingSymbol].isVisible) {
        forceUpdate();
      }

      // Always trigger callback if provided
      callbackLiveRef.current?.(checkDocumentIsVisible());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return visibilityState;
}
