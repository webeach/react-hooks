import { MutableRefObject, useMemo, useRef } from 'react';

import { useLiveRef } from '../useLiveRef';

import { createIterableObjectDescriptor } from './utils/createIterableObjectDescriptor';
import { createObjectDescriptor } from './utils/createObjectDescriptor';

import { $DemandStructureUsingSymbol } from './constants';
import {
  UseDemandStructureAccessor,
  UseDemandStructureAccessorWithAlias,
  UseDemandStructureReturnBase,
} from './types';

/**
 * Creates a structure with properties that compute their values on each access.
 * Each element in the returned object is defined as a getter that invokes its accessor function
 * every time the property is read. Also attaches a special symbol `$DemandStructureUsingSymbol`
 * that tracks which properties have been accessed.
 *
 * This is useful for conditional state updates or performance optimizations
 * when values shouldn't be computed unless explicitly used.
 *
 * @param accessors - An array of factory functions.
 * @returns An array-like structure with demand-evaluated values and usage tracking.
 *
 * @example
 * ```tsx
 * const [a, b] = useDemandStructure([() => 1, () => 2]);
 * ```
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDemandStructure.md
 */
function useDemandStructure<
  const AccessorArray extends readonly UseDemandStructureAccessor<any>[],
>(
  accessors: readonly [...AccessorArray],
): UseDemandStructureReturnBase<{
  [Key in keyof AccessorArray]: AccessorArray[Key] extends UseDemandStructureAccessor<
    infer Return
  >
    ? Return
    : never;
}>;

/**
 * Creates a structure with both numeric indices and named aliases, where each property
 * computes its value on every access by invoking its associated accessor function.
 *
 * The result behaves like a hybrid object that supports:
 * - Array-style access via indices (`result[0]`)
 * - Named access via aliases (`result.aliasName`)
 *
 * Also attaches a special symbol `$DemandStructureUsingSymbol` that tracks which
 * indices and aliases were accessed.
 *
 * @param accessors - An array of objects with `{ alias, accessor }` format.
 * @returns A hybrid object with numeric and alias properties, all lazily evaluated and tracked.
 *
 * @example
 * const result = useDemandStructure([
 *   { alias: 'foo', accessor: () => 123 },
 *   { alias: 'bar', accessor: () => 'hello' }
 * ]);
 *
 * console.log(result[0]);    // 123
 * console.log(result.foo);   // 123
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDemandStructure.md
 */
function useDemandStructure<
  const AccessorArray extends ReadonlyArray<
    UseDemandStructureAccessorWithAlias<any>
  >,
>(
  accessors: AccessorArray,
): UseDemandStructureReturnBase<
  {
    [Index in keyof AccessorArray]: AccessorArray[Index] extends UseDemandStructureAccessorWithAlias<
      infer Value
    >
      ? Value
      : never;
  } & {
    readonly [Item in AccessorArray[number] as Item['alias']]: Item extends UseDemandStructureAccessorWithAlias<
      infer Value
    >
      ? Value
      : never;
  }
>;

/**
 * Creates an object where each key is a getter that invokes its accessor function
 * every time the property is accessed.
 *
 * Also attaches a special symbol `$DemandStructureUsingSymbol` that tracks which
 * keys were accessed during usage.
 *
 * @param accessors - An object mapping keys to accessor functions.
 * @returns An object with on-demand computed properties and access tracking.
 *
 * @example
 * const result = useDemandStructure({
 *   name: () => 'John',
 *   age: () => 30
 * });
 *
 * console.log(result.name); // 'John'
 * console.log(result.age);  // 30
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useDemandStructure.md
 */
function useDemandStructure<
  const AccessorObject extends {
    readonly [key: string]: UseDemandStructureAccessor;
  },
>(
  accessors: AccessorObject,
): UseDemandStructureReturnBase<{
  [Key in keyof AccessorObject]: ReturnType<AccessorObject[Key]>;
}>;

function useDemandStructure(
  accessors:
    | ReadonlyArray<
        UseDemandStructureAccessor | UseDemandStructureAccessorWithAlias
      >
    | Record<string, UseDemandStructureAccessor>,
) {
  // Store live references to avoid stale closures
  const accessorsLiveRef = useLiveRef(accessors);
  const usingMapRef = useRef<Record<string | number, boolean>>({});

  return useMemo(() => {
    const resultObject: object = {};

    // Decide which kind of descriptor to build: iterable (array/tuple) or key-based object
    const descriptorMap: PropertyDescriptorMap = Array.isArray(
      accessorsLiveRef.current,
    )
      ? createIterableObjectDescriptor(
          accessorsLiveRef as MutableRefObject<
            ReadonlyArray<
              UseDemandStructureAccessor | UseDemandStructureAccessorWithAlias
            >
          >,
          usingMapRef,
        )
      : createObjectDescriptor(
          accessorsLiveRef as MutableRefObject<
            Record<string, UseDemandStructureAccessor>
          >,
          usingMapRef,
        );

    // Attach internal symbol with usage tracking map
    Object.defineProperty(resultObject, $DemandStructureUsingSymbol, {
      enumerable: false,
      value: usingMapRef.current,
    });

    // Finalize object with lazy descriptors
    return Object.defineProperties(resultObject, descriptorMap);
  }, []);
}

export { useDemandStructure };
