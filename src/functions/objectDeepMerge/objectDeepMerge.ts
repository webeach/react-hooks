import { PlainObject } from '../../types/common';
import { isPlainObject } from '../isPlainObject';

/**
 * Deeply merges two objects and returns a new object.
 * - Only plain objects are merged recursively.
 * - All other values (including arrays, classes, functions) are overwritten.
 * - Neither of the input objects is mutated.
 *
 * @param targetObject - The base object.
 * @param patchObject - The object to merge into the base.
 * @returns A new object with deeply merged properties.
 *
 * @example
 * objectDeepMerge(
 *   { user: { name: 'Alice', meta: { age: 25 } } },
 *   { user: { meta: { age: 30 } } }
 * )
 * // → { user: { name: 'Alice', meta: { age: 30 } } }
 */
export function objectDeepMerge<ObjectType extends PlainObject>(
  targetObject: ObjectType,
  patchObject: Partial<ObjectType>,
): ObjectType {
  const result: PlainObject = { ...targetObject };

  for (const key in patchObject) {
    const patchValue: unknown = patchObject[key];
    const targetValue: unknown = targetObject[key];

    if (isPlainObject(patchValue) && isPlainObject(targetValue)) {
      result[key] = objectDeepMerge(targetValue, patchValue);
    } else {
      result[key] = patchValue;
    }
  }

  return result as ObjectType;
}
