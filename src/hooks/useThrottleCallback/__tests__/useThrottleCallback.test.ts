import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useThrottleCallback } from '../useThrottleCallback';

/**
 * Deterministic time helpers: fake timers + stubbed performance.now
 */
let currentNow = 0;
let performanceNowSpy: ReturnType<typeof vi.spyOn> | null = null;

function advance(milliseconds: number) {
  act(() => {
    currentNow += milliseconds;
    vi.advanceTimersByTime(milliseconds);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  currentNow = 0;
  performanceNowSpy = vi
    .spyOn(performance, 'now')
    .mockImplementation(() => currentNow);
});

afterEach(() => {
  performanceNowSpy?.mockRestore();
  vi.clearAllTimers();
  vi.useRealTimers();
});

/**
 * Access helper
 */
function getThrottledFn<T extends any[]>(result: { current: any }) {
  return result.current as (...args: T) => void;
}

describe('useThrottleCallback hook', () => {
  it('executes immediately on the first call (leading)', () => {
    const handle = vi.fn();

    const { result, unmount } = renderHook(() =>
      useThrottleCallback(handle, 1000),
    );

    act(() => getThrottledFn(result)('A'));
    expect(handle).toHaveBeenCalledTimes(1);
    expect(handle).toHaveBeenLastCalledWith('A');

    unmount();
  });

  it('schedules a single trailing call within the window with the latest arguments', () => {
    const handle = vi.fn();

    const { result } = renderHook(() => useThrottleCallback(handle, 1000));

    // t = 0: leading immediate
    act(() => getThrottledFn(result)('first'));
    expect(handle).toHaveBeenCalledTimes(1);

    // t = 100: call again inside window => schedule trailing
    advance(100);
    act(() => getThrottledFn(result)('second'));
    expect(handle).toHaveBeenCalledTimes(1); // still only leading so far

    // t = 600: still inside window
    advance(500);
    act(() => getThrottledFn(result)('third'));
    expect(handle).toHaveBeenCalledTimes(1);

    // At end of original window (t = 1000), trailing should fire once with latest args
    advance(400);
    expect(handle).toHaveBeenCalledTimes(2);
    expect(handle).toHaveBeenLastCalledWith('third');
  });

  it('starts a new window after the wait period and executes immediately again', () => {
    const handle = vi.fn();

    const { result } = renderHook(() => useThrottleCallback(handle, 300));

    // first window
    act(() => getThrottledFn(result)('x'));
    expect(handle).toHaveBeenCalledTimes(1);

    // wait past window; next call should be immediate again
    advance(301);
    act(() => getThrottledFn(result)('y'));
    expect(handle).toHaveBeenCalledTimes(2);
    expect(handle).toHaveBeenLastCalledWith('y');
  });

  it('does not reschedule trailing more than once within the same window (coalesces)', () => {
    const handle = vi.fn();

    const { result } = renderHook(() => useThrottleCallback(handle, 500));

    act(() => getThrottledFn(result)('a')); // leading

    // multiple calls inside the same window
    advance(50);
    act(() => getThrottledFn(result)('b'));
    advance(50);
    act(() => getThrottledFn(result)('c'));
    advance(50);
    act(() => getThrottledFn(result)('d'));

    // Only one trailing should fire at t=500, with 'd'
    advance(349);
    expect(handle).toHaveBeenCalledTimes(1);
    advance(1);
    expect(handle).toHaveBeenCalledTimes(2);
    expect(handle).toHaveBeenLastCalledWith('d');
  });

  it('changing delay after scheduling does not affect the already scheduled trailing run', () => {
    const handle = vi.fn();

    const { result, rerender } = renderHook(
      (props: { delay: number }) => useThrottleCallback(handle, props.delay),
      { initialProps: { delay: 1000 } },
    );

    // t=0: leading immediate
    act(() => getThrottledFn(result)('A'));
    expect(handle).toHaveBeenCalledTimes(1);

    // t=100: schedule trailing
    advance(100);
    act(() => getThrottledFn(result)('B'));

    // Change delay to smaller but do not call again
    rerender({ delay: 100 });

    // Trailing should still fire at the end of the original 1000ms window
    advance(899); // t=999
    expect(handle).toHaveBeenCalledTimes(1);
    advance(1); // t=1000
    expect(handle).toHaveBeenCalledTimes(2);
    expect(handle).toHaveBeenLastCalledWith('B');
  });

  it('uses the new delay for subsequent windows/calls after rerender', () => {
    const handle = vi.fn();

    const { result, rerender } = renderHook(
      (props: { delay: number }) => useThrottleCallback(handle, props.delay),
      { initialProps: { delay: 1000 } },
    );

    // First window
    act(() => getThrottledFn(result)('A'));

    // Wait past the 1000ms window so next call is immediate
    advance(1001);

    // Update delay to 200ms
    rerender({ delay: 200 });

    // New window with new delay
    act(() => getThrottledFn(result)('B')); // leading immediate
    expect(handle).toHaveBeenCalledTimes(2);

    // Call inside new 200ms window -> schedule trailing at +200
    advance(50);
    act(() => getThrottledFn(result)('C'));

    advance(149);
    expect(handle).toHaveBeenCalledTimes(2);
    advance(1);
    expect(handle).toHaveBeenCalledTimes(3);
    expect(handle).toHaveBeenLastCalledWith('C');
  });

  it('picks up the latest callback across rerenders (both leading and trailing)', () => {
    const first = vi.fn();
    const second = vi.fn();

    const { result, rerender } = renderHook(
      (props: { cb: (...args: any[]) => unknown; delay: number }) =>
        useThrottleCallback(props.cb, props.delay),
      { initialProps: { cb: first, delay: 400 } },
    );

    // Leading with first
    act(() => getThrottledFn(result)('x'));
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(0);

    // Switch to second before trailing fires
    advance(100);
    rerender({ cb: second, delay: 400 });

    // Call again to ensure a trailing is scheduled; it should call `second`
    act(() => getThrottledFn(result)('y'));

    advance(299); // t=399
    expect(second).toHaveBeenCalledTimes(0);
    advance(1); // t=400
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenLastCalledWith('y');
  });

  it('keeps throttled function identity stable across rerenders', () => {
    const handle = vi.fn();

    const { result, rerender } = renderHook(
      (props: { delay: number }) => useThrottleCallback(handle, props.delay),
      { initialProps: { delay: 250 } },
    );

    const ref1 = result.current;
    rerender({ delay: 500 });
    const ref2 = result.current;
    expect(ref2).toBe(ref1);
  });

  it('clears pending trailing timeout on unmount (no late execution)', () => {
    const handle = vi.fn();

    const { result, unmount } = renderHook(() =>
      useThrottleCallback(handle, 300),
    );

    act(() => getThrottledFn(result)('lead'));
    advance(100);
    act(() => getThrottledFn(result)('trail'));

    unmount();
    advance(1000);
    expect(handle).toHaveBeenCalledTimes(1); // only the leading call happened
  });

  it('does not schedule trailing if there are no additional calls within the window', () => {
    const handle = vi.fn();

    const { result } = renderHook(() => useThrottleCallback(handle, 200));

    act(() => getThrottledFn(result)('only'));
    expect(handle).toHaveBeenCalledTimes(1);

    advance(1000);
    expect(handle).toHaveBeenCalledTimes(1); // still only leading
  });
});
