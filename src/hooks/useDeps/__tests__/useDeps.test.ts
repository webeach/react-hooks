import { renderHook } from '@testing-library/react';

import { useDeps } from '../useDeps';

describe('useDeps hook', () => {
  it('returns stable id if shallow-equal deps array is passed', () => {
    const deps = [1, 2];
    const { result, rerender } = renderHook(({ deps }) => useDeps(deps), {
      initialProps: { deps },
    });

    const [firstId] = result.current;

    rerender({ deps: [1, 2] });
    const [secondId] = result.current;

    expect(secondId).toBe(firstId);
  });

  it('increments id when deps array changes by value', () => {
    const { result, rerender } = renderHook(({ deps }) => useDeps(deps), {
      initialProps: { deps: [1, 2] },
    });

    const [firstId] = result.current;

    rerender({ deps: [1, 99] });
    const [secondId] = result.current;

    expect(secondId).toBe(firstId + 1);
  });

  it('uses compare function to determine changes', () => {
    const compare = (prev: { id: number }, next: { id: number }) =>
      prev.id === next.id;

    const { result, rerender } = renderHook(
      ({ value }) => useDeps(compare, value),
      {
        initialProps: { value: { id: 1 } },
      },
    );

    const [firstId] = result.current;

    rerender({ value: { id: 1 } }); // same id, different reference
    const [secondId] = result.current;
    expect(secondId).toBe(firstId);

    rerender({ value: { id: 2 } }); // different id
    const [thirdId] = result.current;
    expect(thirdId).toBe(firstId + 1);
  });

  it('does not increment id if only compare function is passed', () => {
    const compare = () => true;

    const { result, rerender } = renderHook(() => useDeps(compare));

    const [firstId] = result.current;
    rerender();

    const [secondId] = result.current;
    expect(secondId).toBe(firstId);
  });

  it('returns stable id when called with no arguments', () => {
    const { result, rerender } = renderHook(() => useDeps());

    const [firstId] = result.current;
    rerender();
    rerender();
    rerender();

    const [finalId] = result.current;
    expect(finalId).toBe(firstId); // should always be 0
  });
});
