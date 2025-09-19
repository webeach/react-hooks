import { shallowCompareObjects } from '../shallowCompareObjects';

describe('shallowCompareObjects function', () => {
  it('returns true for same reference', () => {
    const obj = { a: 1, b: 2 };
    expect(shallowCompareObjects(obj, obj)).toBe(true);
  });

  it('returns true for shallow-equal primitive objects', () => {
    expect(shallowCompareObjects({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it('returns false for objects with different key sets', () => {
    expect(shallowCompareObjects({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(shallowCompareObjects({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });

  it('returns false if any value differs', () => {
    expect(shallowCompareObjects({ a: 1, b: 2 }, { a: 1, b: 99 })).toBe(false);
  });

  it('returns false for equal-looking nested objects with different references', () => {
    expect(shallowCompareObjects({ a: { x: 1 } }, { a: { x: 1 } })).toBe(false);
  });

  it('returns true if nested object references are the same', () => {
    const shared = { x: 1 };
    expect(shallowCompareObjects({ a: shared }, { a: shared })).toBe(true);
  });

  it('returns true for two empty objects', () => {
    expect(shallowCompareObjects({}, {})).toBe(true);
  });

  it('returns false if one object is empty and the other is not', () => {
    expect(shallowCompareObjects({}, { a: 1 })).toBe(false);
  });

  it('returns false if same keys have values of different types', () => {
    expect(shallowCompareObjects({ a: '1' }, { a: 1 })).toBe(false);
  });

  it('ignores prototype properties (compares only own keys)', () => {
    const proto = { a: 1 };
    const obj1 = Object.create(proto);
    const obj2 = {};
    expect(shallowCompareObjects(obj1, obj2)).toBe(true);
  });
});
