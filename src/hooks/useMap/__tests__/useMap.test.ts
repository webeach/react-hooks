import { act, renderHook } from '@testing-library/react';

import { useMap } from '../useMap';

describe('useMap hook', () => {
  it('returns a map with initial entries', () => {
    const { result } = renderHook(() =>
      useMap([
        ['a', 1],
        ['b', 2],
      ]),
    );

    expect(result.current.get('a')).toBe(1);
    expect(result.current.get('b')).toBe(2);
  });

  it('map updates with .set()', () => {
    const { result } = renderHook(() => useMap());
    act(() => result.current.set('foo', 'bar'));
    expect(result.current.get('foo')).toBe('bar');
  });

  it('map updates with .delete()', () => {
    const { result } = renderHook(() => useMap([['x', 10]]));
    act(() => result.current.delete('x'));
    expect(result.current.has('x')).toBe(false);
  });

  it('map clears with .clear()', () => {
    const { result } = renderHook(() =>
      useMap([
        ['a', 1],
        ['b', 2],
      ]),
    );
    act(() => result.current.clear());
    expect(result.current.size).toBe(0);
  });

  it('replaceAll overrides all entries', () => {
    const { result } = renderHook(() => useMap([['a', 1]]));
    act(() => result.current.replaceAll([['z', 9]]));
    expect(result.current.get('z')).toBe(9);
    expect(result.current.has('a')).toBe(false);
  });

  it('set replaces existing key', () => {
    const { result } = renderHook(() => useMap([['a', 1]]));
    act(() => result.current.set('a', 2));
    expect(result.current.get('a')).toBe(2);
  });

  it('delete returns false if key not found', () => {
    const { result } = renderHook(() => useMap());
    let deleted = false;
    act(() => {
      deleted = result.current.delete('none');
    });
    expect(deleted).toBe(false);
  });

  it('clear does not trigger update if already empty', () => {
    const { result } = renderHook(() => useMap());
    act(() => {
      result.current.clear();
    });
    expect(result.current.size).toBe(0);
  });

  it('replaceAll with empty array on empty map does nothing', () => {
    const { result } = renderHook(() => useMap());
    act(() => {
      result.current.replaceAll([]);
    });
    expect(result.current.size).toBe(0);
  });

  it('works with number keys', () => {
    const { result } = renderHook(() => useMap<number, string>([[1, 'one']]));
    expect(result.current.get(1)).toBe('one');
  });

  it('works with boolean keys', () => {
    const { result } = renderHook(() =>
      useMap<boolean, string>([[true, 'yes']]),
    );
    expect(result.current.get(true)).toBe('yes');
  });

  it('works with object keys', () => {
    const key = { id: 1 };
    const { result } = renderHook(() => useMap([[key, 'data']]));
    expect(result.current.get(key)).toBe('data');
  });

  it('returns same instance between renders', () => {
    const { result, rerender } = renderHook(() => useMap());
    const firstRef = result.current;
    rerender();
    expect(result.current).toBe(firstRef);
  });

  it('multiple .set() calls accumulate', () => {
    const { result } = renderHook(() => useMap());
    act(() => {
      result.current.set('a', 1);
      result.current.set('b', 2);
      result.current.set('c', 3);
    });
    expect(result.current.size).toBe(3);
  });

  it('can handle large number of entries', () => {
    const bigArray: ReadonlyArray<[number, number]> = Array.from(
      { length: 1000 },
      (_, i) => [i, i],
    );
    const { result } = renderHook(() => useMap(bigArray));
    expect(result.current.size).toBe(1000);
    expect(result.current.get(999)).toBe(999);
  });
});
