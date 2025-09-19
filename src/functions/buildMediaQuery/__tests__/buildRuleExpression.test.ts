import { MediaQueryRule } from '../../../types/mediaQuery';
import { buildMediaQuery } from '../buildMediaQuery';

describe('buildMediaQuery function', () => {
  it('builds a simple min-width query', () => {
    const result = buildMediaQuery('screen', [{ minWidth: 768 }]);
    expect(result).toBe('screen and (min-width: 768px)');
  });

  it('builds a query with multiple conditions', () => {
    const rule: MediaQueryRule = {
      minWidth: 1024,
      orientation: 'landscape',
    };
    const result = buildMediaQuery('screen', [rule]);
    expect(result).toBe(
      'screen and (min-width: 1024px) and (orientation: landscape)',
    );
  });

  it('builds multiple rule objects separated by commas', () => {
    const rules: MediaQueryRule[] = [
      { minWidth: 768 },
      { orientation: 'portrait' },
    ];
    const result = buildMediaQuery('screen', rules);
    expect(result).toBe(
      'screen and (min-width: 768px), screen and (orientation: portrait)',
    );
  });

  it('transforms aspect-ratio values', () => {
    const result = buildMediaQuery('all', [{ aspectRatio: [16, 9] }]);
    expect(result).toBe('all and (aspect-ratio: 16/9)');
  });

  it('transforms resolution values into dppx', () => {
    const result = buildMediaQuery('all', [
      { minResolution: 2, maxResolution: 3 },
    ]);
    expect(result).toBe(
      'all and (min-resolution: 2dppx) and (max-resolution: 3dppx)',
    );
  });

  it('transforms width values into px', () => {
    const result = buildMediaQuery('all', [{ minWidth: 320, maxWidth: 1440 }]);
    expect(result).toBe('all and (min-width: 320px) and (max-width: 1440px)');
  });

  it('builds query with prefers-color-scheme', () => {
    const result = buildMediaQuery('screen', [{ prefersColorScheme: 'dark' }]);
    expect(result).toBe('screen and (prefers-color-scheme: dark)');
  });

  it('returns empty string when rule list is empty', () => {
    const result = buildMediaQuery('screen', []);
    expect(result).toBe('');
  });

  it('ignores unknown keys safely', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const rule = { minWidth: 500, unknownKey: 'test' } as any;
    const result = buildMediaQuery('screen', [rule]);

    expect(result).toBe('screen and (min-width: 500px)');
    expect(spy).toHaveBeenCalledWith('Unknown media query rule: unknownKey');

    spy.mockRestore();
  });
});
