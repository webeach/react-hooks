import { renderHook, waitFor } from '@testing-library/react';

import { useImageLoader } from '../useImageLoader';

function mockImageLoad(type: 'success' | 'error' | 'abort') {
  const OriginalImage = global.Image;

  class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    onabort: (() => void) | null = null;

    set src(_: string) {
      setTimeout(() => {
        if (type === 'success') this.onload?.();
        else if (type === 'error') this.onerror?.();
        else this.onabort?.();
      }, 0);
    }
  }

  // @ts-expect-error override global image
  global.Image = MockImage;

  return () => {
    global.Image = OriginalImage;
  };
}

describe('useImageLoader hook', () => {
  it('transitions to success after load (tuple)', async () => {
    const restore = mockImageLoad('success');

    const { result } = renderHook(() => useImageLoader('image.jpg'));

    expect(result.current[0]).toBe(true); // isPending
    expect(result.current[1]).toBe(false); // isSuccess

    await waitFor(() => {
      expect(result.current[1]).toBe(true);
    });

    expect(result.current[2]).toBe(false); // isError
    expect(result.current[3]).toBeNull(); // error

    restore();
  });

  it('transitions to success after load (object)', async () => {
    const restore = mockImageLoad('success');

    const { result } = renderHook(() => useImageLoader('image.jpg'));

    expect(result.current.isPending).toBe(true);
    expect(result.current.isSuccess).toBe(false);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();

    restore();
  });

  it('transitions to error on load failure', async () => {
    const restore = mockImageLoad('error');

    const { result } = renderHook(() => useImageLoader('bad.jpg'));

    await waitFor(() => {
      expect(result.current[2]).toBe(true); // isError
    });

    expect(result.current[3]?.message).toContain('Failed to load image.');

    restore();
  });

  it('transitions to error on abort', async () => {
    const restore = mockImageLoad('abort');

    const { result } = renderHook(() => useImageLoader('abort.jpg'));

    await waitFor(() => {
      expect(result.current[2]).toBe(true); // isError
    });

    expect(result.current[3]?.message).toContain('Image loading aborted.');

    restore();
  });

  it('warns in development if imageUrl is empty', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const restore = mockImageLoad('success');

    renderHook(() => useImageLoader(''));

    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Empty imageUrl provided.'),
    );

    warn.mockRestore();
    restore();
  });

  it('has correct initial state before any events', () => {
    const restore = mockImageLoad('success');

    const { result } = renderHook(() => useImageLoader('image.jpg'));

    const [isPending, isSuccess, isError, error] = result.current;

    expect(isPending).toBe(true);
    expect(isSuccess).toBe(false);
    expect(isError).toBe(false);
    expect(error).toBeNull();

    restore();
  });
});
