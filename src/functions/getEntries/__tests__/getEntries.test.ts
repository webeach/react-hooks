import { getEntries } from '../getEntries';

describe('getEntries function', () => {
  it('returns entries with string keys', () => {
    const obj = { foo: 1, bar: 'baz' };
    const entries = getEntries(obj);

    expect(entries).toEqual([
      ['foo', 1],
      ['bar', 'baz'],
    ]);
  });

  it('normalizes number keys to string form', () => {
    const obj = { 0: true, 42: false };
    const entries = getEntries(obj);

    expect(entries).toEqual([
      ['0', true],
      ['42', false],
    ]);
  });

  it('excludes symbol keys by default', () => {
    const sym = Symbol('s');
    const obj = { foo: 1, [sym]: 2 };

    const entries = getEntries(obj);
    expect(entries).toEqual([['foo', 1]]);
  });

  it('includes symbol keys when flag is set', () => {
    const sym = Symbol('s');
    const obj = { foo: 1, [sym]: 2 };

    const entries = getEntries(obj, true);
    expect(entries).toEqual([
      ['foo', 1],
      [sym, 2],
    ]);
  });

  it('handles mixed string, number, and symbol keys', () => {
    const sym = Symbol('s');
    const obj = { foo: 1, 0: 2, [sym]: 3 };

    const withoutSymbols = getEntries(obj);
    expect(withoutSymbols).toEqual([
      ['0', 2],
      ['foo', 1],
    ]);

    const withSymbols = getEntries(obj, true);
    expect(withSymbols).toEqual([
      ['0', 2],
      ['foo', 1],
      [sym, 3],
    ]);
  });
});
