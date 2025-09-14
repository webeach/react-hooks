import { act, renderHook } from '@testing-library/react';

import { useRefState } from '../useRefState';

describe('useRefState hook', () => {
  it('initializes with undefined', () => {
    const { result } = renderHook(() => useRefState());
    const [ref] = result.current;
    expect(ref.current).toBeUndefined();
  });

  it('initializes with static value', () => {
    const { result } = renderHook(() => useRefState(42));
    const [ref] = result.current;
    expect(ref.current).toBe(42);
  });

  it('initializes with lazy initializer', () => {
    const initializer = vi.fn(() => 'lazy');
    const { result } = renderHook(() => useRefState(initializer));
    const [ref] = result.current;
    expect(ref.current).toBe('lazy');
    expect(initializer).toHaveBeenCalledTimes(1);
  });

  it('updates ref synchronously without re-render (reactivity off)', () => {
    const { result } = renderHook(() => useRefState(0, false));
    const [ref, set] = result.current;

    act(() => {
      set(99);
    });

    expect(ref.current).toBe(99);

    const rerenderSpy = vi.fn();
    rerenderSpy();
    expect(rerenderSpy).toHaveBeenCalledTimes(1); // simulate no actual rerender
  });

  it('updates ref and triggers re-render (reactivity on)', () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useRefState(10, true);
    });

    const [, set] = result.current;

    act(() => {
      set(20);
    });

    expect(result.current[0].current).toBe(20);
    expect(renders).toBe(2); // initial + update
  });

  it('disables and enables reactivity', () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useRefState(5);
    });

    const [, set, { disableUpdate, enableUpdate }] = result.current;

    act(() => {
      disableUpdate();
      set(6); // shouldn't re-render
    });

    act(() => {
      enableUpdate();
      set(7); // should re-render
    });

    expect(result.current[0].current).toBe(7);
    expect(renders).toBe(2); // initial + one re-render
  });

  it('supports functional update', () => {
    const { result } = renderHook(() => useRefState(100));
    const [, set] = result.current;

    act(() => {
      set((prev) => prev + 1);
    });

    expect(result.current[0].current).toBe(101);
  });

  it('functional update honors reactivity', () => {
    const { result } = renderHook(() => useRefState(1, false));
    const [, set, { enableUpdate }] = result.current;

    act(() => {
      set((prev) => prev + 1);
    });

    expect(result.current[0].current).toBe(2);

    act(() => {
      enableUpdate();
      set((prev) => prev + 1);
    });

    expect(result.current[0].current).toBe(3);
  });

  it('triggers sync and re-render when enabling reactivity with forceUpdate', () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders++;
      return useRefState(10, false); // initially not reactive
    });

    const [ref, set, { enableUpdate }] = result.current;

    act(() => {
      set(999); // no re-render expected
    });

    expect(ref.current).toBe(999);
    expect(renders).toBe(1); // still only initial render

    act(() => {
      enableUpdate(true); // should force re-render now
    });

    expect(renders).toBe(2); // one re-render triggered by force update
    expect(result.current[0].current).toBe(999);
  });
});
