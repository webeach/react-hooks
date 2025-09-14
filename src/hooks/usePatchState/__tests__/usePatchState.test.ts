import { act, renderHook } from '@testing-library/react';

import { usePatchState } from '../usePatchState';

describe('usePatchState hook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => usePatchState({ a: 1, b: 2 }));
    expect(result.current[0]).toEqual({ a: 1, b: 2 });
  });

  it('updates state with partial patch', () => {
    const { result } = renderHook(() =>
      usePatchState({ name: 'Alice', age: 20 }),
    );
    act(() => result.current[1]({ age: 21 }));
    expect(result.current[0]).toEqual({ name: 'Alice', age: 21 });
  });

  it('updates state with functional patch', () => {
    const { result } = renderHook(() => usePatchState({ counter: 0 }));
    act(() => result.current[1]((prev) => ({ counter: prev.counter + 1 })));
    expect(result.current[0].counter).toBe(1);
  });

  it('applies multiple patches in sequence', () => {
    const { result } = renderHook(() => usePatchState({ a: 1, b: 2 }));
    act(() => {
      result.current[1]({ a: 3 });
      result.current[1]({ b: 4 });
    });
    expect(result.current[0]).toEqual({ a: 3, b: 4 });
  });

  it('preserves unchanged fields', () => {
    const { result } = renderHook(() => usePatchState({ x: 10, y: 20 }));
    act(() => result.current[1]({ x: 99 }));
    expect(result.current[0].y).toBe(20);
  });

  it('handles initialState as function', () => {
    const { result } = renderHook(() =>
      usePatchState(() => ({ status: 'idle' })),
    );
    expect(result.current[0].status).toBe('idle');
  });

  it('returns stable patch function', () => {
    const { result, rerender } = renderHook(() => usePatchState({ foo: 1 }));
    const firstPatch = result.current[1];
    rerender();
    expect(result.current[1]).toBe(firstPatch);
  });

  it('works with empty object', () => {
    const { result } = renderHook(() => usePatchState<{ a?: number }>({}));
    act(() => result.current[1]({ a: 123 }));
    expect(result.current[0].a).toBe(123);
  });

  it('supports boolean values', () => {
    const { result } = renderHook(() => usePatchState({ isOpen: false }));
    act(() => result.current[1]({ isOpen: true }));
    expect(result.current[0].isOpen).toBe(true);
  });

  it('supports nested object updates (shallow merge)', () => {
    const { result } = renderHook(() =>
      usePatchState({ user: { name: 'Alice' }, age: 25 }),
    );
    act(() => result.current[1]({ age: 26 }));
    expect(result.current[0]).toEqual({ user: { name: 'Alice' }, age: 26 });
  });
});
