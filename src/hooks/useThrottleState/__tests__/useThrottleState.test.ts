import { act, renderHook } from '@testing-library/react';

import { useThrottleState } from '../useThrottleState';

/**
 * Fake timers + stubbed performance.now for deterministic time.
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

describe('useThrottleState hook', () => {
  it('initializes with undefined when only delay is provided', () => {
    const { result } = renderHook(() => useThrottleState<string>(300));
    const [state] = result.current;
    expect(state).toBeUndefined();
  });

  it('initializes with explicit initial state', () => {
    const { result } = renderHook(() => useThrottleState<string>('', 300));
    const [state] = result.current;
    expect(state).toBe('');
  });

  it('performs an immediate leading update on first call', () => {
    const { result } = renderHook(() => useThrottleState<string>('', 1000));

    let [state, setState] = result.current;
    expect(state).toBe('');

    act(() => {
      setState('A');
    });

    [state] = result.current;
    expect(state).toBe('A'); // leading update happens immediately
  });

  it('coalesces multiple calls within the window into one trailing update with the latest value', () => {
    const { result } = renderHook(() => useThrottleState<string>('', 1000));

    let [state, setState] = result.current;

    // t=0 leading -> immediate to 'first'
    act(() => {
      setState('first');
    });
    [state] = result.current;
    expect(state).toBe('first');

    // Inside the same window, schedule trailing with latest value
    advance(100);
    act(() => {
      setState('second');
    });

    advance(500);
    act(() => {
      setState('third');
    });

    // Trailing should fire exactly at t=1000 with 'third'
    advance(399);
    [state] = result.current;
    expect(state).toBe('first');
    advance(1);
    [state] = result.current;
    expect(state).toBe('third');
  });

  it('starts a new window after the wait period and updates immediately again', () => {
    const { result } = renderHook(() => useThrottleState<string>('', 300));

    let [state, setState] = result.current;

    act(() => {
      setState('x');
    });
    [state] = result.current;
    expect(state).toBe('x');

    // Wait past the window
    advance(301);

    act(() => {
      setState('y');
    });
    [state] = result.current;
    expect(state).toBe('y'); // immediate again in a new window
  });

  it('does not schedule more than one trailing update within the same window', () => {
    const { result } = renderHook(() => useThrottleState<string>('', 500));

    let [state, setState] = result.current;

    act(() => {
      setState('a'); // leading immediate
    });

    advance(50);
    act(() => setState('b'));
    advance(50);
    act(() => setState('c'));
    advance(50);
    act(() => setState('d'));

    // Only one trailing fires at t=500 with 'd'
    advance(349);
    [state] = result.current;
    expect(state).toBe('a');
    advance(1);
    [state] = result.current;
    expect(state).toBe('d');
  });

  it('changing delay after scheduling does not affect the already scheduled trailing update', () => {
    const { result, rerender } = renderHook(
      (props: { delay: number }) => useThrottleState<string>('', props.delay),
      { initialProps: { delay: 1000 } },
    );

    let [state, setState] = result.current;

    act(() => setState('A')); // leading immediate
    [state] = result.current;
    expect(state).toBe('A');

    // Schedule trailing inside window
    advance(100);
    act(() => setState('B'));

    // Change delay, but do NOT call again -> trailing should keep original schedule
    rerender({ delay: 100 });

    advance(899); // t=999
    [state] = result.current;
    expect(state).toBe('A');
    advance(1); // t=1000
    [state] = result.current;
    expect(state).toBe('B');
  });

  it('uses the new delay for subsequent windows after rerender', () => {
    const { result, rerender } = renderHook(
      (props: { delay: number }) => useThrottleState<string>('', props.delay),
      { initialProps: { delay: 1000 } },
    );

    const [, setState] = result.current;

    act(() => setState('A')); // leading immediate
    let [state] = result.current;
    expect(state).toBe('A');

    // Wait past original window to start a new one
    advance(1001);

    // Update delay to 200ms
    rerender({ delay: 200 });

    // New window: immediate leading
    act(() => setState('B'));
    [state] = result.current;
    expect(state).toBe('B');

    // Call inside new 200ms window -> trailing at +200ms
    advance(50);
    act(() => setState('C'));

    advance(149);
    [state] = result.current;
    expect(state).toBe('B');
    advance(1);
    [state] = result.current;
    expect(state).toBe('C');
  });

  it('supports functional updates: leading applies immediately, trailing applies last function once', () => {
    const { result } = renderHook(() => useThrottleState<number>(0, 300));

    let [state, setState] = result.current;

    // Leading immediate functional update
    act(() => setState((x) => x + 1));
    [state] = result.current;
    expect(state).toBe(1);

    // Inside the same window, queue two functional updates — last wins
    advance(100);
    act(() => setState((x) => x + 1));
    act(() => setState((x) => x + 2));

    // Trailing applies once with last function: 1 -> 3
    advance(199);
    [state] = result.current;
    expect(state).toBe(1);
    advance(1);
    [state] = result.current;
    expect(state).toBe(3);
  });

  it('clears the pending trailing update on unmount (no late state write)', () => {
    const { result, unmount } = renderHook(() =>
      useThrottleState<string>('', 400),
    );

    const [, setState] = result.current;

    // Schedule a trailing update
    act(() => setState('lead')); // leading immediate
    advance(100);
    act(() => setState('trail'));

    // Unmount before trailing fires
    unmount();

    // advancing time should not write state anywhere and should not throw
    expect(() => advance(1000)).not.toThrow();
  });

  it('keeps setter identity stable across re-renders', () => {
    const { result, rerender } = renderHook(
      (props: { delay: number }) => useThrottleState<string>('', props.delay),
      { initialProps: { delay: 250 } },
    );

    const [, firstSetter] = result.current;

    rerender({ delay: 500 });
    const [, secondSetter] = result.current;
    expect(secondSetter).toBe(firstSetter);
  });
});
