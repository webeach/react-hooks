import { isPlainObject } from '../isPlainObject';

describe('isPlainObject function', () => {
  it('returns true for {}', () => {
    expect(isPlainObject({})).toBe(true);
  });

  it('returns true for new Object()', () => {
    expect(isPlainObject(new Object())).toBe(true);
  });

  it('returns true for Object.create(null)', () => {
    const obj = Object.create(null);
    obj.foo = 'bar';
    expect(isPlainObject(obj)).toBe(true);
  });

  it('returns false for arrays', () => {
    expect(isPlainObject([])).toBe(false);
  });

  it('returns false for null', () => {
    expect(isPlainObject(null)).toBe(false);
  });

  it('returns false for Date objects', () => {
    expect(isPlainObject(new Date())).toBe(false);
  });

  it('returns false for RegExp objects', () => {
    expect(isPlainObject(/abc/)).toBe(false);
  });

  it('returns false for class instances', () => {
    class Test {}
    expect(isPlainObject(new Test())).toBe(false);
  });

  it('returns false for functions', () => {
    expect(isPlainObject(() => {})).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isPlainObject(42)).toBe(false);
    expect(isPlainObject('string')).toBe(false);
    expect(isPlainObject(true)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject(Symbol('x'))).toBe(false);
  });

  it('returns true for object from different realm (simulated)', () => {
    const iframeLike = Object.create(Object.prototype);
    Object.setPrototypeOf(Object.getPrototypeOf(iframeLike), null);
    expect(isPlainObject(iframeLike)).toBe(true);
  });
});
