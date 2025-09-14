import { PlainObject } from '../../types/common';

/**
 * Function type used to partially update object-like state.
 *
 * Accepts either:
 * - A partial object `{ ... }` to be shallowly merged into current state.
 * - Or a function that receives the current state and returns a partial object to merge.
 *
 * Commonly used in `usePatchState`-like hooks.
 *
 * @template ObjectType - Shape of the state object.
 *
 * @param patchState - Partial object or updater function.
 */
export type UsePatchStateFunction<
  ObjectType extends PlainObject = PlainObject,
> = (
  patchState:
    | Partial<ObjectType>
    | ((currentState: ObjectType) => Partial<ObjectType>),
) => void;
