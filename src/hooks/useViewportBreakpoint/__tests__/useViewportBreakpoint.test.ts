import { renderHook } from '@testing-library/react';

import { useViewportBreakpoint } from '../useViewportBreakpoint';

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

describe('useViewportBreakpoint hook', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial matches state correctly for mobile', () => {
    const breakpoints = { mobile: 0, tablet: 768, desktop: 1024 } as const;
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query === '(min-width: 0px)') {
        return new TestMediaQueryList(query, true);
      }
      return new TestMediaQueryList(query, false);
    });

    const { result } = renderHook(() => useViewportBreakpoint(breakpoints));
    const [matches, active] = result.current;
    expect(matches.mobile).toBe(true);
    expect(matches.tablet).toBe(false);
    expect(matches.desktop).toBe(false);
    expect(active).toBe('mobile');
  });

  it('updates matches state when query changes to tablet', () => {
    const breakpoints = { phone: 0, tablet: 772, big: 1600 } as const;
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query === '(min-width: 772px)') {
        return new TestMediaQueryList(query, true);
      }
      return new TestMediaQueryList(query, false);
    });

    const { result } = renderHook(() => useViewportBreakpoint(breakpoints));
    const [, active] = result.current;
    expect(active).toBe('tablet');
  });

  it('returns defaultBreakpoint when none matches', () => {
    const breakpoints = { sm: 0, md: 600, lg: 1200 } as const;
    vi.spyOn(window, 'matchMedia').mockImplementation(
      () => new TestMediaQueryList('', false),
    );
    const { result } = renderHook(() =>
      useViewportBreakpoint(breakpoints, { defaultBreakpoint: 'sm' }),
    );
    expect(result.current[1]).toBe('sm');
  });

  it('returns null activeBreakpoint if nothing matches and no default', () => {
    const breakpoints = { xs: 10, md: 900 } as const;
    vi.spyOn(window, 'matchMedia').mockImplementation(
      () => new TestMediaQueryList('', false),
    );
    const { result } = renderHook(() => useViewportBreakpoint(breakpoints));
    expect(result.current[1]).toBe(null);
  });

  it('exposes object-style return', () => {
    const breakpoints = { a: 0, b: 500 } as const;
    vi.spyOn(window, 'matchMedia').mockImplementation(
      () => new TestMediaQueryList('', false),
    );
    const { result } = renderHook(() => useViewportBreakpoint(breakpoints));
    const { matches, activeBreakpoint } = result.current;
    expect(typeof matches).toBe('object');
    expect(['a', 'b', null]).toContain(activeBreakpoint);
  });

  it('matches map contains all keys', () => {
    const breakpoints = { low: 0, mid: 700, high: 1300 } as const;
    vi.spyOn(window, 'matchMedia').mockImplementation(
      () => new TestMediaQueryList('', false),
    );
    const { result } = renderHook(() => useViewportBreakpoint(breakpoints));
    const [matches] = result.current;
    expect(Object.keys(matches)).toEqual(['low', 'mid', 'high']);
  });

  it('keeps state stable when matches do not change', () => {
    const breakpoints = { start: 0, end: 1000 } as const;
    vi.spyOn(window, 'matchMedia').mockImplementation(
      () => new TestMediaQueryList('', false),
    );
    const { result, rerender } = renderHook(() =>
      useViewportBreakpoint(breakpoints),
    );
    const prev = result.current[0];
    rerender();
    expect(result.current[0]).toBe(prev);
  });

  it('returns correct activeBreakpoint for desktop', () => {
    const breakpoints = { small: 0, medium: 720, desktop: 1080 } as const;
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query.includes('(min-width: 1080px)')) {
        return new TestMediaQueryList(query, true);
      }
      return new TestMediaQueryList(query, false);
    });

    const { result } = renderHook(() => useViewportBreakpoint(breakpoints));
    expect(result.current[1]).toBe('desktop');
  });

  it('never allows more than one breakpoint to be active', () => {
    const breakpoints = { first: 0, second: 400, third: 800 } as const;
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query === '(min-width: 0px) and (max-width: 399px)') {
        return new TestMediaQueryList(query, true);
      }
      return new TestMediaQueryList(query, false);
    });

    const { result } = renderHook(() => useViewportBreakpoint(breakpoints));
    const [matches] = result.current;
    const truthyCount = Object.values(matches).filter(Boolean).length;
    expect(truthyCount).toBeLessThanOrEqual(1);
  });

  it('supports symbol keys as breakpoints', () => {
    const sym = Symbol('wide');
    const breakpoints = { [sym]: 1400 } as const;
    vi.spyOn(window, 'matchMedia').mockImplementation(
      () => new TestMediaQueryList('', false),
    );
    const { result } = renderHook(() => useViewportBreakpoint(breakpoints));
    const [matches] = result.current;
    expect(matches[sym]).toBeDefined();
  });
});
