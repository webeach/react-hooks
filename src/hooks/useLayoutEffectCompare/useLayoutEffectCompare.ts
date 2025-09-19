import { useDeps } from '../useDeps';
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';

/**
 * Runs a layout effect only when the provided dependency array changes.
 *
 * Performs shallow comparison (`===`) per index.
 *
 * @param effect - The layout effect callback.
 * @param deps - Dependency array to track.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useLayoutEffectCompare.md
 */
function useLayoutEffectCompare(
  effect: () => void | (() => void),
  deps: unknown[],
): void;

/**
 * Runs a layout effect only when the comparison function detects a change.
 *
 * Useful when comparing non-array values with custom logic.
 *
 * @param effect - The layout effect callback.
 * @param compare - A function comparing the previous and next value.
 * @param comparedValue - The current value to compare.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useLayoutEffectCompare.md
 */
function useLayoutEffectCompare<ComparedValue>(
  effect: () => void | (() => void),
  compare: (prevValue: ComparedValue, nextValue: ComparedValue) => boolean,
  comparedValue: ComparedValue,
): void;

/**
 * Runs a layout effect using a custom compare function only.
 *
 * Use this form when managing comparison logic manually.
 *
 * @param effect - The layout effect callback.
 * @param compare - A comparison function with manually tracked state.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useLayoutEffectCompare.md
 */
function useLayoutEffectCompare(
  effect: () => void | (() => void),
  compare: () => boolean,
): void;

function useLayoutEffectCompare<ComparedValue = unknown>(
  effect: () => void | (() => void),
  ...compareArgs: unknown[]
) {
  const [depId] = useDeps<ComparedValue>(
    ...(compareArgs as Parameters<typeof useDeps<ComparedValue>>),
  );

  useIsomorphicLayoutEffect(effect, [depId]);
}

export { useLayoutEffectCompare };
