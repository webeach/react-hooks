import { act, renderHook } from '@testing-library/react';

import { useSet } from '../useSet';

describe('useSet hook', () => {
  it('returns a set with initial values', () => {
    const { result } = renderHook(() => useSet(['a', 'b']));

    expect(result.current.has('a')).toBe(true);
    expect(result.current.has('b')).toBe(true);
    expect(result.current.size).toBe(2);
  });

  it('set updates with .add()', () => {
    const { result } = renderHook(() => useSet<string>());
    act(() => result.current.add('foo'));
    expect(result.current.has('foo')).toBe(true);
  });

  it('set updates with .delete()', () => {
    const { result } = renderHook(() => useSet(['x']));
    act(() => result.current.delete('x'));
    expect(result.current.has('x')).toBe(false);
  });

  it('set clears with .clear()', () => {
    const { result } = renderHook(() => useSet(['a', 'b']));
    act(() => result.current.clear());
    expect(result.current.size).toBe(0);
  });

  it('replaceAll overrides all values', () => {
    const { result } = renderHook(() => useSet(['a']));
    act(() => result.current.replaceAll(['z']));
    expect(result.current.has('z')).toBe(true);
    expect(result.current.has('a')).toBe(false);
    expect(result.current.size).toBe(1);
  });

  it('add does not duplicate existing value', () => {
    const { result } = renderHook(() => useSet(['a']));
    act(() => {
      result.current.add('a');
      result.current.add('a');
    });
    expect(result.current.size).toBe(1);
  });

  it('delete returns false if value not found', () => {
    const { result } = renderHook(() => useSet<string>());
    let deleted = true;
    act(() => {
      deleted = result.current.delete('none');
    });
    expect(deleted).toBe(false);
  });

  it('clear does not change size if already empty', () => {
    const { result } = renderHook(() => useSet());
    act(() => {
      result.current.clear();
    });
    expect(result.current.size).toBe(0);
  });

  it('replaceAll with empty array on empty set does nothing', () => {
    const { result } = renderHook(() => useSet());
    act(() => {
      result.current.replaceAll([]);
    });
    expect(result.current.size).toBe(0);
  });

  it('works with number values', () => {
    const { result } = renderHook(() => useSet<number>([1]));
    expect(result.current.has(1)).toBe(true);
  });

  it('works with boolean values', () => {
    const { result } = renderHook(() => useSet<boolean>([true]));
    expect(result.current.has(true)).toBe(true);
  });

  it('works with object values', () => {
    const obj = { id: 1 };
    const { result } = renderHook(() => useSet([obj]));
    expect(result.current.has(obj)).toBe(true);
  });

  it('returns same instance between renders', () => {
    const { result, rerender } = renderHook(() => useSet());
    const firstRef = result.current;
    rerender();
    expect(result.current).toBe(firstRef);
  });

  it('multiple .add() calls accumulate', () => {
    const { result } = renderHook(() => useSet<string>());
    act(() => {
      result.current.add('a');
      result.current.add('b');
      result.current.add('c');
    });
    expect(result.current.size).toBe(3);
    expect(result.current.has('a')).toBe(true);
    expect(result.current.has('b')).toBe(true);
    expect(result.current.has('c')).toBe(true);
  });

  it('can handle large number of values', () => {
    const bigArray: ReadonlyArray<number> = Array.from(
      { length: 1000 },
      (_, i) => i,
    );
    const { result } = renderHook(() => useSet(bigArray));
    expect(result.current.size).toBe(1000);
    expect(result.current.has(999)).toBe(true);
  });
});
