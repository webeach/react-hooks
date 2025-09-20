import { getKeys } from '../getKeys';

import { Entry } from './types';

/**
 * Returns the entries of an object as a readonly array of `[key, value]` tuples,
 * with optional inclusion of symbol keys.
 *
 * - Numeric keys are normalized to their string form (e.g., `0` → `"0"`).
 * - String keys are preserved as-is.
 * - Symbol keys are included only if `withSymbols` is explicitly set to `true`.
 * - Each key is mapped to its exact value type (preserves literal types).
 *
 * @template ObjectType - The object type to extract entries from.
 * @template WithSymbols - Controls inclusion of symbol keys (`true` to include).
 *
 * @param record - The object to extract entries from.
 * @param withSymbols - Optional flag to include symbol keys. Defaults to `undefined` (symbols excluded).
 *
 * @returns Readonly array of `[key, value]` tuples:
 * - Keys are normalized (`number` → string, `symbol` optional).
 * - Values are tied to the corresponding property type from `ObjectType`.
 *
 * @example
 * const sym = Symbol('s');
 * const obj = { a: 1 as const, b: 2, 0: true, [sym]: 'x' };
 *
 * const e1 = getEntries(obj);
 * // (["a", 1] | ["b", number] | ["0", boolean])[]
 *
 * const e2 = getEntries(obj, true);
 * // (["a", 1] | ["b", number] | ["0", boolean] | [typeof sym, string])[]
 */
export function getEntries<
  ObjectType extends object,
  WithSymbols extends boolean | undefined = undefined,
>(record: ObjectType, withSymbols?: WithSymbols) {
  const keys = getKeys<keyof ObjectType, WithSymbols>(record, withSymbols);

  return keys.map((key) => [key, record[key as keyof ObjectType]] as const) as {
    [K in keyof ObjectType]: Entry<K, ObjectType[K], WithSymbols>;
  }[keyof ObjectType][];
}
