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
});
