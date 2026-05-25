import type {
  Collection,
  CollectionBaseItemData,
  CollectionDefaultKeyType,
  CollectionOptions,
  CollectionPrimaryKeyWithDefault,
} from '@webeach/collection';

/**
 * Names of `Collection` methods exposed by `useCollection`.
 *
 * Read-only getters such as `items` and `numItems` are intentionally NOT
 * included — use the reactive `state` from the hook instead. Subscription
 * APIs (`addEventListener`/`removeEventListener`) are managed by the hook
 * internally and are also excluded.
 */
type CollectionMethodName =
  | 'appendItem'
  | 'appendItemAt'
  | 'clear'
  | 'getItem'
  | 'hasItem'
  | 'insertItemAfter'
  | 'insertItemBefore'
  | 'patchItem'
  | 'prependItem'
  | 'removeItem'
  | 'replaceItem'
  | 'reset'
  | 'setItems';

/**
 * Lazy initializer for `initialItems` — invoked once on the first render.
 *
 * @template PrimaryKey - The name of the primary key field.
 * @template PrimaryKeyType - The type of the primary key value.
 * @template ItemData - The shape of the data items in the collection.
 */
export type UseCollectionInitialItemsFactory<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
> = () => ReadonlyArray<ItemData>;

/**
 * Extended options for `useCollection` that accept `initialItems` either as an
 * array or as a lazy factory function (similar to `useState`'s lazy initializer).
 *
 * @template PrimaryKey - The name of the primary key field.
 * @template PrimaryKeyType - The type of the primary key value.
 * @template ItemData - The shape of the data items in the collection.
 */
export type UseCollectionOptions<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
> = Omit<
  CollectionOptions<
    CollectionPrimaryKeyWithDefault<PrimaryKey>,
    PrimaryKeyType,
    ItemData
  >,
  'initialItems'
> & {
  /**
   * Initial items. Can be either an array or a lazy factory function
   * that returns an array — invoked only once on the first render.
   */
  initialItems?:
    | ReadonlyArray<ItemData>
    | UseCollectionInitialItemsFactory<PrimaryKey, PrimaryKeyType, ItemData>;
};

/**
 * A narrowed, public-facing facade over the `Collection` instance exposing
 * only mutation/query methods. Stable across renders.
 *
 * @template PrimaryKey - The name of the primary key field.
 * @template PrimaryKeyType - The type of the primary key value.
 * @template ItemData - The shape of the data items in the collection.
 */
export type UseCollectionMethods<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
> = Pick<
  Collection<PrimaryKey, PrimaryKeyType, ItemData>,
  CollectionMethodName
>;

/**
 * The return type of the `useCollection` hook.
 *
 * @template PrimaryKey - The name of the primary key field in the item data. Defaults to `'key'`.
 * @template PrimaryKeyType - The type of the primary key value. Defaults to `string | number`.
 * @template ItemData - The shape of the data items in the collection.
 *
 * This tuple includes:
 * - `state` — A read-only array of all items in the collection. It updates reactively when the collection changes.
 * - `methods` — A narrowed facade over the underlying `Collection` with stable method references.
 */
export type UseCollectionReturn<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
> = readonly [
  /**
   * Reactive array of items in the collection.
   * Automatically updates when the collection changes.
   */
  state: ReadonlyArray<ItemData>,

  /**
   * Stable facade with mutation and query methods (`appendItem`, `removeItem`, etc.).
   * Method references do not change across renders, so it is safe to use them
   * directly as effect dependencies.
   */
  methods: UseCollectionMethods<PrimaryKey, PrimaryKeyType, ItemData>,
];
