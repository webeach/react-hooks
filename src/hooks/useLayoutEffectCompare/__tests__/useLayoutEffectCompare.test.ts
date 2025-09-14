import { renderHook } from '@testing-library/react';

import { useLayoutEffectCompare } from '../useLayoutEffectCompare';

describe('useLayoutEffectCompare hook', () => {
  it('runs layout effect only once when deps are shallowly equal', () => {
    const spy = vi.fn();

    const { rerender } = renderHook(
      ({ deps }) =>
        useLayoutEffectCompare(() => {
          spy();
        }, deps),
      { initialProps: { deps: [1, 2] } },
    );

    rerender({ deps: [1, 2] });
    rerender({ deps: [1, 2] });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('runs layout effect again when deps array changes', () => {
    const spy = vi.fn();

    const { rerender } = renderHook(
      ({ deps }) =>
        useLayoutEffectCompare(() => {
          spy();
        }, deps),
      { initialProps: { deps: [1] } },
    );

    rerender({ deps: [2] });
    rerender({ deps: [3] });

    expect(spy).toHaveBeenCalledTimes(3); // 1 (initial) + 2
  });

  it('respects custom compare function', () => {
    const spy = vi.fn();

    const compare = (a: { id: number }, b: { id: number }) => a.id === b.id;

    const { rerender } = renderHook(
      ({ user }) =>
        useLayoutEffectCompare(
          () => {
            spy();
          },
          compare,
          user,
        ),
      { initialProps: { user: { id: 1 } } },
    );

    rerender({ user: { id: 1 } }); // same
    rerender({ user: { id: 2 } }); // changed
    rerender({ user: { id: 2 } }); // same

    expect(spy).toHaveBeenCalledTimes(2); // initial + id change
  });

  it('runs layout effect only on first render if compare always returns true', () => {
    const spy = vi.fn();

    const { rerender } = renderHook(() =>
      useLayoutEffectCompare(
        () => {
          spy();
        },
        () => true,
      ),
    );

    rerender();
    rerender();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('runs layout effect again if compare returns false every time', () => {
    const spy = vi.fn();

    const compare = () => false;

    const { rerender } = renderHook(() =>
      useLayoutEffectCompare(() => {
        spy();
      }, compare),
    );

    rerender();
    rerender();
    rerender();

    expect(spy).toHaveBeenCalledTimes(4);
  });
});
