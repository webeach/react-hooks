import { describe, expect, it } from 'vitest';

import { PlainObject } from '../../../types/common';
import { objectDeepMerge } from '../objectDeepMerge';

describe('objectDeepMerge function', () => {
  it('merges flat objects', () => {
    const result = objectDeepMerge<PlainObject>({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('merges nested plain objects', () => {
    const result = objectDeepMerge<PlainObject>(
      { a: { b: 1 } },
      { a: { c: 2 } },
    );
    expect(result).toEqual({ a: { b: 1, c: 2 } });
  });

  it('overwrites non-object values', () => {
    const result = objectDeepMerge<PlainObject>({ a: 1 }, { a: 2 });
    expect(result).toEqual({ a: 2 });
  });

  it('deep merges multiple levels', () => {
    const result = objectDeepMerge<PlainObject>(
      { a: { b: { c: 1 } } },
      { a: { b: { d: 2 } } },
    );
    expect(result).toEqual({ a: { b: { c: 1, d: 2 } } });
  });

  it('replaces arrays instead of merging them', () => {
    const result = objectDeepMerge<PlainObject>({ a: [1, 2] }, { a: [3] });
    expect(result).toEqual({ a: [3] });
  });

  it('does not mutate target object', () => {
    const target = { a: { b: 1 } };
    objectDeepMerge<PlainObject>(target, { a: { c: 2 } });
    expect(target).toEqual({ a: { b: 1 } });
  });

  it('does not mutate patch object', () => {
    const patch = { a: { b: 2 } };
    objectDeepMerge<PlainObject>({ a: { b: 1 } }, patch);
    expect(patch).toEqual({ a: { b: 2 } });
  });

  it('handles empty patch object', () => {
    const result = objectDeepMerge<PlainObject>({ a: 1 }, {});
    expect(result).toEqual({ a: 1 });
  });

  it('handles empty target object', () => {
    const result = objectDeepMerge<PlainObject>({}, { a: 1 });
    expect(result).toEqual({ a: 1 });
  });

  it('handles both objects empty', () => {
    const result = objectDeepMerge<PlainObject>({}, {});
    expect(result).toEqual({});
  });

  it('deep merges when both levels are plain objects', () => {
    const result = objectDeepMerge<PlainObject>(
      { a: { b: 1, c: 2 } },
      { a: { c: 3, d: 4 } },
    );
    expect(result).toEqual({ a: { b: 1, c: 3, d: 4 } });
  });

  it('replaces function values', () => {
    const result = objectDeepMerge<PlainObject>({ a: () => 1 }, { a: () => 2 });
    expect(typeof result.a).toBe('function');
  });

  it('replaces date objects', () => {
    const date = new Date();
    const result = objectDeepMerge<PlainObject>(
      { a: new Date(0) },
      { a: date },
    );
    expect(result.a).toBe(date);
  });

  it('does not merge class instances', () => {
    class Test {
      value = 123;
    }
    const instance = new Test();
    const result = objectDeepMerge<PlainObject>({ a: {} }, { a: instance });
    expect(result.a).toBe(instance);
  });

  it('handles undefined values in patch', () => {
    const result = objectDeepMerge<PlainObject>({ a: 1 }, { a: undefined });
    expect(result).toEqual({ a: undefined });
  });

  it('handles null values in patch', () => {
    const result = objectDeepMerge<PlainObject>({ a: { b: 1 } }, { a: null });
    expect(result).toEqual({ a: null });
  });

  it('preserves nested values not present in patch', () => {
    const result = objectDeepMerge<PlainObject>(
      { a: { b: 1, c: 2 } },
      { a: { b: 3 } },
    );
    expect(result).toEqual({ a: { b: 3, c: 2 } });
  });

  it('preserves prototype values on assigned objects', () => {
    const result = objectDeepMerge<PlainObject>(
      { a: {} },
      { a: Object.create({ b: 1 }) },
    );
    expect(result.a).toHaveProperty('b'); // inherited
    expect(Object.hasOwn(result.a, 'b')).toBe(false);
  });

  it('supports multiple top-level keys', () => {
    const result = objectDeepMerge<PlainObject>({ a: 1, b: 2 }, { b: 3, c: 4 });
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });
});
