export const __DEVELOPMENT__ = (() => {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch (_error) {
    return false;
  }
})();

export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

export const isServer = !isBrowser;
