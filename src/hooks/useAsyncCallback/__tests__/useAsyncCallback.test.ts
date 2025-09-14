import { act, renderHook, waitFor } from '@testing-library/react';

import { useAsyncCallback } from '../useAsyncCallback';

describe('useAsyncCallback hook', () => {
  it('has correct initial state', () => {
    const { result } = renderHook(() => useAsyncCallback(async () => 'ok'));

    const [, status] = result.current;

    expect(status.isPending).toBe(false);
    expect(status.isSuccess).toBe(false);
    expect(status.isError).toBe(false);
    expect(status.error).toBeNull();
  });

  it('transitions to success after resolving', async () => {
    const { result } = renderHook(() =>
      useAsyncCallback(async (x: number) => x * 2),
    );

    const [callback, status] = result.current;

    await act(() => callback(2));

    await waitFor(() => {
      expect(status.isSuccess).toBe(true);
    });

    expect(status.isError).toBe(false);
    expect(status.error).toBeNull();
  });

  it('transitions to error after rejection (sync throw)', async () => {
    const { result } = renderHook(() =>
      useAsyncCallback(async () => {
        throw new Error('fail');
      }),
    );

    const [callback, status] = result.current;

    await act(async () => {
      try {
        await callback();
      } catch {
        /* empty */
      }
    });

    expect(status.isError).toBe(true);
    expect(status.isSuccess).toBe(false);
    expect(status.error?.message).toBe('fail');
  });

  it('sets error if thrown reason is string', async () => {
    const { result } = renderHook(() =>
      useAsyncCallback(async () => {
        throw 'oops';
      }),
    );

    const [callback, status] = result.current;

    await act(async () => {
      try {
        await callback();
      } catch {
        /* empty */
      }
    });

    expect(status.isError).toBe(true);
    expect(status.error?.message).toBe('oops');
  });

  it('sets error to null if thrown reason is unknown type', async () => {
    const { result } = renderHook(() =>
      useAsyncCallback(async () => {
        throw Symbol('bad');
      }),
    );

    const [callback, status] = result.current;

    await act(async () => {
      try {
        await callback();
      } catch {
        /* empty */
      }
    });

    expect(status.isError).toBe(true);
    expect(status.error).toBeNull();
  });

  it('tracks multiple calls but only applies latest', async () => {
    let resolve1: (value: string) => void;
    let resolve2: (value: string) => void;

    const mock = vi
      .fn()
      .mockImplementationOnce(() => new Promise((r) => (resolve1 = r)))
      .mockImplementationOnce(() => new Promise((r) => (resolve2 = r)));

    const { result } = renderHook(() => useAsyncCallback(mock));

    const [callback, status] = result.current;

    void callback();
    void callback(); // this is the latest

    act(() => {
      resolve1?.('first');
      resolve2?.('second');
    });

    await waitFor(() => {
      expect(status.isSuccess).toBe(true);
    });

    expect(status.error).toBeNull();
  });

  it('returns the resolved value', async () => {
    const { result } = renderHook(() =>
      useAsyncCallback(async (name: string) => `hello ${name}`),
    );

    const [callback] = result.current;

    let value: string = '';

    await act(async () => {
      value = await callback('world');
    });

    expect(value).toBe('hello world');
  });

  it('returns rejected value via throw', async () => {
    const { result } = renderHook(() =>
      useAsyncCallback(async () => {
        throw new Error('expected');
      }),
    );

    const [callback] = result.current;

    let caught: unknown;

    await act(async () => {
      try {
        await callback();
      } catch (e) {
        caught = e;
      }
    });

    expect((caught as Error).message).toBe('expected');
  });

  it('sets pending flag during execution', async () => {
    let resolve: (v: string) => void;

    const { result } = renderHook(() =>
      useAsyncCallback(() => new Promise((r) => (resolve = r))),
    );

    const [callback, status] = result.current;

    act(() => {
      void callback();
    });

    expect(status.isPending).toBe(true);

    act(() => {
      resolve?.('done');
    });

    await waitFor(() => {
      expect(status.isPending).toBe(false);
    });
  });

  it('does not trigger re-render if status is never accessed', async () => {
    let renders = 0;

    const { result } = renderHook(() => {
      renders++;
      const [callback] = useAsyncCallback(async () => 'done');
      return callback;
    });

    expect(renders).toBe(1); // initial render

    await act(async () => {
      await result.current(); // call the async function
    });

    expect(renders).toBe(1); // still no re-render because status was never accessed
  });

  it('abort resets status and prevents async result from applying', async () => {
    let resolve: (v: string) => void;

    const { result } = renderHook(() =>
      useAsyncCallback(() => new Promise((r) => (resolve = r))),
    );

    const [callback, status, abort] = result.current;

    // Start the async call (status becomes "pending")
    act(() => {
      void callback();
    });

    expect(status.isPending).toBe(true);

    // Abort before the promise resolves
    act(() => {
      abort();
    });

    // Resolve the original promise after abort — it should be ignored
    act(() => {
      resolve?.('done');
    });

    // Wait and verify that status remains "initial" and wasn't overwritten by the old call
    await waitFor(() => {
      expect(status.isPending).toBe(false);
      expect(status.isSuccess).toBe(false);
      expect(status.isError).toBe(false);
      expect(status.error).toBeNull();
    });
  });
});
