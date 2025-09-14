import { act, renderHook } from '@testing-library/react';

import { useNumber } from '../useNumber';

describe('useNumber hook', () => {
  // === Object access ===

  it('initializes with 0 by default (object)', () => {
    const { result } = renderHook(() => useNumber());
    expect(result.current.value).toBe(0);
  });

  it('initializes with custom value (object)', () => {
    const { result } = renderHook(() => useNumber(5));
    expect(result.current.value).toBe(5);
  });

  it('increments by 1 by default (object)', () => {
    const { result } = renderHook(() => useNumber(10));

    act(() => {
      result.current.increment();
    });

    expect(result.current.value).toBe(11);
  });

  it('increments by custom step (object)', () => {
    const { result } = renderHook(() => useNumber(3));

    act(() => {
      result.current.increment(4);
    });

    expect(result.current.value).toBe(7);
  });

  it('decrements by 1 by default (object)', () => {
    const { result } = renderHook(() => useNumber(2));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.value).toBe(1);
  });

  it('decrements by custom step (object)', () => {
    const { result } = renderHook(() => useNumber(10));

    act(() => {
      result.current.decrement(3);
    });

    expect(result.current.value).toBe(7);
  });

  it('sets a specific value (object)', () => {
    const { result } = renderHook(() => useNumber(1));

    act(() => {
      result.current.setValue(42);
    });

    expect(result.current.value).toBe(42);
  });

  it('resets to initial value (object)', () => {
    const { result } = renderHook(() => useNumber(7));

    act(() => {
      result.current.increment(5);
      result.current.reset();
    });

    expect(result.current.value).toBe(7);
  });

  // === Tuple access ===

  it('supports tuple access', () => {
    const { result } = renderHook(() => useNumber(100));
    const [value, set, inc, dec, reset] = result.current;

    expect(value).toBe(100);

    act(() => {
      inc();
      dec(2);
      set(200);
      reset();
    });

    // Should return to 100 (initial)
    expect(result.current[0]).toBe(100);
  });

  // === Stability ===

  it('returns stable function references between renders', () => {
    const { result, rerender } = renderHook(() => useNumber(0));

    const incrementBefore = result.current.increment;
    const decrementBefore = result.current.decrement;
    const resetBefore = result.current.reset;
    const setBefore = result.current.setValue;

    rerender();

    expect(result.current.increment).toBe(incrementBefore);
    expect(result.current.decrement).toBe(decrementBefore);
    expect(result.current.reset).toBe(resetBefore);
    expect(result.current.setValue).toBe(setBefore);
  });
});
