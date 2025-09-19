import { __DEVELOPMENT__ } from '../../constants/common';
import {
  MediaQueryRule,
  MediaQueryRuleKey,
  MediaQueryType,
} from '../../types/mediaQuery';
import { lowerCaseToKebabCase } from '../lowerCaseToKebabCase';

/**
 * Set of all supported media query rule keys.
 * Used to validate incoming rules and to prevent unsupported features.
 */
const ALLOWED_RULE_KEYS_SET = new Set<MediaQueryRuleKey>([
  'anyHover',
  'anyPointer',
  'aspectRatio',
  'displayMode',
  'hover',
  'maxResolution',
  'maxWidth',
  'minResolution',
  'minWidth',
  'orientation',
  'pointer',
  'prefersColorScheme',
  'prefersContrast',
  'prefersReducedMotion',
]);

/**
 * Precomputed map from camelCase keys (TS interface props)
 * to kebab-case CSS media feature names.
 *
 * Example: `anyPointer → any-pointer`
 */
const ruleKeyCamelCaseToKebabCaseMap = Object.fromEntries(
  Array.from(ALLOWED_RULE_KEYS_SET).map((key) => [
    key,
    lowerCaseToKebabCase(key),
  ]),
);

/**
 * Map of rule-specific value transformation functions.
 *
 * Converts TypeScript values into valid CSS values:
 * - aspectRatio: `[16, 9]` → `"16/9"`
 * - resolution: `2` → `"2dppx"`
 * - width: `1200` → `"1200px"`
 */
const ruleValueTransformMap: Partial<
  Record<MediaQueryRuleKey, (value: any) => string>
> = {
  aspectRatio: (value: readonly [number, number]) => value.join('/'),
  maxResolution: (value: number) => `${value}dppx`,
  maxWidth: (value: number) => `${value}px`,
  minResolution: (value: number) => `${value}dppx`,
  minWidth: (value: number) => `${value}px`,
};

/**
 * Builds a single media query expression string from a rule object.
 *
 * @example
 * buildRuleExpression({ minWidth: 600, orientation: 'landscape' })
 * // → "(min-width: 600px) and (orientation: landscape)"
 *
 * @param rule - Media query rule object to convert.
 * @returns A valid CSS media query expression string.
 */
function buildRuleExpression(rule: MediaQueryRule) {
  const ruleEntries = Object.entries(rule) as ReadonlyArray<
    [MediaQueryRuleKey, unknown]
  >;

  // Using string concatenation instead of Array.join(' and ')
  // because join() introduces extra O(n + L) overhead by building arrays.
  return ruleEntries.reduce((finalExpression, [ruleKey, ruleValue]) => {
    if (!ALLOWED_RULE_KEYS_SET.has(ruleKey)) {
      if (__DEVELOPMENT__) {
        console.warn(`Unknown media query rule: ${ruleKey}`);
      }
      return finalExpression;
    }

    const normalizedRuleKey = ruleKeyCamelCaseToKebabCaseMap[ruleKey]!;

    const transformedValue = Object.prototype.hasOwnProperty.call(
      ruleValueTransformMap,
      ruleKey,
    )
      ? ruleValueTransformMap[ruleKey]!(ruleValue)
      : ruleValue;

    const expression = `${normalizedRuleKey}: ${transformedValue}`;

    return finalExpression === ''
      ? `(${expression})`
      : `${finalExpression} and (${expression})`;
  }, '');
}

/**
 * Builds a complete media query string for given type and rule list.
 *
 * @example
 * buildMediaQuery('screen', [
 *   { minWidth: 768 },
 *   { orientation: 'landscape' },
 * ])
 * // → "screen and (min-width: 768px), screen and (orientation: landscape)"
 *
 * @param type - The media query type (`all`, `screen`, `print`).
 * @param ruleList - An array of rule objects to be combined.
 * @returns A full CSS media query string ready to be passed to `window.matchMedia`.
 */
export function buildMediaQuery(
  type: MediaQueryType,
  ruleList: ReadonlyArray<MediaQueryRule>,
) {
  return ruleList
    .map((ruleItem) => `${type} and ${buildRuleExpression(ruleItem)}`)
    .join(', ');
}
