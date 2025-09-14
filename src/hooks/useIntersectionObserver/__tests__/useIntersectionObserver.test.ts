import { act, renderHook } from '@testing-library/react';

import { useIntersectionObserver } from '../useIntersectionObserver';

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  observed: Element[] = [];
  root: Element | Document | null = null;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe = (element: Element) => {
    this.observed.push(element);
  };

  unobserve = vi.fn();

  disconnect = vi.fn();

  trigger = (entry: Partial<IntersectionObserverEntry> = {}) => {
    const fullEntry: IntersectionObserverEntry = {
      boundingClientRect: new DOMRect(0, 0, 0, 0),
      intersectionRatio: 0,
      intersectionRect: new DOMRect(0, 0, 0, 0),
      isIntersecting: false,
      rootBounds: null,
      target: this.observed[0] ?? document.createElement('div'),
      time: performance.now?.() ?? Date.now(),
      ...entry,
    } as IntersectionObserverEntry;

    this.callback([fullEntry], this as unknown as IntersectionObserver);
  };
}

describe('useIntersectionObserver hook', () => {
  let ioMock: MockIntersectionObserver;

  beforeAll(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn((callback: IntersectionObserverCallback) => {
        ioMock = new MockIntersectionObserver(callback);
        return ioMock as unknown as IntersectionObserver;
      }),
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('observes the provided element', () => {
    const ref = { current: document.createElement('div') };
    renderHook(() => useIntersectionObserver(ref));

    expect(ioMock.observed[0]).toBe(ref.current);
  });

  it('calls callback with latest entry on intersection change', () => {
    const callback = vi.fn();
    const ref = { current: document.createElement('div') };
    renderHook(() => useIntersectionObserver(ref, callback));

    act(() => {
      ioMock.trigger({ isIntersecting: true, intersectionRatio: 0.75 });
    });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        isIntersecting: true,
        intersectionRatio: 0.75,
      }),
    );
  });

  it('returns last entry as currentEntry after access', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useIntersectionObserver(ref));

    act(() => {
      ioMock.trigger({ isIntersecting: true, intersectionRatio: 0.5 });
    });

    let entry!: IntersectionObserverEntry | null;

    act(() => {
      entry = result.current.currentEntry;
    });

    expect(entry?.isIntersecting).toBe(true);
    expect(entry?.intersectionRatio).toBe(0.5);
  });

  it('disconnects on unmount', () => {
    const ref = { current: document.createElement('div') };
    const { unmount } = renderHook(() => useIntersectionObserver(ref));

    unmount();

    expect(ioMock.disconnect).toHaveBeenCalled();
  });

  it('does not crash if ref.current is null', () => {
    const ref = { current: null as HTMLDivElement | null };
    expect(() => renderHook(() => useIntersectionObserver(ref))).not.toThrow();
  });

  it('uses the latest entry if multiple entries come in sequence', () => {
    const callback = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() => useIntersectionObserver(ref, callback));

    act(() => {
      ioMock.trigger({ intersectionRatio: 0.1 });
      ioMock.trigger({ intersectionRatio: 0.2 });
      ioMock.trigger({ intersectionRatio: 0.9 });
    });

    expect(callback).toHaveBeenLastCalledWith(
      expect.objectContaining({ intersectionRatio: 0.9 }),
    );
  });

  it('handles non-intersecting updates correctly', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useIntersectionObserver(ref));

    act(() => {
      ioMock.trigger({ isIntersecting: false, intersectionRatio: 0 });
    });

    let entry!: IntersectionObserverEntry | null;
    act(() => {
      entry = result.current.currentEntry;
    });

    expect(entry?.isIntersecting).toBe(false);
    expect(entry?.intersectionRatio).toBe(0);
  });
});
