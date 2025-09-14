import { SafeStorage } from '../classes/SafeStorage';
import { isBrowser } from '../constants/common';

/**
 * Module-scoped safe wrapper around `window.sessionStorage`.
 * - Lazy access prevents crashes in non-browser/SSR environments.
 * - Methods are protected by `SafeStorage` (errors are swallowed; safe fallbacks returned).
 * - Use `safeSessionStorage.originInstance` to match `event.storageArea`.
 */
export const safeSessionStorage = new SafeStorage(() => {
  return isBrowser ? window.sessionStorage : null;
});
