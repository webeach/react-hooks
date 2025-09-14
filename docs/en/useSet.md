# `useSet`

## Description

`useSet` is a hook that creates a **reactive** `Set` whose mutations (`add`, `delete`, `clear`, `replaceAll`, etc.) trigger a component re‑render. The set instance is **stable** between renders; you can provide initial values as an array or a lazy factory.

---

## Signature

```ts
function useSet<ValueType = any>(
  initialValues?: ReadonlyArray<ValueType> | (() => ReadonlyArray<ValueType>)
): ExtendedSet<ValueType>;
```

- **Parameters**
   - `initialValues?` — initial values. A lazy variant is supported: a function returning the array.

- **Returns**
   - A reactive structure compatible with `Set`, where mutations trigger a re‑render.

---

## Examples

### 1) Basic usage: add/delete with re‑render

```tsx
import { useSet } from '@webeach/react-hooks/useSet';

export function Tags() {
  const tags = useSet<string>(['react', 'hooks']);

  return (
    <div>
      <button onClick={() => tags.add('typescript')}>Add TS</button>
      <button onClick={() => tags.delete('react')}>Remove React</button>
      <div>Total: {tags.size}</div>
      <ul>
        {[...tags.values()].map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2) Replace the entire content (`replaceAll`)

```tsx
import { useEffect } from 'react';
import { useSet } from '@webeach/react-hooks/useSet';

type PermissionsProps = {
  fetchAll: () => Promise<string[]>;
}

export function Permissions(props: PermissionsProps) {
  const { fetchAll } = props;
  const permissions = useSet<string>();

  useEffect(() => {
    fetchAll().then((values) => {
      permissions.replaceAll(values);
    });
  }, [fetchAll]);

  return <div>Available: {permissions.size}</div>;
}
```

---

## Behavior

1. **Reactivity on mutations**
   - Calls to `add`, `delete`, `clear`, `replaceAll` trigger a component re‑render.

2. **Stable instance**
   - The returned object preserves reference identity for the lifetime of the component (suitable for props/dependencies).

3. **Lazy initialization**
   - If you pass a factory `() => values`, the initial data is computed once on the first render.

4. **Read operations are side‑effect free**
   - `has`, `values`, `entries` do not cause re‑renders; re‑render happens only after mutations.

5. **Uniqueness of values**
   - `Set` automatically prevents duplicates. Calling `add` with the same value doesn’t increase the size, but still triggers a re‑render.

---

## When to Use

- Collections of unique values: ID sets, active tags, selected items.
- When you need a **stable Set object** that components can mutate directly.
- UI scenarios where `Set` is convenient (uniqueness, fast lookup via `.has`).

---

## When **Not** to Use

- If your data is key/value pairs — prefer `useMap`.
- When you need insertion order **with duplicates** — use arrays instead.
- If updates are rare — plain `useState` with an array may be enough.

---

## Common Mistakes

1. **Expecting duplicates**
   - `Set` stores only unique values. Adding the same value again won’t change the size, but it will still cause a re‑render.

2. **Re‑initializing the set**
   - Don’t create a new instance manually inside render. Use the object returned by `useSet` — it is stable.

3. **Wrong effect dependencies**
   - The set reference itself is stable; adding it to an effect deps array will **not** retrigger the effect on content changes. To react to updates, derive values (e.g., `set.size`) and use them in deps, or handle changes in event handlers.

---

## Typing

**Exported types**

- `ExtendedSet<ValueType>`
   - Compatible with `Set`, additionally provides `replaceAll(values)` for atomic content rebuild.
   - Mutations (`add`/`delete`/`clear`/`replaceAll`) trigger a component re‑render.

---

## See also

- [useCollection](useCollection.md)
- [useMap](useMap.md)
