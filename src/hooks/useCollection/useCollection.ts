import {
  Collection,
  CollectionBaseItemData,
  CollectionDefaultKeyType,
  CollectionItem,
  CollectionOptions,
  CollectionPrimaryKeyWithDefault,
  CollectionUpdateEvent,
} from '@webeach/collection';
import { useMemo, useState } from 'react';

import { UseCollectionReturn } from './types';

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
 *   - `initialItems` — Optional array of initial items.
 *
 * @returns A tuple:
 *   - `[items]` — The current list of items in the collection.
 *   - `collection` — The `Collection` instance with all available methods.
 *
 * @example
 * const [items, collection] = useCollection({
 *   primaryKey: 'id',
 *   initialItems: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
 * });
 *
 * @see https://github.com/webeach/collection
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useCollection.md
 */
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<
    PrimaryKey,
    PrimaryKeyType
  > = CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  options?: CollectionOptions<
    CollectionPrimaryKeyWithDefault<PrimaryKey>,
    PrimaryKeyType,
    ItemData
  >,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;

/**
 * A React hook that creates a `Collection` from an array of initial items using the default primary key `"key"`.
 *
 * Use this overload for simpler use cases when you don't need to configure the primary key manually.
 *
 * @template PrimaryKey - The name of the primary key field (default: `"key"`).
 * @template PrimaryKeyType - The type of the primary key (default: `string | number`).
 * @template ItemData - The structure of each item in the collection.
 *
 * @param initialItems - Optional array of items to initialize the collection with.
 *
 * @returns A tuple:
 *   - `[items]` — The current list of items in the collection.
 *   - `collection` — The `Collection` instance with all available methods.
 *
 * @example
 * const [items, collection] = useCollection([
 *   { key: 'a1', label: 'Alpha' },
 *   { key: 'b2', label: 'Beta' },
 * ]);
 *
 * @see https://github.com/webeach/collection
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useCollection.md
 */
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<
    PrimaryKey,
    PrimaryKeyType
  > = CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  initialItems?: ReadonlyArray<
    CollectionItem<
      CollectionPrimaryKeyWithDefault<PrimaryKey>,
      PrimaryKeyType,
      ItemData
    >
  >,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;

function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<
    PrimaryKey,
    PrimaryKeyType
  > = CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  optionsOrInitialItems?:
    | CollectionOptions<PrimaryKey, PrimaryKeyType, ItemData>
    | ReadonlyArray<
        CollectionItem<
          CollectionPrimaryKeyWithDefault<PrimaryKey>,
          PrimaryKeyType,
          ItemData
        >
      >,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData> {
  const instance = useMemo(() => {
    const options = (
      Array.isArray(optionsOrInitialItems)
        ? {
            initialItems: optionsOrInitialItems,
          }
        : optionsOrInitialItems
    ) as
      | CollectionOptions<
          CollectionPrimaryKeyWithDefault<PrimaryKey>,
          PrimaryKeyType,
          ItemData
        >
      | undefined;

    return new Collection<PrimaryKey, PrimaryKeyType, ItemData>(options);
  }, []);

  const [currentState, setCurrentState] = useState<
    ReadonlyArray<
      CollectionItem<
        CollectionPrimaryKeyWithDefault<PrimaryKey>,
        PrimaryKeyType,
        ItemData
      >
    >
  >(() => Array.from(instance));

  instance.onUpdate = (
    event: CollectionUpdateEvent<
      CollectionPrimaryKeyWithDefault<PrimaryKey>,
      PrimaryKeyType,
      ItemData
    >,
  ) => {
    setCurrentState(event.detail);
  };

  return [currentState, instance];
}

export { useCollection };
