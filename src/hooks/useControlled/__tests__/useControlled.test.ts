import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';

import { useControlled } from '../useControlled';

describe('useControlled hook', () => {
  it('uses defaultValue in uncontrolled mode (tuple)', () => {
    const { result } = renderHook(() => useControlled('default', undefined));
    expect(result.current[0]).toBe('default');
    expect(result.current[2]).toBe(false); // isControlled
  });

  it('uses controlled value if provided (tuple)', () => {
    const { result } = renderHook(() => useControlled('default', 'controlled'));
    expect(result.current[0]).toBe('controlled');
    expect(result.current[2]).toBe(true);
  });

  it('updates value in uncontrolled mode (tuple)', () => {
    const { result } = renderHook(() => useControlled('default', undefined));
    act(() => {
      result.current[1]('new-value');
    });
    expect(result.current[0]).toBe('new-value');
  });

  it('ignores setValue in controlled mode (tuple)', () => {
    const { result } = renderHook(() => useControlled('default', 'controlled'));
    act(() => {
      result.current[1]('should-be-ignored');
    });
    expect(result.current[0]).toBe('controlled');
  });

  it('switches from controlled to uncontrolled and restores last value (tuple)', () => {
    let controlled: string | undefined = 'external';

    const { result, rerender } = renderHook(() =>
      useControlled('default', controlled),
    );

    expect(result.current[0]).toBe('external');
    expect(result.current[2]).toBe(true);

    controlled = undefined;
    rerender();

    expect(result.current[0]).toBe('external');
    expect(result.current[2]).toBe(false);
  });

  it('uses defaultValue in uncontrolled mode (object)', () => {
    const { result } = renderHook(() => {
      const { value, setValue, isControlled } = useControlled(
        'default',
        undefined,
      );
      return { value, setValue, isControlled };
    });

    expect(result.current.value).toBe('default');
    expect(result.current.isControlled).toBe(false);
  });

  it('uses controlled value if provided (object)', () => {
    const { result } = renderHook(() => {
      const { value, setValue, isControlled } = useControlled(
        'default',
        'controlled',
      );
      return { value, setValue, isControlled };
    });

    expect(result.current.value).toBe('controlled');
    expect(result.current.isControlled).toBe(true);
  });

  it('updates value in uncontrolled mode (object)', () => {
    const { result } = renderHook(() => useControlled('default', undefined));

    act(() => {
      result.current.setValue('updated');
    });

    expect(result.current.value).toBe('updated');
  });

  it('does not update value in controlled mode (object)', () => {
    const { result } = renderHook(() => useControlled('default', 'controlled'));

    act(() => {
      result.current.setValue('ignored');
    });

    expect(result.current.value).toBe('controlled');
  });

  it('returns stable setValue reference between renders', () => {
    const { result, rerender } = renderHook(() =>
      useControlled('default', undefined),
    );

    const setValueBefore = result.current.setValue;
    rerender();
    expect(result.current.setValue).toBe(setValueBefore);
  });

  it('supports functional setValue (prev => next)', () => {
    const { result } = renderHook(() => useControlled(1, undefined));

    act(() => {
      result.current[1]((prev) => (prev ?? 0) + 1);
    });

    expect(result.current[0]).toBe(2);

    act(() => {
      result.current[1]((prev) => (prev ?? 0) * 10);
    });

    expect(result.current[0]).toBe(20);
  });

  it('functional setValue is a no-op in controlled mode', () => {
    const { result } = renderHook(() => useControlled(0, 5));

    act(() => {
      result.current[1]((prev) => (prev ?? 0) + 100);
    });

    expect(result.current[0]).toBe(5);
  });

  it('restores last controlled value when switching to uncontrolled (falsy default)', () => {
    // Regression: an earlier implementation used `if (uncontrolledValue) { ... }`,
    // which dropped the restore branch for falsy values like 0 / '' / false.
    let controlled: number | undefined = 42;

    const { result, rerender } = renderHook(() => useControlled(0, controlled));

    expect(result.current[0]).toBe(42);
    expect(result.current[2]).toBe(true);

    controlled = undefined;
    rerender();

    expect(result.current[0]).toBe(42);
    expect(result.current[2]).toBe(false);
  });

  it('restores last controlled value for empty-string falsy default', () => {
    let controlled: string | undefined = 'external';

    const { result, rerender } = renderHook(() =>
      useControlled('', controlled),
    );

    expect(result.current[0]).toBe('external');

    controlled = undefined;
    rerender();

    expect(result.current[0]).toBe('external');
  });

  it('does not falsely restore on initial mount under StrictMode', () => {
    // In StrictMode, effects run twice on mount. With the old `isMountedRef`
    // approach, the second run would trigger setUncontrolledValue(undefined)
    // and wipe the default. This test guards against regressing that.
    const { result } = renderHook(() => useControlled('default', undefined), {
      wrapper: StrictMode,
    });

    expect(result.current[0]).toBe('default');
    expect(result.current[2]).toBe(false);
  });

  it('switches controlled -> uncontrolled correctly under StrictMode', () => {
    let controlled: string | undefined = 'external';

    const { result, rerender } = renderHook(
      () => useControlled('default', controlled),
      { wrapper: StrictMode },
    );

    expect(result.current[0]).toBe('external');

    controlled = undefined;
    rerender();

    expect(result.current[0]).toBe('external');
    expect(result.current[2]).toBe(false);
  });

  it('infers a non-undefined value type when defaultValue is provided', () => {
    const { result } = renderHook(() => useControlled(1));

    // Compile-time check: result.current[0] must be `number`, not `number | undefined`.
    // (ValueType is inferred only from `defaultValue` thanks to `NoInfer` on `value`.)
    const value: number = result.current[0];
    expect(value).toBe(1);
  });

  it('allows opting into an optional value type via explicit type parameter', () => {
    const { result } = renderHook(() =>
      useControlled<number | undefined>(undefined, undefined),
    );

    // Compile-time check: result.current[0] must be `number | undefined`.
    const value: number | undefined = result.current[0];
    expect(value).toBeUndefined();
  });

  it('does not widen ValueType when value is passed as undefined', () => {
    // Regression guard: without `NoInfer<ValueType>` on the `value` parameter,
    // TS would consider `undefined` as an inference candidate and widen
    // `ValueType` to `string | undefined`, breaking the return type contract.
    const { result } = renderHook(() => useControlled('default', undefined));

    const value: string = result.current[0];
    expect(value).toBe('default');
  });
});
