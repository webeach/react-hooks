# `useCollection`

## Description

`useCollection` is a hook that wraps `@webeach/collection`. It creates a **stable `Collection` instance** and keeps a **reactive snapshot** of its items. Any mutation performed through collection methods (e.g. `appendItem`, `patchItem`, `replaceItem`, `removeItem`, `setItems`, etc.) automatically updates the returned snapshot array and triggers a component re-render.

The hook supports two forms of usage: with **options** or with **initial items**.

---

## Signature

```ts
// 1) Using options (including initialItems)
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> = CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  options?: CollectionOptions<
    CollectionPrimaryKeyWithDefault<PrimaryKey>,
    PrimaryKeyType,
    ItemData
  >,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;

// 2) Using initial items directly
function useCollection<
  PrimaryKey extends string = 'key',
  PrimaryKeyType = CollectionDefaultKeyType,
  ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType> = CollectionBaseItemData<PrimaryKey, PrimaryKeyType>,
>(
  initialItems?: ReadonlyArray<
    CollectionItem<
      CollectionPrimaryKeyWithDefault<PrimaryKey>,
      PrimaryKeyType,
      ItemData
    >
  >,
): UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>;
```

- **Parameters**
   - `options?` — `Collection` options (including `initialItems`, primary key settings, and other `@webeach/collection` options).
   - `initialItems?` — an array of initial items if you don’t need other options.

- **Returns**: `UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>` — a tuple:
   - `state` — `ReadonlyArray<CollectionItem<…>>`, the reactive **snapshot** of the current collection contents.
   - `instance` — `Collection<…>`, the **stable instance** used to perform mutations.

---

## Examples

### 1) Basic usage: todo list

```tsx
import { useCollection, type CollectionItem } from '@webeach/react-hooks/useCollection';

type TaskData = {
  key: string;
  title: string;
  done?: boolean;
};

export function TodoList() {
  const [tasks, tasksCollection] = useCollection<'key', string, TaskData>([
    { key: 't1', title: 'Write docs' },
    { key: 't2', title: 'Review PR', done: true },
  ]);

  const add = () => {
    tasksCollection.appendItem({
      key: crypto.randomUUID(),
      title: 'New task',
    });
  };

  const toggle = (item: CollectionItem<'key', string, TaskData>) => {
    tasksCollection.patchItem(item.key, { done: !item.done });
  };

  const remove = (key: string) => {
    usersCollection.removeItem(key);
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
                checked={Boolean(item.done)}
                onChange={() => toggle(item)}
              />
              {item.title}
            </label>
            <button onClick={() => remove(item.key)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2) Custom primary key `id: number` via options

```tsx
import { useCollection } from '@webeach/react-hooks/useCollection';

type UserData = {
  id: number;
  name: string;
};

export function Users() {
  const [users, usersCollection] = useCollection<'id', number, UserData>({
    primaryKey: 'id',
    initialItems: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  });

  const rename = (id: number, name: string) => {
    usersCollection.patchItem(id, { name });
  };

  const reloadAll = async () => {
    const next = await fetch('/api/users').then((response) => response.json());
    usersCollection.setItems(next); // full replacement of contents
  };

  return (
    <>
      <button onClick={reloadAll}>Reload</button>
      <ul>
        {users.map((userItem) => (
          <li key={userItem.key}>{userItem.name}</li>
        ))}
      </ul>
    </>
  );
}
```

---

## Behavior

1. **Stable instance**
   - The returned `instance` is created once and **never changes** between renders. Safe to use in effect dependencies or pass down to children.

2. **Reactive snapshot**
   - `state` is an immutable snapshot (`ReadonlyArray`). Any mutation through collection methods publishes a new snapshot and triggers a re-render.

3. **Initialization**
   - You can provide initial data either as an array (`initialItems`) or via `options.initialItems`.

4. **Collection methods**
   - Use the instance methods (`appendItem`, `prependItem`, `appendItemAt`, `insertItemBefore/After`, `patchItem`, `replaceItem`, `removeItem`, `clear`, `reset`, `setItems`). They automatically update the snapshot and trigger re-renders.

5. **SSR safe**
   - The hook does not depend on browser APIs. Safe for SSR/ISR environments.

---

## When to use

- Managing a list/collection with frequent insertions, deletions, or updates.
- When you need a **stable object** for passing between components and subscribing to updates.
- When **type safety by primary key** and item data structure is important.

---

## When **not** to use

- If state changes are rare and a simple `useState` with an array/object is enough.
- If your logic goes beyond basic collection operations (history, transactions) — better build a dedicated state manager.

---

## Common mistakes

1. **Mutating state directly**
   - Updating item objects in place won’t update the snapshot. Always use collection methods (`patchItem`, `replaceItem`, `setItems`, etc.).

2. **Expecting `initialItems` to auto-update**
   - The collection instance is created once. Changing the `initialItems` variable after mount won’t reset it — use `reset` or `setItems`.

3. **Using `state` for mutations**
   - `state` is read-only. Always call `instance` methods to update the collection.

4. **Unstable dependencies**
   - Avoid creating new options objects every render unless you want to reset the collection. Use `useMemo` for stable options.

---

## Typing

**Exported types**

- `UseCollectionReturn<PrimaryKey, PrimaryKeyType, ItemData>`
   - Tuple `[state, instance]`, where:
      - `state` — `ReadonlyArray<CollectionItem<…>>`, reactive snapshot of current items.
      - `instance` — `Collection<…>`, the stable collection instance.

- **Generic parameters**
   - `PrimaryKey extends string = 'key'` — the field name used as the primary key.
   - `PrimaryKeyType = CollectionDefaultKeyType` — the type of the primary key value (usually `string | number`).
   - `ItemData extends CollectionBaseItemData<PrimaryKey, PrimaryKeyType>` — the item data shape.

---

## See also

- [useMap](useMap.md)
- [useSet](useSet.md)
