import { PlainObject } from '../../types/common';

/**
 * Function type used to deeply patch object-like state.
 *
 * Accepts either:
 * - A partial object to deeply merge into the current state.
 * - Or a function that receives the current state and returns a partial object to merge.
 *
 * Intended for use with `usePatchDeepState` or similar hooks where nested structures are updated.
 *
 * @template ObjectType - Shape of the state object.
 *
 * @param patchState - Partial object or updater function.
 */
export type UsePatchDeepStateFunction<
  ObjectType extends PlainObject = PlainObject,
> = (
  patchState:
    | Partial<ObjectType>
    | ((currentState: ObjectType) => Partial<ObjectType>),
) => void;
