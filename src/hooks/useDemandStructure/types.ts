import type { $DemandStructureUsingSymbol } from './constants';

/**
 * Base return type of `useDemandStructure`.
 *
 * Extends the original structure with a special symbol property
 * that tracks which fields were accessed.
 *
 * @template ObjectType - The shape of the returned object (e.g. `{ value: boolean }`)
 */
export type UseDemandStructureReturnBase<ObjectType = unknown> = ObjectType & {
  /**
   * Internal symbol-based map that tracks which properties have been read.
   * Useful for conditional updates and optimizations.
   */
  readonly [$DemandStructureUsingSymbol]: Readonly<
    Record<keyof ObjectType, boolean>
  >;
};

/**
 * A function that returns a value on demand.
 *
 * Used by `useDemandStructure` to define computed getters.
 *
 * @template ValueType - The type of the value returned.
 */
export type UseDemandStructureAccessor<ValueType = unknown> = (
  isInitialAccess: boolean,
) => ValueType;

/**
 * An accessor function with an explicit alias.
 *
 * Used for array-based `useDemandStructure` with named properties.
 *
 * @template ValueType - The type of the value returned.
 */
export type UseDemandStructureAccessorWithAlias<ValueType = unknown> = {
  /**
   * Alias under which the value will be exposed (as object key).
   */
  alias: string | number;

  /**
   * Function used to compute the value.
   */
  accessor: UseDemandStructureAccessor<ValueType>;
};
