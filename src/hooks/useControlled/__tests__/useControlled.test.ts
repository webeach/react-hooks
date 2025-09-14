import { act, renderHook } from '@testing-library/react';

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
});
