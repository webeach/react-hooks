/**
 * Setter function returned by `useLocalStorage`.
 * Accepts a direct value or a functional updater.
 */
export type UseLocalStorageDispatch<Value> = (
  action: UseLocalStorageSetAction<Value>,
) => void;

/**
 * Configuration options for `useLocalStorage`.
 *
 * @template Value Stored value type after deserialization.
 * @property watch When `true`, updates the state if the same key changes in other tabs.
 * @property deserializer Optional custom parser: `(key, raw) => Value | undefined`.
 * @property serializer Optional custom formatter: `(key, value) => string`.
 * Both `serializer` and `deserializer` must be provided together.
 */
export type UseLocalStorageOptions<Value = unknown> = {
  watch?: boolean;
} & (
  | {
      deserializer: (key: string, rawValue: string) => Value | undefined;
      serializer: (key: string, value: Value) => string;
    }
  | {
      deserializer?: undefined;
      serializer?: undefined;
    }
);

/**
 * Tuple returned by `useLocalStorage`.
 *
 * @template Value Current value type.
 * @returns `[value, setValue]` — the stored value and the setter.
 */
export type UseLocalStorageReturn<Value = unknown> = readonly [
  value: Value,
  setValue: UseLocalStorageDispatch<Value>,
];

/**
 * Action accepted by the setter from `useLocalStorage`.
 * Either a new value or a functional updater.
 */
export type UseLocalStorageSetAction<Value> = Value | ((value: Value) => Value);
