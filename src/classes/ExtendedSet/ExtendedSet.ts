import { ExtendedSetUpdateHandler } from './types';

/**
 * An extended Set that triggers an update handler on mutations.
 *
 * @template ValueType - The type of the values in the set.
 *
 * @property onUpdate - A callback that is invoked whenever the set is modified.
 */
export class ExtendedSet<ValueType = any> extends Set<ValueType | unknown> {
  /**
   * A handler that is called after any mutation operation.
   */
  public onUpdate: ExtendedSetUpdateHandler | null = null;

  /**
   * Adds a new value to the set and triggers `onUpdate`.
   *
   * @param value - The value to add.
   * @returns The current set instance.
   */
  public override add = (value: ValueType) => {
    super.add(value);
    this._dispatchUpdate();
    return this;
  };

  /**
   * Removes all entries from the set and triggers `onUpdate`.
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
   * Deletes a specific value from the set and triggers `onUpdate` if successful.
   *
   * @param value - The value to remove.
   * @returns `true` if the value existed and was removed, otherwise `false`.
   */
  public override delete = (value: ValueType) => {
    if (!super.delete(value)) {
      return false;
    }

    this._dispatchUpdate();
    return true;
  };

  /**
   * Checks whether a given value exists in the set.
   *
   * @param value - The value to check.
   * @returns `true` if the value exists, otherwise `false`.
   */
  public override has = (value: ValueType | unknown) => super.has(value);

  /**
   * Replaces all existing entries in the set with the provided values.
   * Triggers `onUpdate` if any changes are applied.
   *
   * @param values - An array of values to insert.
   * @returns The current set instance.
   */
  public replaceAll = (values: ReadonlyArray<ValueType>) => {
    if (this.size === 0 && values.length === 0) {
      return this;
    }

    super.clear();

    values.forEach((value) => {
      super.add(value);
    });

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
