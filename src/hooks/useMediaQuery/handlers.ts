import { shallowCompareObjects } from '../../functions/shallowCompareObjects';

import { UseMediaQueryRule, UseMediaQueryType } from './types';

/**
 * Shallowly compares two media query definitions (type + rules).
 *
 * - Returns `true` if both definitions have the same media type,
 *   the same number of rules, and all corresponding rules are
 *   shallowly equal (via {@link shallowCompareObjects}).
 * - Returns `false` otherwise.
 *
 * @param prev - Tuple of [type, rules] representing the previous state.
 * @param next - Tuple of [type, rules] representing the next state.
 * @returns `true` if the two definitions are shallowly equal, otherwise `false`.
 */
export function compareRules(
  [prevType, prevRules]: [UseMediaQueryType, UseMediaQueryRule[]],
  [nextType, nextRules]: [UseMediaQueryType, UseMediaQueryRule[]],
) {
  return (
    prevType === nextType &&
    prevRules.length === nextRules.length &&
    prevRules.every((item, index) => {
      return shallowCompareObjects(item, nextRules[index]!);
    })
  );
}
