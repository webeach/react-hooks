import { useMemo } from 'react';

import { ExtendedMap } from '../../classes/ExtendedMap';
import { isFunction } from '../../functions/isFunction';
import { useForceUpdate } from '../useForceUpdate';

/**
 * React hook that creates an `ExtendedMap` instance which triggers a component re-render
 * on mutation (`set`, `delete`, `clear`, `replaceAll`, etc).
 *
 * The map instance is memoized and stable across renders.
 *
 * @template KeyType - Type of the keys in the map.
 * @template ValueType - Type of the values in the map.
 *
 * @param initialEntries - Optional initial entries for the map. Can be a static array or a factory function.
 * @returns A reactive instance of {@link ExtendedMap} that re-renders the component on updates.
 *
 * @example
 * ```tsx
 * const users = useMap<string, { name: string }>([
 *   ['user1', { name: 'Alice' }],
 *   ['user2', { name: 'Bob' }],
 * ]);
 *
 * useEffect(() => {
 *   const timer = setTimeout(() => {
 *     users.set('user3', { name: 'Charlie' }); // will re-render the component
 *   }, 1000);
 *   return () => clearTimeout(timer);
 * }, []);
 * ```
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useMap.md
 */
export function useMap<KeyType = any, ValueType = any>(
  initialEntries?:
    | ReadonlyArray<[KeyType, ValueType]>
    | (() => ReadonlyArray<[KeyType, ValueType]>),
): ExtendedMap<KeyType, ValueType> {
  const forceUpdate = useForceUpdate();

  return useMemo(() => {
    const entries = isFunction(initialEntries)
      ? initialEntries()
      : initialEntries;

    const extendedMap = new ExtendedMap(entries);

    extendedMap.onUpdate = () => forceUpdate();

    return extendedMap;
  }, []);
}
