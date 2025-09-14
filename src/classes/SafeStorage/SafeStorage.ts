import { __DEVELOPMENT__ } from '../../constants/common';

/**
 * Safe wrapper around Web Storage (`localStorage` / `sessionStorage`).
 *
 * - All operations are wrapped in `try/catch` to avoid runtime errors in
 *   private mode, when quota is exceeded, or when storage is blocked.
 * - If storage is unavailable, methods become no-ops and getters return safe values.
 * - In development, errors are logged to the console.
 *
 * @example
 * const safeLocalStorage = new SafeStorage(() =>
 *   typeof window !== 'undefined' ? window.localStorage : null
 * );
 * safeLocalStorage.setItem('key', 'value'); // never throws
 *
 * @implements Storage
 */
export class SafeStorage implements Storage {
  private readonly _storage: Storage | null = null;

  /**
   * @param getStorage Factory that returns a `Storage` instance or `null`
   * (e.g. `() => window.localStorage`). The call is wrapped in `try/catch`.
   */
  constructor(getStorage: () => Storage | null) {
    try {
      this._storage = getStorage();
    } catch (error) {
      this._error(error);
    }
  }

  /** Clears the storage. Errors are swallowed. */
  public clear(): void {
    try {
      this._storage?.clear();
    } catch (error: unknown) {
      this._error(error);
    }
  }

  /**
   * Safely reads a value by key.
   * @param key Storage key.
   * @returns The string value, or `null` if absent or on error/unavailable storage.
   */
  public getItem(key: string): string | null {
    if (this._storage === null) return null;
    try {
      return this._storage.getItem(key);
    } catch (error: unknown) {
      this._error(error);
      return null;
    }
  }

  /**
   * Returns the key name at the given index.
   * @param index Position of the key.
   * @returns Key name or `null` if out of range or on error/unavailable storage.
   */
  public key(index: number): string | null {
    if (this._storage === null) return null;
    try {
      return this._storage.key(index);
    } catch (error: unknown) {
      this._error(error);
      return null;
    }
  }

  /**
   * Safely removes a value by key. No-op on unavailable storage.
   * @param key Storage key.
   */
  public removeItem(key: string): void {
    try {
      this._storage?.removeItem(key);
    } catch (error: unknown) {
      this._error(error);
    }
  }

  /**
   * Safely writes a value by key. No-op on unavailable storage.
   * @param key Storage key.
   * @param value Value to store.
   */
  public setItem(key: string, value: string): void {
    try {
      this._storage?.setItem(key, value);
    } catch (error: unknown) {
      this._error(error);
    }
  }

  /**
   * Number of stored items.
   * Returns `0` if storage is unavailable or on error.
   */
  public get length(): number {
    if (this._storage === null) return 0;
    try {
      return this._storage.length;
    } catch (error: unknown) {
      this._error(error);
      return 0;
    }
  }

  /**
   * The original `Storage` instance (or `null` if unavailable).
   * Useful for comparing with `event.storageArea` in a `storage` listener.
   */
  public get originInstance(): Storage | null {
    return this._storage;
  }

  /** Internal dev-only logger. */
  private _error(error: unknown): void {
    if (__DEVELOPMENT__) {
      console.error(error);
    }
  }
}
