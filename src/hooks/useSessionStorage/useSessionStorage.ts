import { useCallback, useEffect, useRef, useState } from 'react';

import { safeSessionStorage } from '../../factories/safeSessionStorage';
import { storageDefaultDeserializer } from '../../functions/storageDefaultDeserializer';
import { storageDefaultSerializer } from '../../functions/storageDefaultSerializer';
import { useLiveRef } from '../useLiveRef';

import {
  UseSessionStorageOptions,
  UseSessionStorageReturn,
  UseSessionStorageSetAction,
} from './types';

/**
 * React hook that binds a piece of state to `sessionStorage`.
 * Persists a value under `key`, initializes from storage (or `initialValue`),
 * and returns `[value, setValue]` where the setter accepts a value or a functional updater.
 * You can pass `serializer`/`deserializer` to control how values are stored.
 *
 * @template ValueType
 * @param {string} key Storage key.
 * @param {undefined} [initialValue] Optional initial value.
 * @param {UseSessionStorageOptions<ValueType>} [options] Optional serializer/deserializer.
 * @returns {UseSessionStorageReturn<ValueType | undefined>} `[value, setValue]` where `value` may be `undefined`.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useSessionStorage.md
 */
function useSessionStorage<ValueType = undefined>(
  key: string,
  initialValue?: undefined,
  options?: UseSessionStorageOptions<ValueType>,
): UseSessionStorageReturn<ValueType | undefined>;

/**
 * React hook that binds a piece of state to `sessionStorage`.
 * Persists a value under `key`, initializes from storage (or `initialValue`),
 * and returns `[value, setValue]` where the setter accepts a value or a functional updater.
 * You can pass `serializer`/`deserializer` to control how values are stored.
 *
 * @template ValueType
 * @param {string} key Storage key.
 * @param {ValueType | (() => ValueType)} initialValue Initial value or factory.
 * @param {UseSessionStorageOptions<ValueType>} [options] Optional serializer/deserializer.
 * @returns {UseSessionStorageReturn<ValueType>} `[value, setValue]` where `value` is always defined.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useSessionStorage.md
 */
function useSessionStorage<ValueType>(
  key: string,
  initialValue: ValueType | (() => ValueType),
  options?: UseSessionStorageOptions<ValueType>,
): UseSessionStorageReturn<ValueType>;

function useSessionStorage<ValueType>(
  key: string,
  initialValue?: ValueType | undefined | (() => ValueType | undefined),
  options: UseSessionStorageOptions<ValueType | undefined> = {},
): UseSessionStorageReturn<ValueType | undefined> {
  const {
    deserializer = storageDefaultDeserializer,
    serializer = storageDefaultSerializer,
  } = options;

  // Keep latest functions and key to avoid stale closures
  const sharedOptionsLiveRef = useLiveRef({
    deserializer,
    getInitialValue: () => {
      return initialValue instanceof Function ? initialValue() : initialValue;
    },
    initValue: () => {
      const rawValue = safeSessionStorage.getItem(key);
      const parsedValue =
        rawValue !== null ? deserializer(key, rawValue) : undefined;
      return parsedValue !== undefined
        ? parsedValue
        : sharedOptionsLiveRef.current.getInitialValue();
    },
    key,
    serializer,
  });

  const prevKeyRef = useRef(key);

  // Lazy read the initial value from storage / initialValue
  const [currentValue, setCurrentValue] = useState<ValueType | undefined>(
    sharedOptionsLiveRef.current.initValue,
  );

  /** Updates the state and writes the new value under the same key in `sessionStorage`. */
  const setValue = useCallback(
    (value: UseSessionStorageSetAction<ValueType | undefined>) => {
      setCurrentValue((prevValue) => {
        const live = sharedOptionsLiveRef.current;
        const finalValue = value instanceof Function ? value(prevValue) : value;

        if (finalValue !== undefined) {
          const rawValue = live.serializer(live.key, finalValue as ValueType);
          safeSessionStorage.setItem(live.key, rawValue);
        } else {
          safeSessionStorage.removeItem(live.key);
        }

        return finalValue;
      });
    },
    [],
  );

  // Re‑read when the key changes
  useEffect(() => {
    if (key !== prevKeyRef.current) {
      prevKeyRef.current = key;
      setCurrentValue(sharedOptionsLiveRef.current.initValue());
    }
  }, [key]);

  return [currentValue, setValue] as const;
}

export { useSessionStorage };
