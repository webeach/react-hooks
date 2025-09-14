import { act, renderHook } from '@testing-library/react';

import { useFrameExtended } from '../useFrameExtended';

describe('useFrameExtended hook', () => {
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

  it('should call the callback after start', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useFrameExtended(callback));

    act(() => {
      result.current.start();
    });

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

  it('should stop calling the callback after stop', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useFrameExtended(callback));

    act(() => {
      result.current.start();
    });

    vi.advanceTimersByTime(32);
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.stop();
    });

    vi.advanceTimersByTime(64);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should reset frame count on restart', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useFrameExtended(callback));

    act(() => {
      result.current.start();
    });

    vi.advanceTimersByTime(32);
    expect(callback).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.restart();
    });

    vi.advanceTimersByTime(32);
    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({ frame: 2 }),
    );
  });

  it('should not start immediately on first mount if start not called', () => {
    const callback = vi.fn();
    renderHook(() => useFrameExtended(callback));
    vi.advanceTimersByTime(64);
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('restarts animation from frame 0 after restart', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useFrameExtended(callback));

    act(() => {
      result.current.start();
    });

    vi.advanceTimersByTime(32);
    act(() => {
      result.current.restart();
    });
    vi.advanceTimersByTime(16);

    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({ frame: 1 }),
    );
  });

  it('does not increase frame count after stop', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useFrameExtended(callback));

    act(() => {
      result.current.start();
    });

    vi.advanceTimersByTime(32);
    act(() => {
      result.current.stop();
    });
    vi.advanceTimersByTime(48);

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('calling start multiple times resets the frame loop', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useFrameExtended(callback));

    act(() => {
      result.current.start();
    });
    vi.advanceTimersByTime(16);

    act(() => {
      result.current.start();
    });
    vi.advanceTimersByTime(16);

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('timeSinceLastStart resets after restart', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useFrameExtended(callback));

    act(() => {
      result.current.start();
    });

    vi.advanceTimersByTime(48);
    act(() => {
      result.current.restart();
    });
    vi.advanceTimersByTime(16);

    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({
        timeSinceLastStart: 16,
      }),
    );
  });
});
