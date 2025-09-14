import { useEffect } from 'react';

import { useDeps } from '../useDeps';

import { UseEffectCompareFunction } from './types';

/**
 * Runs an effect only when the provided dependency array changes.
 *
 * Performs shallow comparison (`===`) per index.
 *
 * @param effect - The effect callback.
 * @param deps - Dependency array to track.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useEffectCompare.md
 */
function useEffectCompare(
  effect: () => void | (() => void),
  deps: unknown[],
): void;

/**
 * Runs an effect only when the comparison function detects a change.
 *
 * Useful when comparing non-array values with custom logic.
 *
 * @param effect - The effect callback.
 * @param compare - A function comparing the previous and next value.
 * @param comparedValue - The current value to compare.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useEffectCompare.md
 */
function useEffectCompare<ComparedValue>(
  effect: () => void | (() => void),
  compare: UseEffectCompareFunction<ComparedValue>,
  comparedValue: ComparedValue,
): void;

/**
 * Runs an effect using a custom compare function only.
 *
 * Use this form when managing comparison logic manually.
 *
 * @param effect - The effect callback.
 * @param compare - A function that determines whether the value changed.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useEffectCompare.md
 */
function useEffectCompare(
  effect: () => void | (() => void),
  compare: UseEffectCompareFunction,
): void;

function useEffectCompare<ComparedValue = unknown>(
  effect: () => void | (() => void),
  ...compareArgs: unknown[]
): void {
  const [depId] = useDeps<ComparedValue>(
    ...(compareArgs as Parameters<typeof useDeps<ComparedValue>>),
  );

  useEffect(effect, [depId]);
}

export { useEffectCompare };
