import { renderHook, waitFor } from '@testing-library/react';

import { useAsyncHandler } from '../useAsyncHandler';

describe('useAsyncHandler hook', () => {
  it('executes handler on mount', async () => {
    const mock = vi.fn().mockResolvedValue(undefined);

    renderHook(() => useAsyncHandler(mock, []));

    await waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1);
    });
  });

  it('returns isSuccess after successful execution', async () => {
    const { result } = renderHook(() => {
      const [status] = useAsyncHandler(async () => {
        await new Promise((r) => setTimeout(r, 1));
      }, []);

      return status;
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns isError when handler throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // suppress error output

    const { result } = renderHook(() => {
      const [status] = useAsyncHandler(async () => {
        throw new Error('fail');
      }, []);

      return status;
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error?.message).toBe('fail');

    consoleSpy.mockRestore(); // restore after test
  });

  it('tracks pending state during execution', async () => {
    const { result } = renderHook(() => {
      const [status] = useAsyncHandler(async () => {
        await new Promise((r) => setTimeout(r, 1));
      }, []);

      return status;
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('does not re-render unnecessarily when status is not used', async () => {
    let renders = 0;

    renderHook(() => {
      renders++;
      // status is never used
      useAsyncHandler(async () => {}, []);
    });

    await waitFor(() => {
      expect(renders).toBe(1);
    });
  });

  it('re-executes handler when dependencies change', async () => {
    const spy = vi.fn().mockResolvedValue(undefined);

    let dep = 1;
    const { rerender } = renderHook(() => useAsyncHandler(spy, [dep]));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
    });

    dep = 2;
    rerender();

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  it('does not apply async result after unmount', async () => {
    let resolve: (v: void) => void;

    const { unmount } = renderHook(() =>
      useAsyncHandler(() => new Promise<void>((r) => (resolve = r)), []),
    );

    unmount();

    // Resolving after unmount must not throw or warn — the underlying
    // useAsyncCallback aborts on unmount, invalidating the call token.
    await new Promise<void>((flush) => {
      resolve?.();
      // microtask flush
      Promise.resolve().then(flush);
    });
  });

  it('discards the result of the previous call when deps change mid-flight', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    let resolveFirst: (v: void) => void;
    let resolveSecond: (v: void) => void;

    const first = vi
      .fn()
      .mockImplementation(() => new Promise<void>((r) => (resolveFirst = r)));
    const second = vi
      .fn()
      .mockImplementation(() => new Promise<void>((r) => (resolveSecond = r)));

    let fn: () => Promise<void> = first;
    let dep = 1;

    const { result, rerender } = renderHook(() => {
      const [status] = useAsyncHandler(fn, [dep]);
      return status;
    });

    expect(result.current.isPending).toBe(true);

    // Change deps and the handler — the first promise is still pending.
    fn = second;
    dep = 2;
    rerender();

    // Resolve the OLD promise first — must not flip status to success
    // because its call token is no longer current.
    await waitFor(() => {
      expect(second).toHaveBeenCalledTimes(1);
    });

    resolveFirst!();
    await Promise.resolve();
    expect(result.current.isSuccess).toBe(false);

    // Resolve the NEW one — now success should land.
    resolveSecond!();
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    consoleSpy.mockRestore();
  });
});
