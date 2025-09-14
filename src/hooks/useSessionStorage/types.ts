/**
 * Setter function returned by `useSessionStorage`.
 * Accepts a direct value or a functional updater.
 */
export type UseSessionStorageDispatch<Value> = (
  action: UseSessionStorageSetAction<Value>,
) => void;

/**
 * Configuration options for `useSessionStorage`.
 *
 * @template Value Stored value type after deserialization.
 * @property deserializer Optional parser: `(key, raw) => Value | undefined`.
 * @property serializer Optional formatter: `(key, value) => string`.
 * If you provide one, provide both to keep storage format consistent.
 */
export type UseSessionStorageOptions<Value = unknown> =
  | {
      deserializer: (key: string, rawValue: string) => Value | undefined;
      serializer: (key: string, value: Value) => string;
    }
  | {
      deserializer?: undefined;
      serializer?: undefined;
    };

/**
 * Tuple returned by `useSessionStorage`.
 *
 * @template Value Current value type.
 * @returns `[value, setValue]` — the stored value and the setter.
 */
export type UseSessionStorageReturn<Value = unknown> = readonly [
  value: Value,
  setValue: UseSessionStorageDispatch<Value>,
];

/**
 * Action accepted by the setter from `useSessionStorage`.
 * Either a new value or a functional updater.
 */
export type UseSessionStorageSetAction<Value> =
  | Value
  | ((value: Value) => Value);
