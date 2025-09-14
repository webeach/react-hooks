import { shallowCompareArrays } from '../shallowCompareArrays';

describe('shallowCompareArrays function', () => {
  it('returns true for same reference', () => {
    const arr = [1, 2, 3];
    expect(shallowCompareArrays(arr, arr)).toBe(true);
  });

  it('returns true for shallow-equal primitive arrays', () => {
    expect(shallowCompareArrays([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('returns false for arrays of different lengths', () => {
    expect(shallowCompareArrays([1, 2], [1, 2, 3])).toBe(false);
  });

  it('returns false if any item differs by value', () => {
    expect(shallowCompareArrays([1, 2, 3], [1, 99, 3])).toBe(false);
  });

  it('returns false for equal-looking object elements with different references', () => {
    expect(shallowCompareArrays([{ a: 1 }], [{ a: 1 }])).toBe(false);
  });

  it('returns true if object references are the same', () => {
    const shared = { a: 1 };
    expect(shallowCompareArrays([shared, 2], [shared, 2])).toBe(true);
  });

  it('returns true for two empty arrays', () => {
    expect(shallowCompareArrays([], [])).toBe(true);
  });

  it('returns false if one is empty and the other is not', () => {
    expect(shallowCompareArrays([], [1])).toBe(false);
  });

  it('returns false for same-length arrays with different types', () => {
    expect(shallowCompareArrays([1, '2'], [1, 2])).toBe(false);
  });
});
