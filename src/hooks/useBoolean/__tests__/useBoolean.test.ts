import { act, renderHook } from '@testing-library/react';

import { useBoolean } from '../useBoolean';

describe('useBoolean hook', () => {
  it('returns initial value (default false)', () => {
    const { result } = renderHook(() => useBoolean());
    expect(result.current[0]).toBe(false);
  });

  it('returns initial value (true)', () => {
    const { result } = renderHook(() => useBoolean(true));
    expect(result.current[0]).toBe(true);
  });

  it('sets value to true', () => {
    const { result } = renderHook(() => useBoolean(false));
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
  });

  it('sets value to false', () => {
    const { result } = renderHook(() => useBoolean(true));
    act(() => result.current[2]());
    expect(result.current[0]).toBe(false);
  });

  it('setTrue is stable between renders', () => {
    const { result, rerender } = renderHook(() => useBoolean());
    const setTrueBefore = result.current[1];
    rerender();
    expect(result.current[1]).toBe(setTrueBefore);
  });

  it('setFalse is stable between renders', () => {
    const { result, rerender } = renderHook(() => useBoolean());
    const setFalseBefore = result.current[2];
    rerender();
    expect(result.current[2]).toBe(setFalseBefore);
  });

  it('can be set to true multiple times', () => {
    const { result } = renderHook(() => useBoolean());
    act(() => {
      result.current[1]();
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);
  });

  it('can be set to false multiple times', () => {
    const { result } = renderHook(() => useBoolean(true));
    act(() => {
      result.current[2]();
      result.current[2]();
    });
    expect(result.current[0]).toBe(false);
  });

  it('works with tuple destructuring and object fields', () => {
    const { result } = renderHook(() => {
      const booleanState = useBoolean();
      return {
        tuple: [booleanState[0], booleanState[1], booleanState[2]] as const,
        object: {
          setTrue: booleanState.setTrue,
          setFalse: booleanState.setFalse,
          value: booleanState.value,
        },
      };
    });

    expect(result.current.tuple[0]).toBe(false);
    expect(result.current.object.value).toBe(false);

    act(() => {
      result.current.tuple[1]();
    });

    expect(result.current.tuple[0]).toBe(true);
    expect(result.current.object.value).toBe(true);

    act(() => {
      result.current.object.setFalse();
    });

    expect(result.current.tuple[0]).toBe(false);
    expect(result.current.object.value).toBe(false);
  });

  it('object destructuring is stable between renders', () => {
    const { result, rerender } = renderHook(() => {
      const { setTrue, setFalse, value } = useBoolean();
      return { setTrue, setFalse, value };
    });

    const setTrueBefore = result.current.setTrue;
    const setFalseBefore = result.current.setFalse;

    rerender();

    expect(result.current.setTrue).toBe(setTrueBefore);
    expect(result.current.setFalse).toBe(setFalseBefore);
  });
});
