const LOWER_CASE_REGEXP = /([a-z])([A-Z])/g;

const replacer = (_matches: string, a: string, b: string) => {
  return `${a}-${b.toLowerCase()}`;
};

/**
 * Converts a camelCase or PascalCase string into kebab-case.
 *
 * Example transformations:
 * - `"minWidth"` → `"min-width"`
 * - `"maxResolution"` → `"max-resolution"`
 * - `"DisplayMode"` → `"display-mode"`
 *
 * @param value - The input string in camelCase or PascalCase.
 * @returns The string converted to kebab-case.
 */
export function lowerCaseToKebabCase(value: string) {
  return value.replace(LOWER_CASE_REGEXP, replacer).toLowerCase();
}
