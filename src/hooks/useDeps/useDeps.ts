import { useRef } from 'react';

import { shallowCompareArrays } from '../../functions/shallowCompareArrays';

import { UseDepsCompareFunction } from './types';

/**
 * Tracks a stable identity that never changes.
 *
 * Useful as a static placeholder or when using `useDeps` purely for compatibility with other hooks.
 *
 * @returns A tuple containing the current stable `id`, which always starts at `0` and does not increment.
 *
 * @example
 * const [id] = useDeps(); // id will always be 0
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDeps.md
 */
function useDeps(): [id: number];

/**
 * Tracks a stable identity that changes when the provided array of dependencies changes.
 *
 * Performs shallow comparison (`===`) per index.
 *
 * @param deps - Array of dependencies to track.
 * @returns A tuple containing the current stable `id`.
 *
 * @example
 * const [id] = useDeps([a, b, c]);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDeps.md
 */
function useDeps(deps: unknown[]): [id: number];

/**
 * Tracks a stable identity that changes when the value fails the custom comparison function.
 *
 * Useful for comparing non-array values with custom logic.
 *
 * @param compare - A function that compares the previous and next value.
 * @param comparedValue - The current value to compare.
 * @returns A tuple containing the current stable `id`.
 *
 * @example
 * const [id] = useDeps((prev, next) => prev.id === next.id, currentUser);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDeps.md
 */
function useDeps<ValueType>(
  compare: UseDepsCompareFunction<ValueType>,
  comparedValue: ValueType,
): [id: number];

/**
 * Tracks a stable identity using a compare function only.
 *
 * Use this form when the comparison logic is deferred or controlled externally.
 *
 * @param compare - A comparison function. You must manually update the `value` later.
 *
 * @returns A tuple containing the current stable `id`.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDeps.md
 */
function useDeps(compare: UseDepsCompareFunction): [id: number];

function useDeps(
  compareOrDeps?:
    | UseDepsCompareFunction<unknown>
    | UseDepsCompareFunction
    | unknown[],
  maybeComparedValue?: unknown,
) {
  const sharedRef = useRef({
    currentDeps: Array.isArray(compareOrDeps) ? compareOrDeps : [],
    currentValue: maybeComparedValue,
    depId: 0,
    isFirstMount: true,
  });

  const isChanged = (() => {
    const shared = sharedRef.current;

    if (shared.isFirstMount) {
      shared.isFirstMount = false;
      return false;
    }

    if (Array.isArray(compareOrDeps)) {
      if (!shallowCompareArrays(compareOrDeps, shared.currentDeps)) {
        shared.currentDeps = compareOrDeps;
        return true;
      }

      return false;
    }

    if (
      compareOrDeps &&
      !compareOrDeps(shared.currentValue, maybeComparedValue)
    ) {
      shared.currentValue = maybeComparedValue;
      return true;
    }

    return false;
  })();

  if (isChanged) {
    sharedRef.current.depId++;
  }

  return [sharedRef.current.depId] as const;
}

export { useDeps };
