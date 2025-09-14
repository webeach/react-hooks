import { act, renderHook } from '@testing-library/react';

import { useSessionStorage } from '../useSessionStorage';

describe('useSessionStorage hook', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('returns initialValue when storage is empty', () => {
    const { result } = renderHook(() =>
      useSessionStorage<string>('pref:name', 'Alice'),
    );

    const [value] = result.current;

    expect(value).toBe('Alice');
  });

  it('persists value across unmount/remount', () => {
    const key = 'pref:color';

    const { result, unmount } = renderHook(() =>
      useSessionStorage<string>(key, 'blue'),
    );

    const [, setValue] = result.current;

    // update value and write to sessionStorage
    act(() => {
      setValue('green');
    });

    // unmount hook (component gone)
    unmount();

    // mount a fresh hook instance with a different initialValue
    const { result: result2 } = renderHook(() =>
      useSessionStorage<string>(key, 'red'),
    );

    const [value] = result2.current;

    // should read previously persisted value from storage
    expect(value).toBe('green');
  });

  it('supports functional updater and persists the result', () => {
    const key = 'counter';

    const { result, unmount } = renderHook(() =>
      useSessionStorage<number>(key, 0),
    );

    const [, setValue] = result.current;

    act(() => {
      setValue((prev) => (prev ?? 0) + 1);
    });

    const [value] = result.current;

    expect(value).toBe(1);

    unmount();

    const { result: result2 } = renderHook(() =>
      useSessionStorage<number>(key, 0),
    );

    const [value2] = result2.current;

    expect(value2).toBe(1);
  });

  it('sets undefined and does not fall back to initialValue (same mount)', () => {
    const key = 'session';

    const { result } = renderHook(() =>
      useSessionStorage<string | undefined>(key, 'start'),
    );

    const [, setValue] = result.current;

    act(() => {
      setValue(undefined);
    });

    const [value] = result.current;

    expect(value).toBeUndefined();
  });

  it('calls custom serializer/deserializer once with expected values', () => {
    const key = 'custom:json';

    // preload storage so the hook reads and runs the deserializer once
    const preloaded = JSON.stringify({ root: 100 });
    window.sessionStorage.setItem(key, preloaded);

    const serializer = vi.fn((_key: string, value: number) =>
      JSON.stringify({ root: value }),
    );
    const deserializer = vi.fn(
      (_key: string, rawValue: string): number | undefined => {
        const parsed = JSON.parse(rawValue);
        return parsed?.root;
      },
    );

    const { result } = renderHook(() =>
      useSessionStorage<number>(key, 0, { serializer, deserializer }),
    );

    // deserializer should be called exactly once on init with the raw string
    expect(deserializer).toHaveBeenCalledTimes(1);
    expect(deserializer).toHaveBeenCalledWith(key, preloaded);
    expect(result.current[0]).toBe(100);

    // updating value should call serializer exactly once with the new value
    act(() => {
      const [, setValue] = result.current;
      setValue(200);
    });

    expect(serializer).toHaveBeenCalledTimes(1);
    expect(serializer).toHaveBeenLastCalledWith(key, 200);
  });
});
