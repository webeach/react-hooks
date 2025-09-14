import { PlainObject } from '../../types/common';

/**
 * Determines whether the provided value is a plain object.
 *
 * A plain object is defined as:
 * - An object created via `{}` or `new Object()` (i.e., prototype is `Object.prototype`)
 * - An object created via `Object.create(null)` (i.e., no prototype at all)
 * - An object from another realm (e.g., iframe) whose prototype chain ends at `null`
 *
 * This check avoids relying on `instanceof` or `__proto__`, making it robust across realms and edge cases.
 *
 * @param object - The value to test.
 * @returns `true` if the value is a plain object, `false` otherwise.
 *
 * @example
 * isPlainObject({}); // true
 * isPlainObject(Object.create(null)); // true
 * isPlainObject(new class {}()); // false
 * isPlainObject([]); // false
 */
export function isPlainObject(object: unknown): object is PlainObject {
  if (object !== null && typeof object === 'object') {
    const proto = Object.getPrototypeOf(object);

    return (
      // Direct instance of a plain object
      proto === Object.prototype ||
      // Object with null prototype (e.g., Object.create(null))
      proto === null ||
      // Object from another realm (e.g., iframe) with a prototype that itself has no prototype
      Object.getPrototypeOf(proto) === null
    );
  }

  return false;
}
