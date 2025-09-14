# `usePatchDeepState`

## Description

`usePatchDeepState` is a hook for managing **object state** with **deep partial updates** (deep‑merge) across plain objects. It accepts either a partial object or an updater function and merges the patch **recursively**: plain objects are merged, while arrays/functions/class instances and other non‑plain values are **replaced as a whole**.

> Note: for simpler, one‑level cases, `usePatchState` (shallow merge) is often enough.

---

## Signature

```ts
function usePatchDeepState<ObjectType extends PlainObject>(
  initialState: ObjectType | (() => ObjectType),
): readonly [state: ObjectType, patch: UsePatchDeepStateFunction<ObjectType>];
```

- **Parameters**
   - `initialState` — initial state object or a lazy initializer function.

- **Returns**
   - Tuple `[state, patch]`:
      - `state: ObjectType` — current state;
      - `patch(partial | updater): void` — deep patch of the state (see Behavior).

---

## Examples

### 1) Deep patch of nested fields

```tsx
import { usePatchDeepState } from '@webeach/react-hooks/usePatchDeepState';

type State = {
  user: { name: string; meta: { age: number; city?: string } };
  ui: { theme: { mode: 'light' | 'dark'; accent: string } };
};

export function Profile() {
  const [state, patch] = usePatchDeepState<State>(() => ({
    user: {
      name: 'Alice',
      meta: {
        age: 25,
      }
    },
    ui: {
      theme: {
        mode: 'light',
        accent: '#09f',
      },
    },
  }));

  // Update only age and theme color — other fields are preserved
  const apply = () => {
    patch({
      user: {
        meta: {
          age: 30,
        },
      },
      ui: {
        theme: {
          accent: '#f90',
        },
      },
    });
  };

  return (
    <div>
      <button onClick={apply}>Apply</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
```

### 2) Functional updater (depends on previous state)

```tsx
import { usePatchDeepState } from '@webeach/react-hooks/usePatchDeepState';

type Basket = { items: Array<{ id: string; qty: number }>; meta: { total: number } };

export function Cart() {
  const [state, patch] = usePatchDeepState<Basket>(() => ({
    items: [],
    meta: {
      total: 0,
    },
  }));

  const add = (id: string) => {
    patch((prev) => ({
      items: [...prev.items, { id, qty: 1 }], // arrays are replaced with a new reference
      meta: {
        total: prev.meta.total + 1,
      },
    }));
  };

  const increment = (id: string) => {
    patch((prev) => ({
      items: prev.items.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)),
      meta: {
        total: prev.meta.total + 1,
      },
    }));
  };

  return (
    <div>
      <button onClick={() => add('p1')}>Add p1</button>
      <button onClick={() => increment('p1')}>Increment p1</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
```

### 3) Settings: partial sync with a server

```tsx
import { usePatchDeepState } from '@webeach/react-hooks/usePatchDeepState';

type Settings = {
  flags: { beta: boolean; analytics: boolean };
  profile: { name: string; contacts: { email?: string; phone?: string } };
};

type SettingsSyncProps = {
  fetchPatch: () => Promise<Partial<Settings>>;
};

export function SettingsSync(props: SettingsSyncProps) {
  const { fetchPatch } = props;
  
  const [settings, patch] = usePatchDeepState<Settings>({
    flags: { beta: false, analytics: true },
    profile: { name: 'Anon', contacts: {} },
  });

  const sync = async () => {
    const remote = await fetchPatch(); // partial object from the server
    patch(remote); // deep merge
  };

  return (
    <div>
      <button onClick={sync}>Sync</button>
      <pre>{JSON.stringify(settings, null, 2)}</pre>
    </div>
  );
}
```

---

## Behavior

1. **Deep merge only for plain objects**
   - Plain objects (created via `{}`/`Object.create(null)` etc.) are merged **recursively**.
   - **Non‑plain** values — arrays, functions, class instances, `Date`, `Map`, `Set`, etc. — are **replaced entirely**.

2. **Two patch forms**
   - **Partial object**: `patch({ a: { b: 1 } })`.
   - **Functional updater**: `patch((prev) => ({ a: { b: prev.a.b + 1 } }))` — convenient when the new value depends on the previous state.

3. **No mutation of inputs**
   - Neither the previous state nor the patch object is **mutated** — new objects are created where needed.

4. **`patch` stability**
   - The patch function is memoized and **stable** between renders; safe to use in effect/callback dependency arrays.

5. **Lazy initialization**
   - If `initialState` is a function, it runs **once** on the first render.

6. **Performance**
   - Deep merge is heavier than a shallow one. Keep patches **narrow** and consider flattening heavily nested structures. For single‑level updates, use `usePatchState`.

---

## When to Use

- Settings/configs where **nested** fields update frequently.
- Merging partial server data into local state.
- Forms with nested groups where updating a whole branch is convenient.

---

## When **Not** to Use

- When a shallow merge is sufficient — choose `usePatchState`.
- If the structure is very deep/large and patches affect many branches — consider data normalization or `useReducer`.
- If the state isn’t an object or is “flat” — plain `useState` is simpler.

---

## Common Mistakes

1. **Expecting array deep‑merge**
   - Arrays are **not** merged element‑wise. Provide a new array reference: `patch((prev) => ({ list: [...prev.list, item] }))`.

2. **Mutating previous state**
   - Don’t change `prev` in place inside the updater. Always return a new fragment with the necessary nested objects/arrays.

3. **Passing an event object as a patch**
   - Don’t do `onChange={patch}` — the event object would be passed as a patch. Wrap it instead: `onChange={(e) => patch({ field: e.target.value })}`.

4. **Returning a non‑object from the updater**
   - The updater must return a **partial object**; `undefined`/primitives are invalid.

5. **Accidental branch overwrite**
   - If a patch value for a key is a **non‑plain** object (e.g., an array or a function), the entire branch is **replaced**. Make sure this is intended.

6. **Overly large patches**
   - The more branches you change at once, the more expensive the merge. Split updates when appropriate.

---

## Typing

**Exported types**

- `UsePatchDeepStateFunction<ObjectType extends PlainObject = PlainObject>`
   - Function for deep‑updating an object state.
   - Accepts:
      - Partial object: `Partial<ObjectType>`.
      - Or functional updater: `(currentState: ObjectType) => Partial<ObjectType>`.
   - Returns `void`.

---

## See Also

- [useDebounceState](useDebounceState.md)
- [usePatchState](usePatchState.md)
- [useThrottleState](useThrottleState.md)
