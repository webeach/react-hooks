import { MutableRefObject } from 'react';

import {
  UseDemandStructureAccessor,
  UseDemandStructureAccessorWithAlias,
} from '../types';

/**
 * Creates a `PropertyDescriptorMap` for a hybrid structure that behaves both like an array and an object.
 * Each element in the input array can be either:
 * - a simple accessor function (indexed by number), or
 * - an object with an `alias` key and an `accessor` function (indexed by number and alias).
 *
 * Each property is a getter that lazily evaluates its value by calling the latest accessor from the ref.
 * Also tracks which properties were accessed by updating the corresponding entry in `usingMapRef`.
 *
 * Additionally defines `length` and `Symbol.iterator` to allow use with array-like operations.
 *
 * @param accessorsRef - Ref to a list of accessors or accessor-alias objects.
 * @param usingMapRef - Ref to an object used for tracking which properties were accessed.
 *                      Keys (number or string) are set to `true` when accessed.
 *
 * @returns A `PropertyDescriptorMap` that can be passed to `Object.defineProperties`.
 *
 * @example
 * const accessorsRef = {
 *   current: [
 *     () => 1,
 *     { alias: 'msg', accessor: () => 'hello' },
 *   ],
 * };
 *
 * const usingMapRef = { current: {} };
 * const descriptors = createIterableObjectDescriptor(accessorsRef, usingMapRef);
 * const result = Object.defineProperties({}, descriptors);
 *
 * console.log(result[0]); // 1
 * console.log(result[1]); // 'hello'
 * console.log(result.msg); // 'hello'
 * console.log([...result]); // [1, 'hello']
 * console.log(usingMapRef.current); // { 0: true, 1: true, msg: true }
 */
export function createIterableObjectDescriptor(
  accessorsRef: MutableRefObject<
    ReadonlyArray<
      UseDemandStructureAccessor | UseDemandStructureAccessorWithAlias
    >
  >,
  usingMapRef: MutableRefObject<Record<string | number, boolean>>,
) {
  const descriptor: PropertyDescriptorMap = {
    // Define non-enumerable `length` property
    length: {
      enumerable: false,
      value: accessorsRef.current.length,
    },

    // Define non-enumerable iterator for array-like behavior
    [Symbol.iterator]: {
      enumerable: false,
      value: function* (this: ArrayLike<unknown>) {
        for (let i = 0; i < this.length; i++) {
          yield this[i];
        }
      },
    },
  };

  // Create lazy getters for each indexes/aliases
  for (let i = 0; i < accessorsRef.current.length; i++) {
    if (typeof accessorsRef.current[i] === 'function') {
      descriptor[i] = {
        get: () => {
          const isInitialAccess = !usingMapRef.current[i];
          usingMapRef.current[i] = true;
          return (accessorsRef.current[i] as UseDemandStructureAccessor)(
            isInitialAccess,
          );
        },
        enumerable: true,
      };

      continue;
    }

    const aliasKey = (
      accessorsRef.current[i] as UseDemandStructureAccessorWithAlias
    ).alias;

    const descriptorItem: PropertyDescriptor = {
      get: () => {
        const isInitialAccess =
          !usingMapRef.current[i] && !usingMapRef.current[aliasKey];

        usingMapRef.current[i] = true;
        usingMapRef.current[aliasKey] = true;

        return (
          accessorsRef.current[i] as UseDemandStructureAccessorWithAlias
        ).accessor(isInitialAccess);
      },
      enumerable: true,
    };

    descriptor[i] = descriptorItem;
    descriptor[aliasKey] = descriptorItem;
  }

  return descriptor;
}
