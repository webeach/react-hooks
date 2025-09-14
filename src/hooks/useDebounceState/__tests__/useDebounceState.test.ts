import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebounceState } from '../useDebounceState';

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

describe('useDebounceState hook', () => {
  it('initializes with undefined when only delay is provided', () => {
    const { result } = renderHook(() => useDebounceState<string>(300));

    const [state] = result.current;
    expect(state).toBeUndefined();
  });

  it('initializes with explicit initial state and updates after the delay', () => {
    const { result } = renderHook(() => useDebounceState<string>('', 300));

    const [initialState, setDebouncedState] = result.current;
    expect(initialState).toBe('');

    act(() => {
      setDebouncedState('alpha');
    });

    advanceTime(299);
    let [state] = result.current;
    expect(state).toBe('');

    advanceTime(1);
    [state] = result.current;
    expect(state).toBe('alpha');
  });

  it('collapses rapid calls and keeps only the last value', () => {
    const { result } = renderHook(() => useDebounceState<string>('', 200));

    const [, setDebouncedState] = result.current;

    act(() => {
      setDebouncedState('a');
      setDebouncedState('b');
      setDebouncedState('c');
    });

    advanceTime(199);
    let [state] = result.current;
    expect(state).toBe('');

    advanceTime(1);
    [state] = result.current;
    expect(state).toBe('c');
  });

  it('supports functional updates (last function wins)', () => {
    const { result } = renderHook(() => useDebounceState<number>(0, 150));

    const [, setDebouncedState] = result.current;

    act(() => {
      setDebouncedState((current) => current + 1);
      setDebouncedState((current) => current + 1);
      setDebouncedState((current) => current + 1);
    });

    advanceTime(149);
    let [state] = result.current;
    expect(state).toBe(0);

    advanceTime(1);
    [state] = result.current;
    // Only the last queued function runs once => 0 -> 1
    expect(state).toBe(1);
  });

  it('keeps setter identity stable across re-renders and state changes', () => {
    const { result, rerender } = renderHook(
      (props: { delayMilliseconds: number }) =>
        useDebounceState<string>('', props.delayMilliseconds),
      { initialProps: { delayMilliseconds: 100 } },
    );

    const [, firstSetter] = result.current;

    rerender({ delayMilliseconds: 400 });
    const [, secondSetter] = result.current;
    expect(secondSetter).toBe(firstSetter);

    // trigger an update and ensure identity still stable
    act(() => {
      secondSetter('z');
    });
    advanceTime(400);
    const [, thirdSetter] = result.current;
    expect(thirdSetter).toBe(firstSetter);
  });

  it('changing delay after scheduling does not affect the in-flight update', () => {
    const { result, rerender } = renderHook(
      (props: { delayMilliseconds: number }) =>
        useDebounceState<string>('', props.delayMilliseconds),
      { initialProps: { delayMilliseconds: 500 } },
    );

    const [, setDebouncedState] = result.current;

    act(() => {
      setDebouncedState('data');
    });

    // Change delay to a shorter one but do not call again
    rerender({ delayMilliseconds: 100 });

    advanceTime(499);
    let [state] = result.current;
    expect(state).toBe('');

    advanceTime(1); // fires at the original 500ms
    [state] = result.current;
    expect(state).toBe('data');
  });

  it('changing delay and calling again uses the new delay', () => {
    const { result, rerender } = renderHook(
      (props: { delayMilliseconds: number }) =>
        useDebounceState<string>('', props.delayMilliseconds),
      { initialProps: { delayMilliseconds: 500 } },
    );

    let [, setDebouncedState] = result.current;

    act(() => {
      setDebouncedState('first');
    });

    advanceTime(200);

    // Update delay and call again to reschedule with the new delay
    rerender({ delayMilliseconds: 1000 });
    [, setDebouncedState] = result.current;

    act(() => {
      setDebouncedState('second');
    });

    advanceTime(999);
    let [state] = result.current;
    expect(state).toBe('');

    advanceTime(1);
    [state] = result.current;
    expect(state).toBe('second');
  });

  it('clears pending update on unmount (no late state write)', () => {
    const { result, unmount } = renderHook(() =>
      useDebounceState<string>('', 400),
    );

    const [, setDebouncedState] = result.current;

    act(() => {
      setDebouncedState('later');
    });

    unmount();

    // advancing time should not throw and should not update state anywhere
    expect(() => advanceTime(400)).not.toThrow();
  });

  it('supports lazy initializer (called once)', () => {
    const initializer = vi.fn(() => 'init');
    const { result, rerender } = renderHook(
      () => useDebounceState<string>(initializer, 100),
      { initialProps: { rerenderKey: 0 } },
    );

    let [state] = result.current;
    expect(state).toBe('init');
    expect(initializer).toHaveBeenCalledTimes(1);

    // force rerender to ensure initializer is not called again
    rerender({ rerenderKey: 1 });
    [state] = result.current;
    expect(state).toBe('init');
    expect(initializer).toHaveBeenCalledTimes(1);
  });
});
