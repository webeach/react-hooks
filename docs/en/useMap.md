# `useMap`

## Description

`useMap` is a hook that creates a **reactive** `Map` whose mutations (`set`, `delete`, `clear`, `replaceAll`, etc.) trigger a component re‑render. The map instance is **stable** between renders; you can provide initial entries as an array or a lazy factory.

---

## Signature

```ts
function useMap<KeyType = any, ValueType = any>(
  initialEntries?: ReadonlyArray<[KeyType, ValueType]> | (() => ReadonlyArray<[KeyType, ValueType]>)
): UseMapReturn<KeyType, ValueType>;
```

- **Parameters**
   - `initialEntries?` — initial `[key, value]` pairs. A lazy variant is supported: a function returning the array.

- **Returns**
   - A reactive structure compatible with `Map`, where mutations trigger a re‑render.

---

## Examples

### 1) Basic usage: add/delete with re‑render

```tsx
import { useMap } from '@webeach/react-hooks/useMap';

type User = { id: string; name: string };

export function Users() {
  const users = useMap<string, User>([
    ['u1', { id: 'u1', name: 'Alice' }],
    ['u2', { id: 'u2', name: 'Bob' }],
  ]);

  return (
    <div>
      <button onClick={() => users.set('u3', { id: 'u3', name: 'Charlie' })}>Add Charlie</button>
      <button onClick={() => users.delete('u1')}>Remove Alice</button>
      <div>Total: {users.size}</div>
      <ul>
        {users.entries().map(([id, userItem]) => (
          <li key={id}>{userItem.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2) Replace the entire content (`replaceAll`)

```tsx
import { useEffect } from 'react';
import { useMap } from '@webeach/react-hooks/useMap';

type Product = { id: string; title: string };

type CatalogProps = {
  fetchAll: () => Promise<Array<[string, Product]>>;
};

export function Catalog(props: CatalogProps) {
  const { fetchAll } = props;
  const products = useMap<string, Product>();

  useEffect(() => {
    fetchAll().then((entries) => {
      products.replaceAll(entries);
    });
  }, [fetchAll]);

  return <Grid data={products.values()} />;
}
```

### 3) Updating nested values

```tsx
import { type UseMapReturn } from '@webeach/react-hooks/useMap';

type RenameProps = {
  users: UseMapReturn<string, { name: string }>;
};

// Important: mutating an object by reference will NOT re-render.
// You must reassign the key via `set`.
function Rename(props: RenameProps) {
  const { users } = props;
  
  const rename = (id: string, name: string) => {
    const current = users.get(id);

    if (!current) {
      return;
    }

    users.set(id, { ...current, name }); // triggers update
  };
  return <button onClick={() => rename('u2', 'Bobby')}>Rename Bob → Bobby</button>;
}
```

---

## Behavior

1. **Reactivity on mutations**
   - Calls to `set`, `delete`, `clear`, `replaceAll` trigger a component re‑render.

2. **Stable instance**
   - The returned object preserves reference identity for the lifetime of the component (suitable for props/dependencies).

3. **Lazy initialization**
   - If you pass a factory `() => entries`, the initial data is computed once on the first render.

4. **Read operations are side‑effect free**
   - `get`, `has`, `values`, `entries` do not cause re‑renders; re‑render happens only after mutations.

5. **Nested structures**
   - Mutating inner fields by reference (e.g., `users.get('u1')!.name = '…'`) isn’t detected. Reassign the key via `set` to update the UI.

---

## When to Use

- Collections with frequent imperative changes: data caches, key‑based indexes, selected‑items stores.
- When you need a **stable Map object** that components can mutate directly while keeping a simple API.
- UI scenarios where `Map` is convenient (fast insert/delete/lookup by key) and you still require reactivity.

---

## When **Not** to Use

- If plain state (`useState`/`useReducer`) with immutable updates is sufficient.
- When you need transactions/time‑travel/history — add a layer on top (change history) rather than offloading that onto the map.
- If data changes are rare — a simpler structure (array/object) may be clearer.

---

## Common Mistakes

1. **In‑place mutation without `set`**
   - Changing an object fetched from the map “in place” will not re‑render. Create a new object and call `map.set(key, next)`.

2. **Re‑initializing the map**
   - Don’t create a new instance manually inside render. Use the object returned by `useMap` — it is stable.

3. **Wrong effect dependencies**
   - The map reference itself is stable; adding it to an effect deps array will **not** retrigger the effect on content changes. To react to updates, derive values (e.g., `map.size`) and use them in deps, or handle changes in event handlers.

---

## Types

**Exported types**

- `ExtendedMap<KeyType, ValueType>`
   - Compatible with `Map`, additionally provides `replaceAll(entries)` for atomic content rebuild.
   - Mutations (`set`/`delete`/`clear`/`replaceAll`) trigger a component re‑render.

---

## See also

- [useCollection](useCollection.md)
- [useSet](useSet.md)
