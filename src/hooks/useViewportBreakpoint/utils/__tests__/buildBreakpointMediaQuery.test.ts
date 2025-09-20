import { buildBreakpointMediaQuery } from '../buildBreakpointMediaQuery';

describe('buildBreakpointMediaQuery util', () => {
  it('returns correct query for 0px', () => {
    expect(buildBreakpointMediaQuery(0)).toBe('(min-width: 0px)');
  });

  it('returns correct query for positive value', () => {
    expect(buildBreakpointMediaQuery(768)).toBe('(min-width: 768px)');
  });

  it('returns correct query for large value', () => {
    expect(buildBreakpointMediaQuery(1920)).toBe('(min-width: 1920px)');
  });

  it('handles 1px correctly', () => {
    expect(buildBreakpointMediaQuery(1)).toBe('(min-width: 1px)');
  });

  it('returns a string that starts with (min-width', () => {
    expect(buildBreakpointMediaQuery(500).startsWith('(min-width')).toBe(true);
  });

  it('appends px suffix', () => {
    expect(buildBreakpointMediaQuery(320).endsWith('px)')).toBe(true);
  });

  it('produces unique queries for different inputs', () => {
    const a = buildBreakpointMediaQuery(600);
    const b = buildBreakpointMediaQuery(601);
    expect(a).not.toBe(b);
  });

  it('works consistently with multiple calls of the same input', () => {
    expect(buildBreakpointMediaQuery(1024)).toBe(
      buildBreakpointMediaQuery(1024),
    );
  });
});
