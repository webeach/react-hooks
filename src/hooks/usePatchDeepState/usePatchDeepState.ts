import { useCallback, useState } from 'react';

import { isFunction } from '../../functions/isFunction';
import { objectDeepMerge } from '../../functions/objectDeepMerge/objectDeepMerge';
import { PlainObject } from '../../types/common';

import { UsePatchDeepStateFunction } from './types';

/**
 * React state hook that supports deep merging of partial state updates.
 *
 * Behaves similarly to `useState`, but allows passing partial state objects
 * or updater functions, with support for recursive deep merge of plain objects.
 *
 * @template ObjectType - The shape of the state object.
 * @param initialState - Initial object value or initializer function.
 * @returns A tuple with current state and deep patch function.
 *
 * @example
 * const [state, patch] = usePatchDeepState({ user: { name: 'Alice' } });
 * patch({ user: { age: 30 } }); // → merges deeply into state
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/usePatchDeepState.md
 */
export function usePatchDeepState<ObjectType extends PlainObject>(
  initialState: ObjectType | (() => ObjectType),
) {
  const [currentState, setCurrentState] = useState<ObjectType>(initialState);

  const patchState = useCallback<UsePatchDeepStateFunction<ObjectType>>(
    (patch) => {
      setCurrentState((prevState) => {
        return objectDeepMerge(
          prevState,
          isFunction(patch) ? patch(prevState) : patch,
        );
      });
    },
    [],
  );

  return [currentState, patchState] as const;
}
