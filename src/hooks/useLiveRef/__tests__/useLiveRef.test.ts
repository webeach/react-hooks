import { renderHook } from '@testing-library/react';

import { useLiveRef } from '../useLiveRef';

describe('useLiveRef hook', () => {
  it('should return a ref with the initial value', () => {
    const { result } = renderHook(() => useLiveRef('initial'));

    expect(result.current.current).toBe('initial');
  });

  it('should always contain the latest value after rerenders', () => {
    let value = 'first';

    const { result, rerender } = renderHook(() => useLiveRef(value));

    expect(result.current.current).toBe('first');

    value = 'second';
    rerender();
    expect(result.current.current).toBe('second');

    value = 'third';
    rerender();
    expect(result.current.current).toBe('third');
  });

  it('should not change ref identity between renders', () => {
    let value = 1;

    const { result, rerender } = renderHook(() => useLiveRef(value));

    const initialRef = result.current;

    value = 2;
    rerender();

    expect(result.current).toBe(initialRef);
    expect(result.current.current).toBe(2);
  });
});
