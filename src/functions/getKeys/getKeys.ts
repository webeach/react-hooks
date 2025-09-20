import { NormalizeObjectKey } from '../../types/utils';

/**
 * Returns the keys of an object as a readonly array, with optional inclusion of symbol keys.
 *
 * - Numeric keys are normalized to their string form (e.g., `0` → `"0"`).
 * - String keys are preserved as-is.
 * - Symbol keys are included only if `withSymbols` is explicitly set to `true`.
 *
 * @template KeyType - Union of allowed key types (`string | number | symbol`).
 * @template WithSymbols - Controls inclusion of symbol keys (`true` to include).
 *
 * @param record - The record (object) to extract keys from.
 * @param withSymbols - Optional flag to include symbol keys. Defaults to `undefined` (symbols excluded).
 *
 * @returns Array of normalized keys:
 * - `number` keys are returned as string literals.
 * - `string` keys remain string literals.
 * - `symbol` keys are included only if `withSymbols = true`.
 */
export function getKeys<
  KeyType extends string | symbol | number,
  WithSymbols extends boolean | undefined = undefined,
>(record: Record<KeyType, any>, withSymbols?: WithSymbols) {
  const keys = Object.keys(record) as unknown[];

  return (
    withSymbols ? keys.concat(Object.getOwnPropertySymbols(record)) : keys
  ) as NormalizeObjectKey<KeyType, WithSymbols>[];
}
