import { act, renderHook } from '@testing-library/react';

import { useTimeoutExtended } from '../useTimeoutExtended';

/**
 * Test suite for useTimeoutExtended
 * - Timer is fully manual (no auto start)
 * - start()/restart() schedule timer
 * - cancel() stops it
 * - delayMs changes mid-flight reschedule remaining time if run was NOT override
 * - overrideDelayMs forces fresh run that ignores external delayMs changes
 */
describe('useTimeoutExtended hook', () => {
  // We fake timers and also stub performance.now() to be deterministic
  let now = 0;

  beforeAll(() => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  beforeEach(() => {
    now = 0;
  });

  afterAll(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    (performance.now as any).mockRestore?.();
  });

  const advance = (ms: number) => {
    now += ms;
    vi.advanceTimersByTime(ms);
  };

  it('does not start automatically (manual control)', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeoutExtended(callback, 500));

    expect(result.current.isPending).toBe(false);
    expect(result.current.isDone).toBe(false);

    advance(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('start() without override uses default delayMs from hook args', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeoutExtended(callback, 300));

    act(() => {
      result.current.start();
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.isDone).toBe(false);

    advance(299);
    expect(callback).not.toHaveBeenCalled();

    advance(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isDone).toBe(true);
  });

  it('start(override) forces a fresh run and ignores later delayMs changes', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ ms }) => useTimeoutExtended(callback, ms),
      {
        initialProps: { ms: 1000 },
      },
    );

    // start with override 2000ms
    act(() => {
      result.current.start(2000);
    });

    // change external ms to 100 -- should be ignored for this run
    rerender({ ms: 100 });

    advance(1999);
    expect(callback).not.toHaveBeenCalled();

    advance(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('changing delayMs mid-flight (no override) reschedules remaining time from original start', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ ms }) => useTimeoutExtended(callback, ms),
      {
        initialProps: { ms: 1000 },
      },
    );

    act(() => {
      result.current.start();
    });

    advance(400); // 400ms passed

    // new total should be 600ms from original start => remaining 200ms
    rerender({ ms: 600 });

    advance(199);
    expect(callback).not.toHaveBeenCalled();

    advance(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancel() stops a pending timer and returns true, subsequent cancel returns false', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeoutExtended(callback, 500));

    act(() => {
      result.current.start();
    });

    let cancelled: boolean;
    act(() => {
      cancelled = result.current.cancel();
    });
    expect(cancelled!).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isDone).toBe(false);

    advance(1000);
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      cancelled = result.current.cancel();
    });
    expect(cancelled!).toBe(false);
  });

  it('unmount cancels the timer (no callback called)', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() =>
      useTimeoutExtended(callback, 300),
    );

    act(() => {
      result.current.start();
    });

    unmount();

    advance(300);
    expect(callback).not.toHaveBeenCalled();
  });

  it('actualTime passed to callback reflects measured elapsed time', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeoutExtended(callback, 250));

    act(() => {
      result.current.start();
    });

    advance(260);
    expect(callback).toHaveBeenCalledTimes(1);

    // Assert that callback received a number close to 260ms
    expect(callback).toHaveBeenLastCalledWith(expect.closeTo(260, 2));
  });

  it('supports zero delay (fires on next tick)', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeoutExtended(callback, 0));

    act(() => {
      result.current.start();
    });

    // advance by 0 to flush zero-delay timers
    advance(0);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isDone).toBe(true);
    expect(result.current.isPending).toBe(false);
  });

  it('restart is an alias of start', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeoutExtended(callback, 300));

    act(() => {
      result.current.start();
    });

    advance(150);

    // restart() should reschedule from zero using default delay (300ms)
    act(() => {
      result.current.restart();
    });

    advance(299);
    expect(callback).not.toHaveBeenCalled();

    advance(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('multiple sequential runs update state transitions correctly', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeoutExtended(callback, 100));

    // run #1
    act(() => {
      result.current.start();
    });
    expect(result.current.isPending).toBe(true);
    expect(result.current.isDone).toBe(false);
    advance(100);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isDone).toBe(true);

    // run #2
    act(() => {
      result.current.start();
    });
    expect(result.current.isPending).toBe(true);
    expect(result.current.isDone).toBe(false);
    advance(100);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isDone).toBe(true);
  });

  it('start(override) then change external delayMs should NOT reschedule this run', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ ms }) => useTimeoutExtended(callback, ms),
      {
        initialProps: { ms: 1000 },
      },
    );

    act(() => {
      result.current.start(400); // override 400
    });

    // even if we bump external ms to 2000, this run must ignore it
    rerender({ ms: 2000 });

    advance(399);
    expect(callback).not.toHaveBeenCalled();
    advance(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
