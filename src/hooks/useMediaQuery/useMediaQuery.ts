import { useState } from 'react';

import { isServer } from '../../constants/common';
import { buildMediaQuery } from '../../functions/buildMediaQuery';
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';
import { useMemoCompare } from '../useMemoCompare';

import { compareRules } from './handlers';
import {
  UseMediaQueryReturn,
  UseMediaQueryRule,
  UseMediaQueryType,
} from './types';

/**
 * Subscribes to a single media query rule with the default type `'all'`.
 *
 * @param rule - A single media query rule object.
 * @returns A tuple with a boolean indicating if the query matches.
 *
 * @example
 * const [isLargeScreen] = useMediaQuery({ minWidth: 1024 });
 * if (isLargeScreen) {
 *   console.log('Desktop layout');
 * }
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useMediaQuery.md
 */
function useMediaQuery(rule: UseMediaQueryRule): UseMediaQueryReturn;

/**
 * Subscribes to multiple media query rules with the default type `'all'`.
 *
 * Each rule is combined with commas (OR logic).
 *
 * @param rules - An array of media query rule objects.
 * @returns A tuple with a boolean indicating if any of the queries match.
 *
 * @example
 * const [isMobileOrLandscape] = useMediaQuery([
 *   { maxWidth: 600 },
 *   { orientation: 'landscape' },
 * ]);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useMediaQuery.md
 */
function useMediaQuery(
  rules: ReadonlyArray<UseMediaQueryRule>,
): UseMediaQueryReturn;

/**
 * Subscribes to a single media query rule with an explicit media type.
 *
 * @param type - The media query type (`'all'`, `'screen'`, `'print'`).
 * @param rule - A single media query rule object.
 * @returns A tuple with a boolean indicating if the query matches.
 *
 * @example
 * const [isPrintLandscape] = useMediaQuery('print', { orientation: 'landscape' });
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useMediaQuery.md
 */
function useMediaQuery(
  type: UseMediaQueryType,
  rule: UseMediaQueryRule,
): UseMediaQueryReturn;

/**
 * Subscribes to multiple media query rules with an explicit media type.
 *
 * Each rule is combined with commas (OR logic).
 *
 * @param type - The media query type (`'all'`, `'screen'`, `'print'`).
 * @param rules - An array of media query rule objects.
 * @returns A tuple with a boolean indicating if any of the queries match.
 *
 * @example
 * const [isPrintReady] = useMediaQuery('print', [
 *   { orientation: 'portrait' },
 *   { minResolution: 2 },
 * ]);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useMediaQuery.md
 */
function useMediaQuery(
  type: UseMediaQueryType,
  rules: ReadonlyArray<UseMediaQueryRule>,
): UseMediaQueryReturn;

function useMediaQuery(...args: unknown[]) {
  // Normalize arguments into [type, rules[]]
  const [type, rules] = (args.length > 1 ? args : ['all', args[0]]) as [
    UseMediaQueryType,
    UseMediaQueryRule | UseMediaQueryRule[],
  ];

  const finalRules = Array.isArray(rules) ? rules : [rules];

  // Create or reuse matchMedia instance with memoized comparison
  const mediaQueryInstance = useMemoCompare(
    () => {
      if (isServer) {
        return null;
      }

      const mediaQuery = buildMediaQuery(type, finalRules);
      return window.matchMedia(mediaQuery);
    },
    compareRules,
    [type, finalRules],
  );

  // Current match state
  const [isMatch, setIsMatch] = useState(() => {
    return Boolean(mediaQueryInstance?.matches);
  });

  // Subscribe to changes in media query match state
  useIsomorphicLayoutEffect(() => {
    if (mediaQueryInstance === null) {
      return;
    }

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMatch(event.matches);
    };

    mediaQueryInstance.addEventListener('change', handleChange);

    setIsMatch(mediaQueryInstance.matches);

    return () => {
      mediaQueryInstance.removeEventListener('change', handleChange);
    };
  }, [mediaQueryInstance]);

  return [isMatch] as const;
}

export { useMediaQuery };
