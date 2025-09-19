import { act, renderHook } from '@testing-library/react';

import { useMediaQuery } from '../useMediaQuery';

// Custom test double for MediaQueryList
class TestMediaQueryList extends EventTarget implements MediaQueryList {
  media: string;
  matches: boolean;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null =
    null;

  constructor(query: string, matches: boolean) {
    super();
    this.media = query;
    this.matches = matches;
  }

  trigger(newMatches: boolean) {
    this.matches = newMatches;
    const event = new Event('change') as MediaQueryListEvent;

    Object.defineProperty(event, 'matches', { value: newMatches });

    this.dispatchEvent(event);
    this.onchange?.call(this, event);
  }

  addListener() {}
  removeListener() {}
}

describe('useMediaQuery hook', () => {
  let mediaQueryList: TestMediaQueryList;

  beforeAll(() => {
    // Mock matchMedia with TestMediaQueryList
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => {
        const matches = query.includes('min-width: 1024px');
        mediaQueryList = new TestMediaQueryList(query, matches);
        return mediaQueryList;
      }),
    });
  });

  it('returns true when query matches initially', () => {
    const { result } = renderHook(() => useMediaQuery({ minWidth: 1024 }));
    const [isMatch] = result.current;
    expect(isMatch).toBe(true);
  });

  it('returns false when query does not match initially', () => {
    const { result } = renderHook(() => useMediaQuery({ minWidth: 5000 }));
    const [isMatch] = result.current;
    expect(isMatch).toBe(false);
  });

  it('updates state when media query changes', () => {
    const { result } = renderHook(() => useMediaQuery({ minWidth: 1024 }));

    expect(result.current[0]).toBe(true);

    act(() => {
      mediaQueryList.trigger(false);
    });
    expect(result.current[0]).toBe(false);

    act(() => {
      mediaQueryList.trigger(true);
    });
    expect(result.current[0]).toBe(true);
  });

  it('supports multiple rules with default type', () => {
    const { result } = renderHook(() =>
      useMediaQuery([{ minWidth: 1024 }, { orientation: 'landscape' }]),
    );

    const [isMatch] = result.current;
    expect(typeof isMatch).toBe('boolean');
  });

  it('supports explicit type parameter', () => {
    const { result } = renderHook(() =>
      useMediaQuery('screen', { minWidth: 1024 }),
    );

    const [isMatch] = result.current;
    expect(isMatch).toBe(true);
  });
});
