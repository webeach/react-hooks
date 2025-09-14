import { act, renderHook } from '@testing-library/react';

import { useStatus } from '../useStatus';

describe('useStatus hook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useStatus());
    const status = result.current;

    expect(status.isError).toBe(false);
    expect(status.isPending).toBe(false);
    expect(status.isSuccess).toBe(false);
    expect(status.error).toBeNull();
  });

  it('setPending updates flags correctly', () => {
    const { result } = renderHook(() => useStatus());

    act(() => {
      result.current.setPending();
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('setSuccess updates flags correctly', () => {
    const { result } = renderHook(() => useStatus());

    act(() => {
      result.current.setSuccess();
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('setError stores error and updates flags', () => {
    const { result } = renderHook(() => useStatus());

    act(() => {
      result.current.setError(new Error('fail'));
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error?.message).toBe('fail');
  });

  it('reset returns to initial state', () => {
    const { result } = renderHook(() => useStatus());

    act(() => {
      result.current.setSuccess();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('setStatus manually sets any state', () => {
    const { result } = renderHook(() => useStatus());

    act(() => {
      result.current.setStatus('success');
    });

    expect(result.current.isSuccess).toBe(true);

    act(() => {
      result.current.setStatus('pending');
    });

    expect(result.current.isPending).toBe(true);

    act(() => {
      result.current.setStatus('error');
    });

    expect(result.current.isError).toBe(true);

    act(() => {
      result.current.setStatus('initial');
    });

    expect(result.current.isError).toBe(false);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });
});
