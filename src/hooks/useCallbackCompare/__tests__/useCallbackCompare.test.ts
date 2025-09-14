import { renderHook } from '@testing-library/react';

import { useCallbackCompare } from '../useCallbackCompare';

describe('useCallbackCompare hook', () => {
  it('returns same callback when deps are shallowly equal', () => {
    const deps = [1, 2];

    const { result, rerender } = renderHook(
      ({ deps }) => useCallbackCompare(() => () => deps[0]! + deps[1]!, deps),
      {
        initialProps: { deps },
      },
    );

    const firstCallback = result.current;

    rerender({ deps: [1, 2] });
    const secondCallback = result.current;

    expect(secondCallback).toBe(firstCallback);
  });

  it('returns new callback when deps change by value', () => {
    const { result, rerender } = renderHook(
      ({ deps }) => useCallbackCompare(() => () => deps[0], deps),
      {
        initialProps: { deps: [1] },
      },
    );

    const firstCallback = result.current;

    rerender({ deps: [2] });
    const secondCallback = result.current;

    expect(secondCallback).not.toBe(firstCallback);
  });

  it('returns same callback if custom compare returns true', () => {
    const compare = (a: { id: number }, b: { id: number }) => a.id === b.id;

    const { result, rerender } = renderHook(
      ({ user }) => useCallbackCompare(() => () => user.id, compare, user),
      {
        initialProps: { user: { id: 1 } },
      },
    );

    const firstCallback = result.current;

    rerender({ user: { id: 1 } }); // same id, new object
    const secondCallback = result.current;

    expect(secondCallback).toBe(firstCallback);
  });

  it('returns new callback if custom compare returns false', () => {
    const compare = (a: { id: number }, b: { id: number }) => a.id === b.id;

    const { result, rerender } = renderHook(
      ({ user }) => useCallbackCompare(() => () => user.id, compare, user),
      {
        initialProps: { user: { id: 1 } },
      },
    );

    const firstCallback = result.current;

    rerender({ user: { id: 2 } });
    const secondCallback = result.current;

    expect(secondCallback).not.toBe(firstCallback);
  });

  it('returns stable callback if compare always returns true', () => {
    const compare = () => true;

    const { result, rerender } = renderHook(() =>
      useCallbackCompare(() => () => 'static', compare),
    );

    const firstCallback = result.current;

    rerender();
    const secondCallback = result.current;

    expect(secondCallback).toBe(firstCallback);
  });

  it('recomputes callback if compare returns false', () => {
    let toggle = false;
    const compare = () => {
      toggle = !toggle;
      return toggle;
    };

    const { result, rerender } = renderHook(() =>
      useCallbackCompare(() => () => 'new', compare),
    );

    const callback1 = result.current;
    rerender();
    const callback2 = result.current;
    rerender();
    const callback3 = result.current;

    const distinct = new Set([callback1, callback2, callback3]);
    expect(distinct.size).toBeGreaterThan(1);
  });
});
