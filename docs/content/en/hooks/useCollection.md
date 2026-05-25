# `useCollection`

## Description

`useCollection` is a hook that wraps [`@webeach/collection`](https://github.com/webeach/collection). It creates a **stable `Collection`** under the hood and returns:

- a **reactive snapshot** of items — the component re-renders whenever the collection changes;
- a **stable facade `methods`** — a narrow public surface (`appendItem`, `patchItem`, `removeItem`, etc.). Method references never change across renders, so it's safe to pass them down as props or use them in effect dependencies.

The underlying `Collection` instance (and its event-subscription APIs) is intentionally hidden — subscriptions are managed by the hook for you.

The hook supports three forms of usage: **options object**, **bare initial items**, or a **lazy initial-items factory** (like `useState((init) => ...)`).

---

## Signature

```ts
// 1) Options object (with optional initialItems as array or factory)
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  options?: UseCollectionOptions<PrimaryKey, PrimaryKeyType, ItemData>,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;

// 2) Bare initial items
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> =
    CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  initialItems?: ReadonlyArray<ItemData>,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;

// 3) Lazy initial-items factory
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
```

- **Parameters**
  - `options?` — collection options (custom `primaryKey`, hooks, and `initialItems` as either an array or a lazy factory).
  - `initialItems?` — a plain array of items (uses the default primary key `"key"`).
  - `initialItemsFactory` — a function `() => items[]`, invoked **once** on the first render.

- **Returns**: `UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>` — a tuple:
  - `state` — `ReadonlyArray<ItemData>`, reactive snapshot of current items.
  - `methods` — stable facade with mutation/query methods.

### Methods exposed via `methods`

`appendItem`, `appendItemAt`, `clear`, `getItem`, `hasItem`, `insertItemAfter`, `insertItemBefore`, `patchItem`, `prependItem`, `removeItem`, `replaceItem`, `reset`, `setItems`.

Read-only getters (`items`, `numItems`) and event-subscription APIs (`addEventListener` / `removeEventListener`) are intentionally not exposed — use `state` directly (and `state.length`) for reads.

---

## Examples

### 1) Basic usage: todo list (type inferred)

```tsx
import { useCollection } from '@webeach/react-hooks';

export function TodoList() {
  const [tasks, { appendItem, patchItem, removeItem }] = useCollection([
    { key: 't1', title: 'Write docs', done: false },
    { key: 't2', title: 'Review PR', done: true },
  ]);

  const add = () => {
    appendItem({
      key: crypto.randomUUID(),
      title: 'New task',
      done: false,
    });
  };

  return (
    <div>
      <button onClick={add}>Add</button>
      <ul>
        {tasks.map((item) => (
          <li key={item.key}>
            <label>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => patchItem(item.key, { done: !item.done })}
              />
              {item.title}
            </label>
            <button onClick={() => removeItem(item.key)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2) Custom primary key `id: number` via options

```tsx
import { useCollection } from '@webeach/react-hooks';

type UserData = {
  id: number;
  name: string;
};

export function Users() {
  const [users, { patchItem, setItems }] = useCollection<
    'id',
    number,
    UserData
  >({
    primaryKey: 'id',
    initialItems: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  });

  const rename = (id: number, name: string) => {
    patchItem(id, { name });
  };

  const reloadAll = async () => {
    const next = await fetch('/api/users').then((response) => response.json());
    setItems(next); // full replacement of contents
  };

  return (
    <>
      <button onClick={reloadAll}>Reload</button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </>
  );
}
```

### 3) Lazy initialization for a heavy seed

```tsx
import { useCollection } from '@webeach/react-hooks';

function buildHeavyList() {
  // Expensive computation — run only on first render.
  return Array.from({ length: 10_000 }, (_, index) => ({
    key: `row-${index}`,
    label: `Row ${index}`,
  }));
}

export function HugeTable() {
  const [rows, { setItems }] = useCollection(() => buildHeavyList());
  // ...
}
```

Inside `options` you can also pass a factory:

```tsx
useCollection({
  primaryKey: 'id',
  initialItems: () => buildHeavyList(),
});
```

---

## Behavior

1. **Stable `methods` references**
   - Each method on the returned `methods` facade has a permanent reference. Safe to use as effect dependencies or pass down as props without `useCallback`.

2. **Reactive snapshot**
   - `state` is an immutable `ReadonlyArray`. Every mutation publishes a new snapshot and re-renders the component.

3. **Lazy initialization**
   - When `initialItems` is passed as a function (either bare or inside `options`), it runs **once** on the first render.

4. **Hidden subscription**
   - The hook manages collection events internally — there's nothing to subscribe to or clean up from the consumer's side.

5. **SSR-safe**
   - The hook doesn't touch browser APIs and is safe for SSR/ISR.

---

## When to use

- Managing a list/collection with frequent insertions, deletions, or updates.
- When you want **stable method references** for passing down without `useCallback` wrapping.
- When **type safety by primary key** and item data structure matters.

---

## When **not** to use

- If state changes are rare and a simple `useState` with an array/object is enough.
- If you need access to the underlying `Collection` event system or other internals — instantiate `Collection` directly and bridge it to React yourself.
- If your logic goes beyond basic collection operations (history, transactions) — build a dedicated state manager.

---

## Common mistakes

1. **Mutating items in place**
   - Updating item objects directly won't trigger a re-render. Always use `methods.patchItem` / `replaceItem` / `setItems`.

2. **Expecting `initialItems` to auto-refresh**
   - The underlying collection is created once. Changing the `initialItems` variable after mount has no effect — call `methods.reset()` or `methods.setItems(next)`.

3. **Looking for `addEventListener` on `methods`**
   - It's intentionally not exposed. The hook owns the subscription. If you need raw event access, use `@webeach/collection` directly.

4. **Recreating options every render**
   - The collection is initialized once. New options between renders are ignored (this is a feature — keeps the instance stable).

---

## Typing

**Exported types**

- `UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>` — tuple `[state, methods]`.
- `UseCollectionMethods<PrimaryKey, PrimaryKeyType, ItemData>` — the type of the methods facade returned as the second tuple element.
- `UseCollectionOptions<PrimaryKey, PrimaryKeyType, ItemData>` — extended options accepting `initialItems` as array or factory.
- `UseCollectionInitialItemsFactory<PrimaryKey, PrimaryKeyType, ItemData>` — `() => ReadonlyArray<ItemData>`.

**Generic parameters**

- `PrimaryKey extends string = 'key'` — the field name used as the primary key.
- `PrimaryKeyType = CollectionDefaultKeyType` — the type of the primary key value (`string | number | bigint`).
- `ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType>` — the item data shape. Inferred from `initialItems` in most cases.

---

## See also

- [`@webeach/collection`](https://github.com/webeach/collection) — the underlying collection library
- [useMap](useMap.md)
- [useSet](useSet.md)
