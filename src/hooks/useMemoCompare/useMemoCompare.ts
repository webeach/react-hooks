import { useMemo } from 'react';

import { useDeps } from '../useDeps';

/**
 * Returns a memoized value that updates only when the provided dependencies array changes.
 *
 * Performs shallow comparison (`===`) per index.
 *
 * @param factory - A function that returns the value to memoize.
 * @param deps - Dependency array to track.
 * @returns The memoized value, recomputed only when dependencies change.
 *
 * @example
 * const memo = useMemoCompare(() => computeSomething(a, b), [a, b]);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useMemoCompare.md
 */
function useMemoCompare<ValueType>(
  factory: () => ValueType,
  deps: unknown[],
): ValueType;

/**
 * Returns a memoized value that updates only when the comparison function detects a change.
 *
 * Useful when comparing non-array values with custom logic (e.g. objects by `.id`).
 *
 * @param factory - A function that returns the value to memoize.
 * @param compare - A function comparing the previous and next value.
 * @param comparedValue - The current value to compare.
 * @returns The memoized value, recomputed only when the value changes according to the compare function.
 *
 * @example
 * const memo = useMemoCompare(() => expensiveTransform(user), (a, b) => a.id === b.id, user);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useMemoCompare.md
 */
function useMemoCompare<ValueType, ComparedValue>(
  factory: () => ValueType,
  compare: (prevValue: ComparedValue, nextValue: ComparedValue) => boolean,
  comparedValue: ComparedValue,
): ValueType;

/**
 * Returns a memoized value using a custom compare function only.
 *
 * Use this form when managing the compared value manually (advanced use).
 *
 * @param factory - A function that returns the value to memoize.
 * @param compare - A comparison function with manually tracked state.
 * @returns The memoized value, recomputed only when the comparison fails.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useMemoCompare.md
 */
function useMemoCompare<ValueType>(
  factory: () => ValueType,
  compare: () => boolean,
): ValueType;

function useMemoCompare<ValueType, ComparedValue>(
  factory: () => ValueType,
  ...compareArgs: unknown[]
) {
  const [depId] = useDeps(
    ...(compareArgs as Parameters<typeof useDeps<ComparedValue>>),
  );

  return useMemo(factory, [depId]);
}

export { useMemoCompare };
