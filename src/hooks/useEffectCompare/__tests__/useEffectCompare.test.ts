import { renderHook } from '@testing-library/react';

import { useEffectCompare } from '../useEffectCompare';

describe('useEffectCompare hook', () => {
  test('runs effect only once when deps are shallowly equal', () => {
    const spy = vi.fn();

    const { rerender } = renderHook(
      ({ deps }) =>
        useEffectCompare(() => {
          spy();
        }, deps),
      { initialProps: { deps: [1, 2] } },
    );

    rerender({ deps: [1, 2] }); // shallow-equal deps
    rerender({ deps: [1, 2] });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('runs effect again when deps array changes by value', () => {
    const spy = vi.fn();

    const { rerender } = renderHook(
      ({ deps }) =>
        useEffectCompare(() => {
          spy();
        }, deps),
      { initialProps: { deps: [1] } },
    );

    rerender({ deps: [2] });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('respects custom compare function', () => {
    const spy = vi.fn();

    const compare = (a: { id: number }, b: { id: number }) => a.id === b.id;

    const { rerender } = renderHook(
      ({ user }) =>
        useEffectCompare(
          () => {
            spy();
          },
          compare,
          user,
        ),
      {
        initialProps: { user: { id: 1 } },
      },
    );

    rerender({ user: { id: 1 } }); // same id
    rerender({ user: { id: 1 } });
    rerender({ user: { id: 2 } }); // changed

    expect(spy).toHaveBeenCalledTimes(2); // initial + change
  });

  test('runs effect only on first render if compare always returns true', () => {
    const spy = vi.fn();

    const compare = () => true;

    const { rerender } = renderHook(() =>
      useEffectCompare(() => {
        spy();
      }, compare),
    );

    rerender();
    rerender();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('runs effect again if compare returns false', () => {
    const spy = vi.fn();

    const compare = () => {
      return false;
    };

    const { rerender } = renderHook(() =>
      useEffectCompare(() => {
        spy();
      }, compare),
    );

    rerender();
    rerender();
    rerender();

    expect(spy).toHaveBeenCalledTimes(4);
  });
});
