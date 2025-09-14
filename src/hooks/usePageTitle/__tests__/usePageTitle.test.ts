import { renderHook } from '@testing-library/react';

import { usePageTitle } from '../usePageTitle';

describe('usePageTitle hook', () => {
  const originalTitle = document.title;

  it('should set the document title on mount', () => {
    renderHook(() => usePageTitle('Test Title'));
    expect(document.title).toBe('Test Title');
  });

  it('should restore the original title on unmount', () => {
    const { unmount } = renderHook(() => usePageTitle('Temp Title'));

    expect(document.title).toBe('Temp Title');

    unmount();

    expect(document.title).toBe(originalTitle);
  });

  it('should support nested titles and restore previous one correctly', () => {
    const { unmount: unmount1 } = renderHook(() => usePageTitle('First'));
    expect(document.title).toBe('First');

    const { unmount: unmount2 } = renderHook(() => usePageTitle('Second'));
    expect(document.title).toBe('Second');

    unmount2();
    expect(document.title).toBe('First');

    unmount1();
    expect(document.title).toBe(originalTitle);
  });

  it('should update document title when title changes', () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: 'Initial' },
    });

    expect(document.title).toBe('Initial');

    rerender({ title: 'Updated' });

    expect(document.title).toBe('Updated');
  });

  it('should handle multiple instances with independent lifecycles', () => {
    const hook1 = renderHook(() => usePageTitle('Page 1'));
    const hook2 = renderHook(() => usePageTitle('Page 2'));
    const hook3 = renderHook(() => usePageTitle('Page 3'));

    expect(document.title).toBe('Page 3');

    hook3.unmount();
    expect(document.title).toBe('Page 2');

    hook2.unmount();
    expect(document.title).toBe('Page 1');

    hook1.unmount();
    expect(document.title).toBe(originalTitle);
  });
});
