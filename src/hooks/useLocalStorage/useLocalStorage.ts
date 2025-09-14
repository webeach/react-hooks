import { useCallback, useEffect, useRef, useState } from 'react';

import { safeLocalStorage } from '../../factories/safeLocalStorage';
import { storageDefaultDeserializer } from '../../functions/storageDefaultDeserializer';
import { storageDefaultSerializer } from '../../functions/storageDefaultSerializer';
import { useLiveRef } from '../useLiveRef';

import {
  UseLocalStorageOptions,
  UseLocalStorageReturn,
  UseLocalStorageSetAction,
} from './types';

/**
 * React hook that binds a piece of state to `localStorage`.
 * Persists a value under `key`, initializes from storage (or `initialValue`),
 * and returns `[value, setValue]` where the setter accepts a value or a functional updater.
 * You can pass `serializer`/`deserializer` and enable cross‑tab updates via `watch`.
 *
 * @template ValueType
 * @param {string} key Storage key.
 * @param {undefined} [initialValue] Optional initial value.
 * @param {UseLocalStorageOptions<ValueType>} [options] Optional serializer/deserializer and `watch`.
 * @returns {UseLocalStorageReturn<ValueType | undefined>} `[value, setValue]` where `value` may be `undefined`.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useLocalStorage.md
 */
function useLocalStorage<ValueType = undefined>(
  key: string,
  initialValue?: undefined,
  options?: UseLocalStorageOptions<ValueType>,
): UseLocalStorageReturn<ValueType | undefined>;

/**
 * React hook that binds a piece of state to `localStorage`.
 * Persists a value under `key`, initializes from storage (or `initialValue`),
 * and returns `[value, setValue]` where the setter accepts a value or a functional updater.
 * You can pass `serializer`/`deserializer` and enable cross‑tab updates via `watch`.
 *
 * @template ValueType
 * @param {string} key Storage key.
 * @param {ValueType | (() => ValueType)} initialValue Initial value or factory.
 * @param {UseLocalStorageOptions<ValueType>} [options] Optional serializer/deserializer and `watch`.
 * @returns {UseLocalStorageReturn<ValueType>} `[value, setValue]` where `value` is always defined.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useLocalStorage.md
 */
function useLocalStorage<ValueType>(
  key: string,
  initialValue: ValueType | (() => ValueType),
  options?: UseLocalStorageOptions<ValueType>,
): UseLocalStorageReturn<ValueType>;

function useLocalStorage<ValueType>(
  key: string,
  initialValue?: ValueType | undefined | (() => ValueType | undefined),
  options: UseLocalStorageOptions<ValueType | undefined> = {},
): UseLocalStorageReturn<ValueType | undefined> {
  const {
    deserializer = storageDefaultDeserializer,
    serializer = storageDefaultSerializer,
    watch = false,
  } = options;

  // Keep latest functions and key to avoid stale closures
  const sharedOptionsLiveRef = useLiveRef({
    deserializer,
    getInitialValue: () => {
      return initialValue instanceof Function ? initialValue() : initialValue;
    },
    initValue: () => {
      const rawValue = safeLocalStorage.getItem(key);
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

  /** Updates the state and writes the new value under the same key in `localStorage`. */
  const setValue = useCallback(
    (value: UseLocalStorageSetAction<ValueType | undefined>) => {
      setCurrentValue((prevValue) => {
        const sharedOptionsLive = sharedOptionsLiveRef.current;

        const finalValue = value instanceof Function ? value(prevValue) : value;

        if (finalValue !== undefined) {
          const rawValue = sharedOptionsLiveRef.current.serializer(
            sharedOptionsLive.key,
            finalValue,
          );
          safeLocalStorage.setItem(sharedOptionsLive.key, rawValue);
        } else {
          safeLocalStorage.removeItem(sharedOptionsLive.key);
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

  // Optional cross‑tab sync
  useEffect(() => {
    if (!watch || safeLocalStorage.originInstance === null) {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      const sharedOptionsLive = sharedOptionsLiveRef.current;

      if (
        event.key !== key ||
        event.storageArea !== safeLocalStorage.originInstance
      ) {
        return;
      }

      const rawValue = event.newValue;

      if (rawValue !== null) {
        const value = sharedOptionsLive.deserializer(key, rawValue);

        setCurrentValue(value);
      } else {
        setCurrentValue(undefined);
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [key, watch]);

  return [currentValue, setValue] as const;
}

export { useLocalStorage };
