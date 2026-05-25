import {
  Collection,
  CollectionBaseItemData,
  CollectionDefaultKeyType,
  CollectionOptions,
  CollectionPrimaryKeyWithDefault,
} from '@webeach/collection';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { isFunction } from '../../functions/isFunction';
import {
  UseCollectionInitialItemsFactory,
  UseCollectionMethods,
  UseCollectionOptions,
  UseCollectionReturn,
} from './types';

/**
 * A React hook that creates and manages a `Collection` instance with full configuration.
 *
 * Use this overload if you need to specify a custom primary key field or pass advanced collection options.
 * The hook will subscribe to changes in the collection and trigger re-renders when the items change.
 *
 * @template PrimaryKey - The name of the primary key field (default: `"key"`).
 * @template PrimaryKeyType - The type of the primary key (default: `string | number`).
 * @template ItemData - The structure of each item in the collection.
 *
 * @param options - An object containing configuration options for the collection.
 *   - `primaryKey` — Optional custom field name to use as the primary key.
 *   - `initialItems` — Optional array of initial items, or a lazy factory that
 *     returns one (invoked once on the first render).
 *
 * @returns A tuple:
 *   - `state` — The reactive list of items in the collection.
 *   - `methods` — Stable facade with mutation/query methods
 *     (`appendItem`, `removeItem`, `setItems`, etc.).
 *
 * @example
 * const [items, { appendItem }] = useCollection({
 *   primaryKey: 'id',
 *   initialItems: () => buildHeavyList(),
 * });
 *
 * @see https://github.com/webeach/collection
 * @see https://react-hooks.webea.ch/hooks/useCollection.html
 */
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  options?: UseCollectionOptions<PrimaryKey, PrimaryKeyType, ItemData>,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;

/**
 * A React hook that creates a `Collection` from an array of initial items using the default primary key `"key"`.
 *
 * @template PrimaryKey - The name of the primary key field (default: `"key"`).
 * @template PrimaryKeyType - The type of the primary key (default: `string | number`).
 * @template ItemData - The structure of each item in the collection.
 *
 * @param initialItems - Optional array of items to initialize the collection with.
 *
 * @returns A tuple:
 *   - `state` — The reactive list of items in the collection.
 *   - `methods` — Stable facade with mutation/query methods.
 *
 * @example
 * const [items, methods] = useCollection([
 *   { key: 'a1', label: 'Alpha' },
 *   { key: 'b2', label: 'Beta' },
 * ]);
 *
 * @see https://github.com/webeach/collection
 * @see https://react-hooks.webea.ch/hooks/useCollection.html
 */
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  initialItems?: ReadonlyArray<ItemData>,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;

/**
 * A React hook that creates a `Collection` from a lazy factory that returns the
 * initial items. The factory is invoked once on the first render — useful for
 * expensive computations.
 *
 * @template PrimaryKey - The name of the primary key field (default: `"key"`).
 * @template PrimaryKeyType - The type of the primary key (default: `string | number`).
 * @template ItemData - The structure of each item in the collection.
 *
 * @param initialItemsFactory - Factory returning the initial items array.
 *
 * @returns A tuple:
 *   - `state` — The reactive list of items in the collection.
 *   - `methods` — Stable facade with mutation/query methods.
 *
 * @example
 * const [items, { appendItem }] = useCollection(() => buildHeavyList());
 *
 * @see https://github.com/webeach/collection
 * @see https://react-hooks.webea.ch/hooks/useCollection.html
 */
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  initialItemsFactory: UseCollectionInitialItemsFactory<
    PrimaryKey,
    PrimaryKeyType,
    ItemData
  >,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;

function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  optionsOrInitialItemsOrFactory?:
    | UseCollectionOptions<PrimaryKey, PrimaryKeyType, ItemData>
    | ReadonlyArray<ItemData>
    | UseCollectionInitialItemsFactory<PrimaryKey, PrimaryKeyType, ItemData>,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData> {
  const instance = useMemo(() => {
    type ResolvedOptions = CollectionOptions<
      CollectionPrimaryKeyWithDefault<PrimaryKey>,
      PrimaryKeyType,
      ItemData
    >;

    let options: ResolvedOptions | undefined;

    if (isFunction(optionsOrInitialItemsOrFactory)) {
      // Bare factory form: useCollection(() => [...])
      options = { initialItems: optionsOrInitialItemsOrFactory() };
    } else if (Array.isArray(optionsOrInitialItemsOrFactory)) {
      // Bare array form: useCollection([...])
      options = { initialItems: optionsOrInitialItemsOrFactory };
    } else if (optionsOrInitialItemsOrFactory) {
      // Options object form: useCollection({ ..., initialItems: [...] | () => [...] })
      // Cast is safe: the two array/function branches above have already returned.
      const userOptions =
        optionsOrInitialItemsOrFactory as UseCollectionOptions<
          PrimaryKey,
          PrimaryKeyType,
          ItemData
        >;
      options = {
        ...userOptions,
        initialItems: isFunction(userOptions.initialItems)
          ? userOptions.initialItems()
          : userOptions.initialItems,
      } as ResolvedOptions;
    }

    return new Collection<PrimaryKey, PrimaryKeyType, ItemData>(options);
  }, []);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      instance.addEventListener('update', onStoreChange);

      return () => {
        instance.removeEventListener('update', onStoreChange);
      };
    },
    [instance],
  );

  // `instance.items` is `CollectionItem<...>[]` which differs from `ItemData[]`
  // only by a `readonly` modifier on the primary key — structurally compatible,
  // so a single direct cast (no `unknown` bridge) is enough.
  const getSnapshot = (): ReadonlyArray<ItemData> =>
    instance.items as ReadonlyArray<ItemData>;

  const currentState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  // Narrow, stable facade — TS enforces conformance to UseCollectionMethods,
  // so missing/renamed methods on Collection will surface as a type error.
  const methods = useMemo<
    UseCollectionMethods<PrimaryKey, PrimaryKeyType, ItemData>
  >(
    () => ({
      appendItem: instance.appendItem.bind(instance),
      appendItemAt: instance.appendItemAt.bind(instance),
      clear: instance.clear.bind(instance),
      getItem: instance.getItem.bind(instance),
      hasItem: instance.hasItem.bind(instance),
      insertItemAfter: instance.insertItemAfter.bind(instance),
      insertItemBefore: instance.insertItemBefore.bind(instance),
      patchItem: instance.patchItem.bind(instance),
      prependItem: instance.prependItem.bind(instance),
      removeItem: instance.removeItem.bind(instance),
      replaceItem: instance.replaceItem.bind(instance),
      reset: instance.reset.bind(instance),
      setItems: instance.setItems.bind(instance),
    }),
    [instance],
  );

  return [currentState, methods];
}

export { useCollection };
