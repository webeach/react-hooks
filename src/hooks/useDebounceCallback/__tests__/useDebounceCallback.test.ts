import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebounceCallback } from '../useDebounceCallback';

function advanceTime(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('useDebounceCallback hook', () => {
  it('invokes the callback once after the delay', () => {
    const handleCallback = vi.fn();

    const { result, unmount } = renderHook(
      (props: { delayMilliseconds: number }) =>
        useDebounceCallback(handleCallback, props.delayMilliseconds),
      { initialProps: { delayMilliseconds: 300 } },
    );

    act(() => {
      result.current('A');
    });

    advanceTime(299);
    expect(handleCallback).toHaveBeenCalledTimes(0);
    advanceTime(1);
    expect(handleCallback).toHaveBeenCalledTimes(1);
    expect(handleCallback).toHaveBeenLastCalledWith('A');

    unmount();
  });

  it('resets the timer on rapid successive calls and uses the last arguments', () => {
    const handleCallback = vi.fn();

    const { result } = renderHook(() =>
      useDebounceCallback(handleCallback, 300),
    );

    act(() => {
      result.current('first');
    });
    advanceTime(150);

    act(() => {
      result.current('second');
    });
    advanceTime(299);
    expect(handleCallback).toHaveBeenCalledTimes(0);
    advanceTime(1);
    expect(handleCallback).toHaveBeenCalledTimes(1);
    expect(handleCallback).toHaveBeenLastCalledWith('second');
  });

  it('forwards multiple arguments to the callback (last call wins)', () => {
    const handleCallback = vi.fn();

    const { result } = renderHook(() =>
      useDebounceCallback(handleCallback, 200),
    );

    act(() => {
      result.current('x', 1, { a: 1 });
      result.current('y', 2, { b: 2 });
    });

    advanceTime(200);
    expect(handleCallback).toHaveBeenCalledTimes(1);
    expect(handleCallback).toHaveBeenLastCalledWith('y', 2, { b: 2 });
  });

  it('uses the latest callback provided across rerenders', () => {
    const handleFirst = vi.fn();
    const handleSecond = vi.fn();

    const { result, rerender } = renderHook(
      (props: { callback: (...args: unknown[]) => unknown }) =>
        useDebounceCallback(props.callback, 250),
      { initialProps: { callback: handleFirst } },
    );

    // switch to a new callback
    rerender({ callback: handleSecond });

    act(() => {
      result.current('payload');
    });

    advanceTime(250);
    expect(handleFirst).toHaveBeenCalledTimes(0);
    expect(handleSecond).toHaveBeenCalledTimes(1);
    expect(handleSecond).toHaveBeenLastCalledWith('payload');
  });

  it('keeps a stable debounced function identity across rerenders', () => {
    const handleCallback = vi.fn();

    const { result, rerender } = renderHook(
      (props: { delayMilliseconds: number }) =>
        useDebounceCallback(handleCallback, props.delayMilliseconds),
      { initialProps: { delayMilliseconds: 100 } },
    );

    const firstReference = result.current;

    rerender({ delayMilliseconds: 400 });
    expect(result.current).toBe(firstReference);

    rerender({ delayMilliseconds: 50 });
    expect(result.current).toBe(firstReference);
  });

  it('changing delay after scheduling does not affect the already scheduled call', () => {
    const handleCallback = vi.fn();

    const { result, rerender } = renderHook(
      (props: { delayMilliseconds: number }) =>
        useDebounceCallback(handleCallback, props.delayMilliseconds),
      { initialProps: { delayMilliseconds: 500 } },
    );

    act(() => {
      result.current('data');
    });

    rerender({ delayMilliseconds: 100 });

    advanceTime(499);
    expect(handleCallback).toHaveBeenCalledTimes(0);
    advanceTime(1);
    expect(handleCallback).toHaveBeenCalledTimes(1);
    expect(handleCallback).toHaveBeenLastCalledWith('data');
  });

  it('changing delay and calling again will use the new delay', () => {
    const handleCallback = vi.fn();

    const { result, rerender } = renderHook(
      (props: { delayMilliseconds: number }) =>
        useDebounceCallback(handleCallback, props.delayMilliseconds),
      { initialProps: { delayMilliseconds: 500 } },
    );

    act(() => {
      result.current('first');
    });

    advanceTime(200);

    // Update delay and call again to reschedule with the new delay
    rerender({ delayMilliseconds: 1000 });

    act(() => {
      result.current('second');
    });

    advanceTime(999);
    expect(handleCallback).toHaveBeenCalledTimes(0);
    advanceTime(1);
    expect(handleCallback).toHaveBeenCalledTimes(1);
    expect(handleCallback).toHaveBeenLastCalledWith('second');
  });

  it('clears the pending timeout on unmount (no late invocation)', () => {
    const handleCallback = vi.fn();

    const { result, unmount } = renderHook(() =>
      useDebounceCallback(handleCallback, 400),
    );

    act(() => {
      result.current('later');
    });

    unmount();
    advanceTime(400);
    expect(handleCallback).toHaveBeenCalledTimes(0);
  });

  it('debounces many rapid calls into a single invocation with the last values', () => {
    const handleCallback = vi.fn();

    const { result } = renderHook(() =>
      useDebounceCallback(handleCallback, 100),
    );

    act(() => {
      result.current('a');
      result.current('b', 2);
      result.current('c', 3, { deep: true });
    });

    advanceTime(100);

    expect(handleCallback).toHaveBeenCalledTimes(1);
    expect(handleCallback).toHaveBeenLastCalledWith('c', 3, { deep: true });
  });
});
