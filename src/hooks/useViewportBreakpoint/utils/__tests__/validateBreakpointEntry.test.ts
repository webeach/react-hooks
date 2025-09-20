import { validateBreakpointEntry } from '../validateBreakpointEntry';

describe('validateBreakpointEntry util', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  // --- valid entries ---
  it('should return true for a zero breakpoint', () => {
    expect(validateBreakpointEntry(['mobile', 0])).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should return true for a positive finite breakpoint', () => {
    expect(validateBreakpointEntry(['tablet', 768])).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  // --- invalid entries ---
  it('should return false for a negative breakpoint value', () => {
    expect(validateBreakpointEntry(['desktop', -100])).toBe(false);
  });

  it('should return false for Infinity value', () => {
    expect(validateBreakpointEntry(['wide', Infinity])).toBe(false);
  });

  it('should return false for NaN value', () => {
    expect(validateBreakpointEntry(['unknown', NaN])).toBe(false);
  });
});
