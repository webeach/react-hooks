import { ExtendedMapUpdateHandler } from './types';

/**
 * An extended Map that triggers an update handler on mutations.
 *
 * @template KeyType - The type of the keys in the map.
 * @template ValueType - The type of the values in the map.
 *
 * @property onUpdate - A callback that is invoked whenever the map is modified.
 */
export class ExtendedMap<KeyType = any, ValueType = any> extends Map<
  KeyType | unknown,
  ValueType
> {
  /**
   * A handler that is called after any mutation operation.
   */
  public onUpdate: ExtendedMapUpdateHandler | null = null;

  /**
   * Removes all entries from the map and triggers `onUpdate`.
   *
   * @returns void
   */
  public override clear = () => {
    if (this.size === 0) {
      return;
    }

    super.clear();
    this._dispatchUpdate();
  };

  /**
   * Deletes a specific key from the map and triggers `onUpdate` if successful.
   *
   * @param keyType - The key to remove.
   * @returns `true` if the key existed and was removed, otherwise `false`.
   */
  public override delete = (keyType: KeyType) => {
    if (!super.delete(keyType)) {
      return false;
    }

    this._dispatchUpdate();
    return true;
  };

  /**
   * Retrieves a value by key.
   *
   * @param key - The key of the item to retrieve.
   * @returns The value associated with the key, or `undefined` if not found.
   */
  public override get = (key: KeyType | unknown) => super.get(key);

  /**
   * Checks whether a given key exists in the map.
   *
   * @param key - The key to check.
   * @returns `true` if the key exists, otherwise `false`.
   */
  public override has = (key: KeyType | unknown) => super.has(key);

  /**
   * Replaces all existing entries in the map with the provided entries.
   * Triggers `onUpdate` if any changes are applied.
   *
   * @param entries - An array of `[key, value]` pairs to insert.
   * @returns The current map instance.
   */
  public replaceAll = (entries: ReadonlyArray<[KeyType, ValueType]>) => {
    if (this.size === 0 && entries.length === 0) {
      return this;
    }

    super.clear();

    entries.forEach(([key, value]) => {
      super.set(key, value);
    });

    this._dispatchUpdate();
    return this;
  };

  /**
   * Sets a value for a given key and triggers `onUpdate`.
   *
   * @param key - The key to set.
   * @param value - The value to associate with the key.
   * @returns The current map instance.
   */
  public override set = (key: KeyType, value: ValueType) => {
    super.set(key, value);
    this._dispatchUpdate();
    return this;
  };

  /**
   * Internal helper to invoke the update handler.
   */
  private _dispatchUpdate() {
    this.onUpdate?.(this);
  }
}
