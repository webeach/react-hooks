import { act, renderHook } from '@testing-library/react';

import { UsePageVisibilityCallback } from '../types';
import { usePageVisibility } from '../usePageVisibility';

const originalDescriptor = Object.getOwnPropertyDescriptor(
  document,
  'visibilityState',
);

function setVisibilityState(value: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => value,
  });

  document.dispatchEvent(new Event('visibilitychange'));
}

describe('usePageVisibility hook', () => {
  beforeEach(() => {
    setVisibilityState('visible');
  });

  afterAll(() => {
    if (originalDescriptor) {
      Object.defineProperty(document, 'visibilityState', originalDescriptor);
    }
  });

  it('returns true when visibilityState is visible', () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current.isVisible).toBe(true);
  });

  it('returns false when visibilityState is hidden', () => {
    setVisibilityState('hidden');
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current.isVisible).toBe(false);
  });

  it('updates isVisible on visibility change (visible → hidden → visible)', () => {
    const { result } = renderHook(() => usePageVisibility());

    act(() => {
      setVisibilityState('hidden');
    });
    expect(result.current.isVisible).toBe(false);

    act(() => {
      setVisibilityState('visible');
    });
    expect(result.current.isVisible).toBe(true);
  });

  it('calls provided callback on visibility change', () => {
    const callback = vi.fn<UsePageVisibilityCallback>();
    renderHook(() => usePageVisibility(callback));

    act(() => {
      setVisibilityState('hidden');
    });

    act(() => {
      setVisibilityState('visible');
    });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, false);
    expect(callback).toHaveBeenNthCalledWith(2, true);
  });

  it('does not throw if no callback is passed', () => {
    const { result } = renderHook(() => usePageVisibility());

    act(() => {
      setVisibilityState('hidden');
      setVisibilityState('visible');
    });

    expect(typeof result.current.isVisible).toBe('boolean');
  });

  it('returns visibility via tuple access', () => {
    const { result } = renderHook(() => usePageVisibility());

    // Проверяем доступ к значению через индекс
    expect(result.current[0]).toBe(true);

    act(() => {
      setVisibilityState('hidden');
    });

    expect(result.current[0]).toBe(false);
  });
});
