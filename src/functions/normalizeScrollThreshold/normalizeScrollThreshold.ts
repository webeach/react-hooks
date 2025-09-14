import { NormalizeScrollThresholdMap } from './types';

/**
 * Normalizes the `threshold` value into a complete map of numeric thresholds
 * for each scroll direction. Ensures all values are non-negative.
 *
 * @param threshold - Either a single number (applied to all directions), or a map of per-side thresholds.
 * @returns An object with explicit `top`, `bottom`, `left`, and `right` numeric thresholds.
 *
 * @example
 * normalizeScrollThreshold(50);
 * // => { top: 50, bottom: 50, left: 50, right: 50 }
 *
 * @example
 * normalizeScrollThreshold({ top: 20, right: 0 });
 * // => { top: 20, bottom: 0, left: 0, right: 0 }
 */
export function normalizeScrollThreshold(
  threshold: number | NormalizeScrollThresholdMap,
): Required<NormalizeScrollThresholdMap> {
  if (typeof threshold !== 'number') {
    return {
      bottom: Math.max(threshold.bottom || 0, 0),
      left: Math.max(threshold.left || 0, 0),
      right: Math.max(threshold.right || 0, 0),
      top: Math.max(threshold.top || 0, 0),
    };
  }

  const thresholdValue = Math.max(threshold || 0, 0);

  return {
    bottom: thresholdValue,
    left: thresholdValue,
    right: thresholdValue,
    top: thresholdValue,
  };
}
