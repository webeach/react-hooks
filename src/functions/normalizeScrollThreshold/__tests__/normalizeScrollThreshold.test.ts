import { normalizeScrollThreshold } from '../normalizeScrollThreshold';

describe('normalizeScrollThreshold function', () => {
  it('should apply the same number to all sides', () => {
    expect(normalizeScrollThreshold(25)).toEqual({
      top: 25,
      bottom: 25,
      left: 25,
      right: 25,
    });
  });

  it('should fallback to 0 if given number is 0', () => {
    expect(normalizeScrollThreshold(0)).toEqual({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
  });

  it('should coerce negative number to 0', () => {
    expect(normalizeScrollThreshold(-10)).toEqual({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
  });

  it('should normalize individual side values from partial object', () => {
    expect(normalizeScrollThreshold({ top: 30, right: 10 })).toEqual({
      top: 30,
      right: 10,
      bottom: 0,
      left: 0,
    });
  });

  it('should coerce missing values to 0 and negative to 0', () => {
    expect(normalizeScrollThreshold({ top: -10, left: 0 })).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('should not modify values that are already valid', () => {
    expect(
      normalizeScrollThreshold({ top: 5, right: 15, bottom: 0, left: 2 }),
    ).toEqual({
      top: 5,
      right: 15,
      bottom: 0,
      left: 2,
    });
  });
});
