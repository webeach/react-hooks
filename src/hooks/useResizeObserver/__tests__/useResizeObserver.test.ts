import { act, renderHook } from '@testing-library/react';

import { useResizeObserver } from '../useResizeObserver';

class MockResizeObserver {
  callback: ResizeObserverCallback;
  observed: Element[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe = (element: Element) => {
    this.observed.push(element);
  };

  unobserve = vi.fn();

  disconnect = vi.fn();

  trigger = (
    entry: Partial<Omit<ResizeObserverEntry, 'contentRect'>> & {
      contentRect: Partial<ResizeObserverEntry['contentRect']>;
    },
  ) => {
    const fullEntry = {
      target: this.observed[0] ?? document.createElement('div'),
      ...entry,
      contentRect: {
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        ...entry.contentRect,
      },
    } as ResizeObserverEntry;
    this.callback([fullEntry], this);
  };
}

describe('useResizeObserver hook', () => {
  let resizeObserverMock: MockResizeObserver;

  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn((callback) => {
        resizeObserverMock = new MockResizeObserver(callback);
        return resizeObserverMock;
      }),
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('calls callback with latest entry on resize', () => {
    const callback = vi.fn();
    const ref = { current: document.createElement('div') };
    renderHook(() => useResizeObserver(ref, callback));

    act(() => {
      resizeObserverMock.trigger({ contentRect: { width: 200, height: 100 } });
    });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        contentRect: expect.objectContaining({ width: 200, height: 100 }),
      }),
    );
  });

  it('returns last entry as currentEntry after access', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useResizeObserver(ref));

    act(() => {
      resizeObserverMock.trigger({ contentRect: { width: 150, height: 80 } });
    });

    let entry!: ResizeObserverEntry | null;

    act(() => {
      entry = result.current.currentEntry;
    });

    expect(entry?.contentRect).toEqual(
      expect.objectContaining({ width: 150, height: 80 }),
    );
  });

  it('disconnects on unmount', () => {
    const ref = { current: document.createElement('div') };
    const { unmount } = renderHook(() => useResizeObserver(ref));

    unmount();

    expect(resizeObserverMock.disconnect).toHaveBeenCalled();
  });

  it('does not crash if ref.current is null', () => {
    const ref = { current: null };
    expect(() => renderHook(() => useResizeObserver(ref))).not.toThrow();
  });

  it('uses latest entry if multiple entries come in sequence', () => {
    const callback = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() => useResizeObserver(ref, callback));

    act(() => {
      resizeObserverMock.trigger({ contentRect: { width: 100, height: 50 } });
      resizeObserverMock.trigger({ contentRect: { width: 110, height: 55 } });
    });

    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({
        contentRect: expect.objectContaining({ width: 110, height: 55 }),
      }),
    );
  });
});
