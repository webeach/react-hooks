import { SafeStorage } from '../classes/SafeStorage';
import { isBrowser } from '../constants/common';

/**
 * Module-scoped safe wrapper around `window.localStorage`.
 * - Uses a lazy factory to avoid SSR/runtime errors when `window` or storage is unavailable.
 * - All operations are try/catch-guarded by `SafeStorage` (no throws in private mode/quota errors).
 * - For `storage` events, compare with `safeLocalStorage.originInstance`.
 */
export const safeLocalStorage = new SafeStorage(() => {
  return isBrowser ? window.localStorage : null;
});
