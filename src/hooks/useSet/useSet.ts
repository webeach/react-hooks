import { useMemo } from 'react';

import { ExtendedSet } from '../../classes/ExtendedSet';
import { isFunction } from '../../functions/isFunction';
import { useForceUpdate } from '../useForceUpdate';

/**
 * React hook that creates an `ExtendedSet` instance which triggers a component re-render
 * on mutation (`add`, `delete`, `clear`, `replaceAll`, etc).
 *
 * The set instance is memoized and stable across renders.
 *
 * @template ValueType - Type of the values in the set.
 *
 * @param initialValues - Optional initial values for the set. Can be a static array or a factory function.
 * @returns A reactive instance of {@link ExtendedSet} that re-renders the component on updates.
 *
 * @example
 * ```tsx
 * const tags = useSet<string>(['react', 'hooks']);
 *
 * useEffect(() => {
 *   const t = setTimeout(() => {
 *     tags.add('typescript'); // will re-render the component
 *   }, 1000);
 *   return () => clearTimeout(t);
 * }, []);
 * ```
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useSet.md
 */
export function useSet<ValueType = any>(
  initialValues?: ReadonlyArray<ValueType> | (() => ReadonlyArray<ValueType>),
): ExtendedSet<ValueType> {
  const forceUpdate = useForceUpdate();

  return useMemo(() => {
    const values = isFunction(initialValues) ? initialValues() : initialValues;

    const extendedSet = new ExtendedSet<ValueType>(values);

    // Wire component re-render on any mutation of the set
    extendedSet.onUpdate = () => forceUpdate();

    return extendedSet;
  }, []);
}
