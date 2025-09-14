import { useCallback, useState } from 'react';

import { isFunction } from '../../functions/isFunction';
import { PlainObject } from '../../types/common';

import { UsePatchStateFunction } from './types';

/**
 * A React hook that manages an object-like state with support for partial updates (patching).
 *
 * Behaves similarly to `this.setState` in class components, allowing you to update only part of the state.
 * You can pass either a partial object or a function that returns a partial object based on the previous state.
 *
 * @template ObjectType - The shape of the object state.
 *
 * @param initialState - The initial full state, or a function that returns it.
 * @returns A tuple with:
 * - the current state object,
 * - and a patch function to partially update it.
 *
 * @example
 * ```tsx
 * const [form, patchForm] = usePatchState({ name: '', age: 0 });
 *
 * patchForm({ name: 'Alice' }); // ✅ only updates 'name'
 * patchForm(prev => ({ age: prev.age + 1 })); // ✅ functional update
 * ```
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/usePatchState.md
 */
export function usePatchState<ObjectType extends PlainObject>(
  initialState: ObjectType | (() => ObjectType),
) {
  const [currentState, setCurrentState] = useState<ObjectType>(initialState);

  const patchState = useCallback<UsePatchStateFunction<ObjectType>>((patch) => {
    setCurrentState((prevState) => {
      return {
        ...prevState,
        ...(isFunction(patch) ? patch(prevState) : patch),
      };
    });
  }, []);

  return [currentState, patchState] as const;
}
