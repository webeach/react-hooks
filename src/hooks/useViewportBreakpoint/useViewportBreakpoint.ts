import { useMemo, useState } from 'react';

import { isServer } from '../../constants/common';
import { getEntries } from '../../functions/getEntries';
import { shallowCompareObjects } from '../../functions/shallowCompareObjects';
import { useDemandStructure } from '../useDemandStructure';
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';
import { useLiveRef } from '../useLiveRef';
import { useMemoCompare } from '../useMemoCompare';

import { buildBreakpointMediaQuery } from './utils/buildBreakpointMediaQuery';
import { validateBreakpointEntry } from './utils/validateBreakpointEntry';

import {
  BreakpointBaseKey,
  UseViewportBreakpointMatches,
  UseViewportBreakpointOptions,
  UseViewportBreakpointReturn,
} from './types';

const mediaQueryInstanceCacheMap = new Map<number, MediaQueryList>();

/**
 * React hook for tracking responsive breakpoints using `window.matchMedia`.
 *
 * - Transforms a breakpoint map into a sorted list and creates a `MediaQueryList` for each value.
 * - Subscribes to media query changes and updates the active breakpoint when the viewport changes.
 * - Returns `matches` (an object with all breakpoints and their state) and `activeBreakpoint` (the active key).
 * - Supports a `defaultBreakpoint` as a fallback when no breakpoint matches (e.g., in SSR).
 *
 * @template BreakpointKeys - A set of breakpoint keys (strings or symbols).
 *
 * @param breakpointMap - Dictionary of breakpoints (e.g., `{ mobile: 0, tablet: 768, desktop: 1200 }`).
 * @param options - Additional options, such as `defaultBreakpoint`.
 *
 * @returns A combined type that supports both object and tuple access:
 * - Object: `{ matches, activeBreakpoint }`
 * - Tuple: `[matches, activeBreakpoint]`
 *
 * @example
 * const { matches, activeBreakpoint } = useViewportBreakpoint(
 *   { mobile: 0, tablet: 768, desktop: 1200 },
 *   { defaultBreakpoint: 'mobile' }
 * );
 *
 * if (matches.tablet) {
 *   console.log('Tablet is active');
 * }
 *
 * console.log('Current breakpoint:', activeBreakpoint);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useViewportBreakpoint.md
 */
export function useViewportBreakpoint<BreakpointKeys extends BreakpointBaseKey>(
  breakpointMap: Record<BreakpointKeys, number>,
  options: UseViewportBreakpointOptions<BreakpointKeys> = {},
): UseViewportBreakpointReturn<BreakpointKeys> {
  const { defaultBreakpoint = null } = options;

  // Build a sorted list of breakpoints and corresponding MediaQueryLists
  const [breakpointSortedKeys, mediaQueryInstanceMap] = useMemoCompare(
    () => {
      const entries = getEntries(breakpointMap, true);

      // Sort by numeric values (min → max)
      const sortedEntries = entries.sort(
        (entryA, entryB) => entryA[1] - entryB[1],
      );

      // Filter out invalid values (negative, Infinity, NaN)
      const validEntries = sortedEntries.filter(validateBreakpointEntry);
      const sortedKeys = validEntries.map(([key]) => key);

      // SSR: return an empty map
      if (isServer) {
        return [sortedKeys, new Map<BreakpointKeys, MediaQueryList>()] as const;
      }

      // Create MediaQueryLists for each value, with caching
      const instanceEntries = validEntries.map(([key, value]) => {
        const instanceFromCache = mediaQueryInstanceCacheMap.get(value);

        if (instanceFromCache) {
          return [key, instanceFromCache] as const;
        }

        const mediaQuery = buildBreakpointMediaQuery(value);
        const mediaQueryInstance = window.matchMedia(mediaQuery);

        mediaQueryInstanceCacheMap.set(value, mediaQueryInstance);

        return [key, mediaQueryInstance] as const;
      });

      return [sortedKeys, new Map(instanceEntries)] as const;
    },
    shallowCompareObjects,
    breakpointMap,
  );

  // Initialize the active breakpoint
  const initActiveBreakpointLiveRef = useLiveRef(() => {
    return (
      breakpointSortedKeys.findLast((key) => {
        return mediaQueryInstanceMap.get(key)?.matches;
      }) || defaultBreakpoint
    );
  });

  const [activeBreakpoint, setActiveBreakpoint] = useState(
    initActiveBreakpointLiveRef.current,
  );

  // Build the matches object from the active breakpoint
  const currentMatches = useMemo(() => {
    return Object.fromEntries(
      breakpointSortedKeys.map((key) => [key, key === activeBreakpoint]),
    ) as UseViewportBreakpointMatches<BreakpointKeys>;
  }, [activeBreakpoint, breakpointSortedKeys]);

  useIsomorphicLayoutEffect(() => {
    const updateActiveBreakpoint = () => {
      setActiveBreakpoint(initActiveBreakpointLiveRef.current);
    };

    // Subscribe to changes for each MediaQueryList
    const cleanupList = breakpointSortedKeys.map((key) => {
      const instance = mediaQueryInstanceMap.get(key)!;

      instance.addEventListener('change', updateActiveBreakpoint);

      return () => {
        instance.removeEventListener('change', updateActiveBreakpoint);
      };
    });

    updateActiveBreakpoint();

    return () => {
      cleanupList.forEach((cleanUpHandler) => cleanUpHandler());
    };
  }, [breakpointSortedKeys, mediaQueryInstanceMap]);

  // Return API as both object and tuple via useDemandStructure
  return useDemandStructure([
    {
      alias: 'matches',
      accessor: () => currentMatches,
    },
    {
      alias: 'activeBreakpoint',
      accessor: () => activeBreakpoint,
    },
  ]);
}
