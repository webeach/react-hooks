import { act, renderHook } from '@testing-library/react';

import { useTimeout } from '../useTimeout';

describe('useTimeout hook', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return false before timeout fires', () => {
    const { result } = renderHook(() => {
      const [isDone] = useTimeout(1000);
      return isDone;
    });

    expect(result.current).toBe(false);
  });

  it('should return true after timeout fires', () => {
    const { result } = renderHook(() => {
      const [isDone] = useTimeout(1000);
      return isDone;
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(true);
  });

  it('should call the callback after the specified time', () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 500));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call the callback before the timeout', () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should use latest callback if updated', () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ callback }) => useTimeout(callback, 1000),
      {
        initialProps: { callback: first },
      },
    );

    rerender({ callback: second });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
  });

  it('should reset timeout if ms changes before firing', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(({ ms }) => useTimeout(callback, ms), {
      initialProps: { ms: 1000 },
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });

    rerender({ ms: 2000 });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalled();
  });

  it('should not call callback if unmounted before timeout', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useTimeout(callback, 500));

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should support using isDone without callback', () => {
    const { result } = renderHook(() => {
      const [isDone] = useTimeout(300);
      return isDone;
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(true);
  });
});
