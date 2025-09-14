import { MutableRefObject } from 'react';

import { UseDemandStructureAccessor } from '../types';

/**
 * Creates a `PropertyDescriptorMap` from a ref object containing accessor functions.
 * Each property becomes a getter that lazily invokes the current accessor from the ref
 * when the property is accessed. This ensures the accessors are always read from the
 * latest ref value, making the result safe for dynamic updates between renders.
 *
 * Additionally, when a property is accessed, a flag is set in the `usingMapRef` object
 * under the same key. This allows tracking which properties were actually used
 * (e.g. for conditional side effects or lazy evaluation tracking).
 *
 * @param accessorsRef - A `ref` pointing to an object with accessor functions as values.
 * @param usingMapRef - A `ref` pointing to a plain object where each key corresponds
 *                      to a boolean usage flag for the respective property.
 *
 * @returns A `PropertyDescriptorMap` with lazy-evaluated property getters.
 *
 * @example
 * const accessorsRef = { current: { a: () => 1, b: () => 'hello' } };
 * const usingMapRef = { current: { a: false, b: false } };
 * const descriptor = createObjectDescriptor(accessorsRef, usingMapRef);
 * const obj = Object.defineProperties({}, descriptor);
 *
 * console.log(obj.a); // 1
 * console.log(usingMapRef.current.a); // true
 * console.log(usingMapRef.current.b); // false
 */
export function createObjectDescriptor(
  accessorsRef: MutableRefObject<Record<string, UseDemandStructureAccessor>>,
  usingMapRef: MutableRefObject<Record<string, boolean>>,
) {
  const descriptor: PropertyDescriptorMap = {};

  for (const key in accessorsRef.current) {
    // Ensure property is actually on the object (not from prototype chain)
    if (Object.prototype.hasOwnProperty.call(accessorsRef.current, key)) {
      descriptor[key] = {
        get: () => {
          const isInitialAccess = !usingMapRef.current[key];
          usingMapRef.current[key] = true;
          return accessorsRef.current[key]!(isInitialAccess);
        },
        enumerable: true,
      };
    }
  }

  return descriptor;
}
