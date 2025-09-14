import type {
  Collection,
  CollectionBaseItemData,
  CollectionDefaultKeyType,
  CollectionItem,
  CollectionPrimaryKeyWithDefault,
} from '@webeach/collection';

/**
 * The return type of the `useCollection` hook.
 *
 * @template PrimaryKey - The name of the primary key field in the item data. Defaults to `'key'`.
 * @template PrimaryKeyType - The type of the primary key value. Defaults to `string | number`.
 * @template ItemData - The shape of the data items in the collection.
 *
 * This tuple includes:
 * - `state` — A read-only array of all items in the collection. It updates reactively when the collection changes.
 * - `instance` — A fully featured `Collection` instance with methods like `appendItem`, `removeItem`, `reset`, etc.
 */
export type UseCollectionReturn<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<
    PrimaryKey,
    PrimaryKeyType
  > = CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
> = readonly [
  /**
   * Reactive array of items in the collection.
   * Automatically updates when the collection changes.
   */
  state: ReadonlyArray<
    CollectionItem<
      CollectionPrimaryKeyWithDefault<PrimaryKey>,
      PrimaryKeyType,
      ItemData
    >
  >,

  /**
   * The underlying `Collection` instance with full control methods.
   */
  instance: Collection<PrimaryKey, PrimaryKeyType, ItemData>,
];
