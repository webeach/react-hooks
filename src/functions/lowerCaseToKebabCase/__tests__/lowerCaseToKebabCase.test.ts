import { lowerCaseToKebabCase } from '../lowerCaseToKebabCase';

describe('lowerCaseToKebabCase function', () => {
  it('converts simple camelCase to kebab-case', () => {
    expect(lowerCaseToKebabCase('minWidth')).toBe('min-width');
  });

  it('converts multiple uppercase letters', () => {
    expect(lowerCaseToKebabCase('maxResolutionDppx')).toBe(
      'max-resolution-dppx',
    );
  });

  it('handles PascalCase by inserting hyphen after first lower→upper boundary', () => {
    expect(lowerCaseToKebabCase('DisplayMode')).toBe('display-mode');
  });

  it('returns lowercase unchanged', () => {
    expect(lowerCaseToKebabCase('width')).toBe('width');
  });

  it('returns empty string unchanged', () => {
    expect(lowerCaseToKebabCase('')).toBe('');
  });

  it('handles strings with existing hyphens (does not double convert)', () => {
    expect(lowerCaseToKebabCase('min-Width')).toBe('min-width');
  });

  it('handles single character input', () => {
    expect(lowerCaseToKebabCase('A')).toBe('a');
    expect(lowerCaseToKebabCase('a')).toBe('a');
  });
});
