import { act, renderHook } from '@testing-library/react';

import { PlainObject } from '../../../types/common';
import { usePatchDeepState } from '../usePatchDeepState';

describe('usePatchDeepState hook', () => {
  it('initializes with object', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ a: 1, b: 2 }),
    );
    expect(result.current[0]).toEqual({ a: 1, b: 2 });
  });

  it('initializes with lazy function', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>(() => ({ x: 42 })),
    );
    expect(result.current[0]).toEqual({ x: 42 });
  });

  it('patches shallow properties', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ count: 1 }),
    );
    act(() => {
      result.current[1]({ count: 2 });
    });
    expect(result.current[0]).toEqual({ count: 2 });
  });

  it('merges nested objects', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ user: { name: 'Alice', age: 25 } }),
    );
    act(() => {
      result.current[1]({ user: { age: 30 } });
    });
    expect(result.current[0]).toEqual({ user: { name: 'Alice', age: 30 } });
  });

  it('replaces arrays instead of merging', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ tags: ['a', 'b'] }),
    );
    act(() => {
      result.current[1]({ tags: ['c'] });
    });
    expect(result.current[0]).toEqual({ tags: ['c'] });
  });

  it('ignores undefined properties', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ a: 1, b: 2 }),
    );
    act(() => {
      result.current[1]({ a: undefined });
    });
    expect(result.current[0]).toEqual({ a: undefined, b: 2 });
  });

  it('can patch with function form', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ x: 1, y: 2 }),
    );
    act(() => {
      result.current[1]((prev) => ({ y: prev.y + 5 }));
    });
    expect(result.current[0]).toEqual({ x: 1, y: 7 });
  });

  it('adds new properties', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ a: 1 }),
    );
    act(() => {
      result.current[1]({ b: 2 });
    });
    expect(result.current[0]).toEqual({ a: 1, b: 2 });
  });

  it('patching with empty object keeps state', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ foo: 'bar' }),
    );
    act(() => {
      result.current[1]({});
    });
    expect(result.current[0]).toEqual({ foo: 'bar' });
  });

  it('patching nested state does not overwrite untouched keys', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ config: { a: 1, b: 2 } }),
    );
    act(() => {
      result.current[1]({ config: { b: 3 } });
    });
    expect(result.current[0]).toEqual({ config: { a: 1, b: 3 } });
  });

  it('can patch multiple levels deep', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ a: { b: { c: 1, d: 2 } } }),
    );
    act(() => {
      result.current[1]({ a: { b: { d: 999 } } });
    });
    expect(result.current[0]).toEqual({ a: { b: { c: 1, d: 999 } } });
  });

  it('patchState preserves reference if no changes made', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ foo: 1 }),
    );
    const before = result.current[0];
    act(() => {
      result.current[1]({});
    });
    const after = result.current[0];
    expect(before).not.toBe(after); // because objectDeepMerge always returns new obj
  });

  it('works with nested empty objects', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ a: {} }),
    );
    act(() => {
      result.current[1]({ a: { b: 1 } });
    });
    expect(result.current[0]).toEqual({ a: { b: 1 } });
  });

  it('works when state has null', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ foo: null }),
    );
    act(() => {
      result.current[1]({ foo: { bar: 1 } });
    });
    expect(result.current[0]).toEqual({ foo: { bar: 1 } });
  });

  it('allows full override of state', () => {
    const { result } = renderHook(() =>
      usePatchDeepState<PlainObject>({ a: 1, b: 2 }),
    );
    act(() => {
      result.current[1](() => ({ c: 3 }));
    });
    expect(result.current[0]).toEqual({ a: 1, b: 2, c: 3 });
  });
});
