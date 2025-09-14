import { act, renderHook } from '@testing-library/react';

import { useToggle } from '../useToggle';

describe('useToggle hook', () => {
  it('defaults to false (tuple)', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('respects initial value true (tuple)', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it('toggles from false to true (tuple)', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
  });

  it('toggles from true to false (tuple)', () => {
    const { result } = renderHook(() => useToggle(true));
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it('toggles twice returns to original (tuple)', () => {
    const { result } = renderHook(() => useToggle(true));
    act(() => {
      result.current[1]();
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);
  });

  it('forces value to true (tuple)', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });

  it('forces value to false (tuple)', () => {
    const { result } = renderHook(() => useToggle(true));
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
  });

  it('handles multiple forced values (tuple)', () => {
    const { result } = renderHook(() => useToggle());
    act(() => {
      result.current[1](true);
      result.current[1](false);
      result.current[1](true);
    });
    expect(result.current[0]).toBe(true);
  });

  it('interprets undefined as toggle (tuple)', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => {
      result.current[1](undefined);
    });
    expect(result.current[0]).toBe(true);
  });

  it('returns current value and toggle (object)', () => {
    const { result } = renderHook(() => {
      const { value, toggle } = useToggle(true);
      return { value, toggle };
    });

    expect(result.current.value).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.value).toBe(false);

    act(() => result.current.toggle(true));
    expect(result.current.value).toBe(true);
  });

  it('returns stable toggle function between renders (object)', () => {
    const { result, rerender } = renderHook(() => useToggle());
    const toggleBefore = result.current.toggle;
    rerender();
    expect(result.current.toggle).toBe(toggleBefore);
  });

  it('does not mutate original reference after toggle (tuple)', () => {
    const { result } = renderHook(() => useToggle(false));
    const before = result.current[0];
    act(() => result.current[1]());
    expect(result.current[0]).not.toBe(before);
  });
});
