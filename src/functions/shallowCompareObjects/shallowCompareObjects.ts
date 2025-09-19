import { PlainObject } from '../../types/common';

/**
 * Performs a shallow comparison between two plain objects.
 *
 * Returns `true` if both objects have the same set of own enumerable keys
 * and all corresponding values are strictly equal (`===`).
 *
 * Note:
 * - This function does not perform deep comparison of nested objects or arrays.
 * - It returns `true` only if the keys and values are strictly equal.
 * - It does not compare prototype chains or symbols.
 *
 * @param firstObject - The first object to compare.
 * @param secondObject - The second object to compare.
 * @returns `true` if the objects are shallowly equal, otherwise `false`.
 *
 * @example
 * shallowCompareObjects({ a: 1, b: 2 }, { a: 1, b: 2 });   // true
 * shallowCompareObjects({ a: 1 }, { a: 1, b: 2 });         // false
 * shallowCompareObjects({ a: { x: 1 } }, { a: { x: 1 } }); // false (different references)
 * const shared = { x: 1 };
 * shallowCompareObjects({ a: shared }, { a: shared });     // true
 */
export function shallowCompareObjects(
  firstObject: PlainObject,
  secondObject: PlainObject,
): boolean {
  if (firstObject === secondObject) {
    return true;
  }

  const firstKeys = Object.keys(firstObject);
  const secondKeys = Object.keys(secondObject);

  if (firstKeys.length !== secondKeys.length) {
    return false;
  }

  for (let index = 0; index < firstKeys.length; index++) {
    const key = firstKeys[index]!;
    if (
      !Object.prototype.hasOwnProperty.call(secondObject, key) ||
      firstObject[key] !== secondObject[key]
    ) {
      return false;
    }
  }

  return true;
}
