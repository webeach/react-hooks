import { getKeys } from '../getKeys';

describe('getKeys function', () => {
  it('returns string keys as-is', () => {
    const obj = { foo: 1, bar: 2 };
    const keys = getKeys(obj);
    expect(keys).toEqual(['foo', 'bar']);
  });

  it('normalizes number keys to string form', () => {
    const obj = { 0: 'a', 42: 'b' };
    const keys = getKeys(obj);
    expect(keys).toEqual(['0', '42']);
  });

  it('does not include symbol keys by default', () => {
    const sym = Symbol('s');
    const obj = { foo: 1, [sym]: 2 };
    const keys = getKeys(obj);
    expect(keys).toEqual(['foo']);
  });

  it('includes symbol keys when flag is set', () => {
    const sym = Symbol('s');
    const obj = { foo: 1, [sym]: 2 };
    const keys = getKeys(obj, true);
    expect(keys).toContain('foo');
    expect(keys).toContain(sym);
  });

  it('handles mixed string, number, and symbol keys correctly', () => {
    const sym = Symbol('s');
    const obj = { foo: 1, 0: 2, [sym]: 3 };

    const withoutSymbols = getKeys(obj);
    expect(withoutSymbols).toEqual(['0', 'foo']);

    const withSymbols = getKeys(obj, true);
    expect(withSymbols).toContain('foo');
    expect(withSymbols).toContain('0');
    expect(withSymbols).toContain(sym);
  });
});
