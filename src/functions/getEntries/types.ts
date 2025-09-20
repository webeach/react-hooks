import { NormalizeObjectKey } from '../../types/utils';

/**
 * Tuple type for object entries:
 * - Normalizes `number` keys to strings.
 * - Optionally includes/excludes `symbol` keys.
 * - Preserves the original value type.
 */
export type Entry<
  Key extends string | symbol | number,
  Value,
  WithSymbols extends boolean | undefined,
> =
  NormalizeObjectKey<Key, WithSymbols> extends never
    ? never
    : [NormalizeObjectKey<Key, WithSymbols>, Value];
