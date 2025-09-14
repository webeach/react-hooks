import { renderHook } from '@testing-library/react';

import { useMemoCompare } from '../useMemoCompare';

describe('useMemoCompare hook', () => {
  it('returns same memoized value when deps are shallowly equal', () => {
    const { result, rerender } = renderHook(
      ({ deps }) => useMemoCompare(() => ({ value: deps[0] }), deps),
      {
        initialProps: { deps: [1] },
      },
    );

    const first = result.current;

    rerender({ deps: [1] });
    const second = result.current;

    expect(second).toBe(first); // memoized
  });

  it('returns new value when deps array changes by value', () => {
    const { result, rerender } = renderHook(
      ({ deps }) => useMemoCompare(() => ({ value: deps[0] }), deps),
      {
        initialProps: { deps: [1] },
      },
    );

    const first = result.current;

    rerender({ deps: [2] });
    const second = result.current;

    expect(second).not.toBe(first); // recomputed
    expect(second.value).toBe(2);
  });

  it('uses custom compare function to determine memoization', () => {
    const compareFn = (a: { id: number }, b: { id: number }) => a.id === b.id;

    const { result, rerender } = renderHook(
      ({ user }) =>
        useMemoCompare(() => ({ userId: user.id }), compareFn, user),
      {
        initialProps: { user: { id: 1 } },
      },
    );

    const first = result.current;

    rerender({ user: { id: 1 } }); // same id, new reference
    const second = result.current;

    expect(second).toBe(first); // memoized

    rerender({ user: { id: 2 } }); // id changed
    const third = result.current;

    expect(third).not.toBe(first); // recomputed
    expect(third.userId).toBe(2);
  });

  it('returns stable memoized value when only compare function is passed', () => {
    const compareFn = () => true;

    const { result, rerender } = renderHook(() =>
      useMemoCompare(() => Math.random(), compareFn),
    );

    const first = result.current;

    rerender();
    const second = result.current;

    expect(second).toBe(first); // always memoized
  });

  it('recomputes value if compare function returns false', () => {
    let toggle = false;
    const compareFn = () => {
      toggle = !toggle;
      return toggle;
    };

    const { result, rerender } = renderHook(() =>
      useMemoCompare(() => Math.random(), compareFn),
    );

    const values: number[] = [result.current];

    rerender();
    values.push(result.current);

    rerender();
    values.push(result.current);

    const distinctValues = new Set(values);
    expect(distinctValues.size).toBeGreaterThan(1);
  });
});
