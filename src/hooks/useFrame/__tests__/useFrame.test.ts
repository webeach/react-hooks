import { act, renderHook } from '@testing-library/react';

import { useFrame } from '../useFrame';

describe('useFrame hook', () => {
  beforeAll(() => {
    vi.useFakeTimers();

    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(
      (callback) => {
        const id = setTimeout(() => callback(performance.now()), 16);
        return Number(id);
      },
    );

    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((id) => {
      clearTimeout(id);
    });
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('invokes callback on each animation frame with increasing frame count', () => {
    const callback = vi.fn();
    renderHook(() => useFrame(callback));

    vi.advanceTimersByTime(48);
    expect(callback).toHaveBeenCalledTimes(3);

    expect(callback).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ frame: 1 }),
    );
    expect(callback).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ frame: 2 }),
    );
    expect(callback).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ frame: 3 }),
    );
  });

  it('stops animation after unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useFrame(callback));

    vi.advanceTimersByTime(32);
    expect(callback).toHaveBeenCalledTimes(2);

    unmount();
    vi.advanceTimersByTime(64);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('continues working with updated callback after remount', () => {
    const callback1 = vi.fn();
    const { unmount } = renderHook(({ callback }) => useFrame(callback), {
      initialProps: { callback: callback1 },
    });

    act(() => {
      vi.advanceTimersByTime(32);
    });
    expect(callback1).toHaveBeenCalledTimes(2);

    unmount();

    const callback2 = vi.fn();
    renderHook(({ callback }) => useFrame(callback), {
      initialProps: { callback: callback2 },
    });

    act(() => {
      vi.advanceTimersByTime(48);
    });

    expect(callback2).toHaveBeenCalledTimes(3);
    expect(callback2).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ frame: 1 }),
    );
    expect(callback2).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ frame: 3 }),
    );
  });
});
