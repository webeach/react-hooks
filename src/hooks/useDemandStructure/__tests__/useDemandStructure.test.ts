import { renderHook } from '@testing-library/react';

import { $DemandStructureUsingSymbol } from '../constants';
import { useDemandStructure } from '../useDemandStructure';

describe('useDemandStructure hook', () => {
  it('returns correct tuple values with lazy evaluation', () => {
    const result = renderHook(() => useDemandStructure([() => 'a', () => 'b']))
      .result.current;

    expect(result[0]).toBe('a');
    expect(result[1]).toBe('b');
  });

  it('returns correct object values with lazy evaluation', () => {
    const result = renderHook(() =>
      useDemandStructure({
        foo: () => 'bar',
        baz: () => 42,
      }),
    ).result.current;

    expect(result.foo).toBe('bar');
    expect(result.baz).toBe(42);
  });

  it('evaluates properties only on access (tuple)', () => {
    const spy = vi.fn(() => 'lazy');
    const result = renderHook(() => useDemandStructure([spy])).result.current;

    expect(spy).not.toHaveBeenCalled();
    expect(result[0]).toBe('lazy');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('evaluates properties only on access (object)', () => {
    const spy = vi.fn(() => 'lazy');
    const result = renderHook(() => useDemandStructure({ a: spy })).result
      .current;

    expect(spy).not.toHaveBeenCalled();
    expect(result.a).toBe('lazy');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('supports destructuring for objects', () => {
    const result = renderHook(() =>
      useDemandStructure({
        one: () => 1,
        two: () => 2,
      } as const),
    ).result.current;

    const { one, two } = result;
    expect(one).toBe(1);
    expect(two).toBe(2);
  });

  it('supports destructuring for tuples', () => {
    const result = renderHook(() => useDemandStructure([() => 'x', () => 'y']))
      .result.current;

    const [a, b] = result;
    expect(a).toBe('x');
    expect(b).toBe('y');
  });

  it('does not cache results across accesses', () => {
    let count = 0;
    const result = renderHook(() => useDemandStructure([() => ++count])).result
      .current;

    expect(result[0]).toBe(1);
    expect(result[0]).toBe(2);
    expect(result[0]).toBe(3);
  });

  it('can handle mixed type tuples', () => {
    const result = renderHook(() =>
      useDemandStructure([() => true, () => 'hello', () => 123]),
    ).result.current;

    expect(result[0]).toBe(true);
    expect(result[1]).toBe('hello');
    expect(result[2]).toBe(123);
  });

  it('returns enumerable properties for objects', () => {
    const result = renderHook(() =>
      useDemandStructure({
        x: () => 1,
        y: () => 2,
      }),
    ).result.current;

    expect(Object.keys(result)).toEqual(['x', 'y']);
  });

  it('returns enumerable properties for tuples', () => {
    const result = renderHook(() => useDemandStructure([() => 1, () => 2]))
      .result.current;

    expect(Object.keys(result)).toEqual(['0', '1']);
  });

  it('supports iteration for tuples', () => {
    const result = renderHook(() => useDemandStructure([() => 'a', () => 'b']))
      .result.current;

    expect([...result]).toEqual(['a', 'b']);
  });

  it('ignores extra object prototype properties', () => {
    const result = renderHook(() =>
      useDemandStructure({ a: () => 1, toString: () => 'custom' }),
    ).result.current;

    expect(result.a).toBe(1);
    expect(result.toString).toBe('custom');
  });

  it('handles large number of tuple elements', () => {
    const result = renderHook(() =>
      useDemandStructure(Array.from(Array(10), (_, i) => () => i)),
    ).result.current;

    expect(result).toHaveLength(10);
    expect(Object.values(result)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('handles empty object input', () => {
    const result = renderHook(() => useDemandStructure({})).result.current;
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('handles empty tuple input', () => {
    const result = renderHook(() => useDemandStructure([])).result.current;

    expect(result).toHaveLength(0);
  });

  it('supports alias-based accessors with both index and alias access', () => {
    const result = renderHook(() =>
      useDemandStructure([
        { alias: 'foo', accessor: () => 123 },
        { alias: 'bar', accessor: () => 'hello' },
      ]),
    ).result.current;

    expect(result[0]).toBe(123);
    expect(result[1]).toBe('hello');
    expect(result.foo).toBe(123);
    expect(result.bar).toBe('hello');
  });

  it('supports mixed access (destructuring and alias)', () => {
    const result = renderHook(() =>
      useDemandStructure([
        { alias: 'x', accessor: () => 'A' },
        { alias: 'y', accessor: () => 'B' },
      ]),
    ).result.current;

    const [a, b] = result;
    expect(a).toBe('A');
    expect(b).toBe('B');
    expect(result.x).toBe('A');
    expect(result.y).toBe('B');
  });

  it('calls accessor only on access for alias-based', () => {
    const spy1 = vi.fn(() => 1);
    const spy2 = vi.fn(() => 2);

    const result = renderHook(() =>
      useDemandStructure([
        { alias: 'a', accessor: spy1 },
        { alias: 'b', accessor: spy2 },
      ]),
    ).result.current;

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();

    expect(result[0]).toBe(1);
    expect(spy1).toHaveBeenCalledOnce();

    expect(result.b).toBe(2);
    expect(spy2).toHaveBeenCalledOnce();
  });

  it('alias and index access return same value each time (no caching)', () => {
    let count = 0;
    const result = renderHook(() =>
      useDemandStructure([{ alias: 'num', accessor: () => ++count }]),
    ).result.current;

    expect(result[0]).toBe(1);
    expect(result.num).toBe(2);
    expect(result[0]).toBe(3);
    expect(result.num).toBe(4);
  });

  it('alias keys are enumerable', () => {
    const result = renderHook(() =>
      useDemandStructure([
        { alias: 'one', accessor: () => 1 },
        { alias: 'two', accessor: () => 2 },
      ]),
    ).result.current;

    const keys = Object.keys(result);
    expect(keys).toContain('0');
    expect(keys).toContain('1');
    expect(keys).toContain('one');
    expect(keys).toContain('two');
  });

  it('tracks access via $DemandStructureUsingSymbol for tuple', () => {
    const result = renderHook(() => useDemandStructure([() => 'a', () => 'b']))
      .result.current;

    expect(result[$DemandStructureUsingSymbol]).toEqual({});

    void result[0];
    void result[1];

    expect(result[$DemandStructureUsingSymbol]).toEqual({ 0: true, 1: true });
  });

  it('tracks access via $DemandStructureUsingSymbol for object', () => {
    const result = renderHook(() =>
      useDemandStructure({ foo: () => 1, bar: () => 2 }),
    ).result.current;

    expect(result[$DemandStructureUsingSymbol]).toEqual({});

    void result.foo;
    void result.bar;

    expect(result[$DemandStructureUsingSymbol]).toEqual({
      foo: true,
      bar: true,
    });
  });

  it('tracks access for alias-based tuple (both index and alias)', () => {
    const result = renderHook(() =>
      useDemandStructure([
        { alias: 'x', accessor: () => 10 },
        { alias: 'y', accessor: () => 20 },
      ]),
    ).result.current;

    expect(result[$DemandStructureUsingSymbol]).toEqual({});

    void result[0];
    void result.y;

    expect(result[$DemandStructureUsingSymbol]).toEqual({
      0: true,
      1: true,
      x: true,
      y: true,
    });
  });
});
