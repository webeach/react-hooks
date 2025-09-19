/**
 * Normalizes object key types:
 * - `number` → string literal (`0` → `"0"`).
 * - `string` → preserved as-is.
 * - `symbol` → included only if `WithSymbols = true`.
 */
export type NormalizeObjectKey<
  KeyType extends string | symbol | number,
  WithSymbols extends boolean | undefined,
> = KeyType extends number
  ? `${KeyType}`
  : KeyType extends symbol
    ? WithSymbols extends true
      ? KeyType
      : never
    : KeyType;
