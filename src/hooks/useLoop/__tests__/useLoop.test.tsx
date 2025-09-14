import { act, renderHook } from '@testing-library/react';

import { UseLoopOptions } from '../types';
import { useLoop } from '../useLoop';

/**
 * Deterministic time: fake timers + stubbed performance.now
 */
let currentNow = 0;
let performanceNowSpy: ReturnType<typeof vi.spyOn> | null = null;

function advanceTime(milliseconds: number) {
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

describe('useLoop hook', () => {
  it('starts manually and auto-reschedules when manual=false', () => {
    const handleTick = vi.fn();

    const { result, unmount } = renderHook(
      (props: UseLoopOptions) => useLoop(handleTick, props),
      {
        initialProps: { durationMs: 1000, autorun: false, manual: false },
      },
    );

    act(() => result.current.run());

    advanceTime(1000);
    expect(handleTick).toHaveBeenCalledTimes(1);

    advanceTime(1000);
    expect(handleTick).toHaveBeenCalledTimes(2);

    unmount();
  });

  it('autoruns on mount and keeps looping when manual=false', () => {
    const handleTick = vi.fn();

    const { unmount } = renderHook(() =>
      useLoop(handleTick, { durationMs: 500, autorun: true, manual: false }),
    );

    advanceTime(500);
    expect(handleTick).toHaveBeenCalledTimes(1);

    advanceTime(500);
    expect(handleTick).toHaveBeenCalledTimes(2);

    unmount();
  });

  it('manual=true does a single tick unless resume() is requested inside callback', () => {
    const handleTick = vi.fn();

    const { unmount } = renderHook(() =>
      useLoop(handleTick, { durationMs: 700, autorun: true, manual: true }),
    );

    advanceTime(700);
    expect(handleTick).toHaveBeenCalledTimes(1);

    // Without resume, no subsequent ticks
    advanceTime(700);
    expect(handleTick).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('manual=true continues when callback calls resume()', () => {
    const handleTick = vi.fn(
      (options: { actualTime: number; resume: () => void }) => {
        if (handleTick.mock.calls.length < 2) {
          options.resume(); // request continuation on the first tick
        }
      },
    );

    const { unmount } = renderHook(() =>
      useLoop(handleTick, { durationMs: 300, autorun: true, manual: true }),
    );

    advanceTime(300);
    expect(handleTick).toHaveBeenCalledTimes(1);

    // Because resume() was called inside callback, next cycle should be scheduled
    advanceTime(300);
    expect(handleTick).toHaveBeenCalledTimes(2);

    unmount();
  });

  it('disabled pauses mid-interval and resumes with remaining time (preserve by default)', () => {
    const handleTick = vi.fn();

    const { result, rerender, unmount } = renderHook(
      (props: { disabled: boolean }) =>
        useLoop(handleTick, {
          durationMs: 1000,
          autorun: false,
          manual: false,
          disabled: props.disabled,
        }),
      { initialProps: { disabled: false } },
    );

    act(() => result.current.run());

    advanceTime(400);
    // pause
    rerender({ disabled: true });

    // time while paused should not trigger
    advanceTime(1000);
    expect(handleTick).toHaveBeenCalledTimes(0);

    // resume: remaining ~600ms
    rerender({ disabled: false });
    advanceTime(599);
    expect(handleTick).toHaveBeenCalledTimes(0);
    advanceTime(1);
    expect(handleTick).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('changing duration while running adjusts remaining when resetElapsedOnResume=false', () => {
    let lastActualTime = 0;
    const handleTick = vi.fn((options: { actualTime: number }) => {
      lastActualTime = options.actualTime;
    });

    const { rerender, unmount } = renderHook(
      (props: { durationMs: number; reset: boolean }) =>
        useLoop(handleTick, {
          durationMs: props.durationMs,
          autorun: true,
          manual: false,
          resetElapsedOnResume: props.reset,
        }),
      { initialProps: { durationMs: 1000, reset: false } },
    );

    advanceTime(300);
    // change duration to 2000 while preserving elapsed part -> remaining should be 1700
    rerender({ durationMs: 2000, reset: false });

    advanceTime(1699);
    expect(handleTick).toHaveBeenCalledTimes(0);
    advanceTime(1);
    expect(handleTick).toHaveBeenCalledTimes(1);
    expect(lastActualTime).toBeCloseTo(2000, 0);

    unmount();
  });

  it('changing duration while running does not adjust current timer when resetElapsedOnResume=true', () => {
    const handleTick = vi.fn();

    const { rerender, unmount } = renderHook(
      (props: { durationMs: number; reset: boolean }) =>
        useLoop(handleTick, {
          durationMs: props.durationMs,
          autorun: true,
          manual: false,
          resetElapsedOnResume: props.reset,
        }),
      { initialProps: { durationMs: 1000, reset: true } },
    );

    advanceTime(300);
    rerender({ durationMs: 2000, reset: true });

    // Current timer should still fire at original 1000
    advanceTime(699);
    expect(handleTick).toHaveBeenCalledTimes(0);
    advanceTime(1);
    expect(handleTick).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('cancels pending timeout on unmount', () => {
    const handleTick = vi.fn();

    const { result, unmount } = renderHook(() =>
      useLoop(handleTick, { durationMs: 1000, autorun: false, manual: false }),
    );

    act(() => result.current.run());
    unmount();

    advanceTime(1000);
    expect(handleTick).not.toHaveBeenCalled();
  });

  it('provides actualTime close to interval length', () => {
    let observed = 0;
    const handleTick = vi.fn((opts: { actualTime: number }) => {
      observed = opts.actualTime;
    });

    const { result, unmount } = renderHook(() =>
      useLoop(handleTick, { durationMs: 1200, autorun: false, manual: false }),
    );

    act(() => result.current.run());
    advanceTime(1200);

    expect(handleTick).toHaveBeenCalledTimes(1);
    expect(observed).toBeCloseTo(1200, 0);

    unmount();
  });
});
