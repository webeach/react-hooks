import { useCallback } from 'react';

import { useDeps } from '../useDeps';

import { UseCallbackCompareFunction } from './types';

/**
 * Returns a memoized callback that updates only when the provided dependencies array changes.
 *
 * Performs shallow comparison (`===`) per index.
 *
 * @param callback - The callback function to memoize.
 * @param deps - Dependency array to track.
 * @returns A memoized callback, stable unless dependencies change.
 *
 * @example
 * const handleClick = useCallbackCompare(() => doSomething(a, b), [a, b]);
 */
function useCallbackCompare<CallbackType extends (...args: any) => any>(
  callback: CallbackType,
  deps: unknown[],
): CallbackType;

/**
 * Returns a memoized callback that updates only when the comparison function detects a change.
 *
 * Useful when comparing a value with custom logic (e.g. comparing by `.id` or reference).
 *
 * @param callback - The callback function to memoize.
 * @param compare - A function comparing the previous and next value.
 * @param comparedValue - The value to compare between renders.
 * @returns A memoized callback, stable unless the value changes based on the compare function.
 *
 * @example
 * const handleUpdate = useCallbackCompare(
 *   () => updateUser(user),
 *   (prev, next) => prev.id === next.id,
 *   user
 * );
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useCallbackCompare.md
 */
function useCallbackCompare<
  CallbackType extends (...args: any) => any,
  ComparedValue,
>(
  callback: CallbackType,
  compare: UseCallbackCompareFunction<ComparedValue>,
  comparedValue: ComparedValue,
): CallbackType;

/**
 * Returns a memoized callback using a custom compare function only.
 *
 * Use this form when managing the comparison logic manually or for deferred tracking.
 *
 * @param callback - The callback function to memoize.
 * @param compare - A comparison function with internally managed state.
 * @returns A memoized callback, stable unless the comparison returns `false`.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useCallbackCompare.md
 */
function useCallbackCompare<CallbackType extends (...args: any) => any>(
  callback: CallbackType,
  compare: UseCallbackCompareFunction,
): CallbackType;

function useCallbackCompare<
  CallbackType extends (...args: any) => any,
  ComparedValue,
>(callback: () => CallbackType, ...compareArgs: unknown[]) {
  const [depId] = useDeps(
    ...(compareArgs as Parameters<typeof useDeps<ComparedValue>>),
  );

  return useCallback(callback, [depId]);
}

export { useCallbackCompare };
