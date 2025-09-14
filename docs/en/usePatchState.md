# `usePatchState`

## Description

`usePatchState` is a hook for managing **object state** with **partial updates** (patches), similar in spirit to class components’ `this.setState`. It accepts a partial object or an updater function and performs a **shallow merge** with the current state.

---

## Signature

```ts
function usePatchState<ObjectType extends PlainObject>(
  initialState: ObjectType | (() => ObjectType),
): readonly [state: ObjectType, patch: UsePatchStateFunction<ObjectType>];
```

- **Parameters**
   - `initialState` — the complete initial state object or a lazy initializer function.

- **Returns**
   - Tuple `[state, patch]`:
      - `state: ObjectType` — current state;
      - `patch(partial | updater): void` — applies a partial update (see below).

---

## Examples

### 1) Form: update individual fields

```tsx
import { usePatchState } from '@webeach/react-hooks/usePatchState';

type Form = {
  name: string;
  age: number;
};

export function ProfileForm() {
  const [form, patchForm] = usePatchState<Form>({ name: '', age: 0 });

  return (
    <form>
      <input
        value={form.name}
        onChange={(event) => patchForm({ name: event.target.value })}
      />
      <input
        type="number"
        value={form.age}
        onChange={(event) => patchForm({ age: Number(event.target.value) })}
      />
      <pre>{JSON.stringify(form, null, 2)}</pre>
    </form>
  );
}
```

### 2) Functional update based on previous state

```tsx
import { usePatchState } from '@webeach/react-hooks/usePatchState';

type CounterState = { count: number; step: number };

export function Counter() {
  const [state, patch] = usePatchState<CounterState>({ count: 0, step: 1 });

  const increment = () => patch((prev) => ({ count: prev.count + prev.step }));
  const decrement = () => patch((prev) => ({ count: prev.count - prev.step }));
  const setStep = (step: number) => patch({ step });

  return (
    <div>
      <output>{state.count}</output>
      <button onClick={increment}>+{state.step}</button>
      <button onClick={decrement}>-{state.step}</button>
      <button onClick={() => setStep(5)}>step = 5</button>
    </div>
  );
}
```

### 3) Updating nested structures (shallow merge)

```tsx
import { usePatchState } from '@webeach/react-hooks/usePatchState';

type Settings = {
  theme: {
    mode: 'light' | 'dark';
    accent: string;
  };
  tags: string[];
};

export function SettingsPanel() {
  const [settings, patch] = usePatchState<Settings>(() => ({
    theme: {
      mode: 'light',
      accent: '#09f',
    },
    tags: [],
  }));

  // Important: the patch is shallow. For nested fields create a new nested object
  // (or use `usePatchDeepState` for deep merge semantics).
  const setDark = () => patch((prev) => ({ theme: { ...prev.theme, mode: 'dark' } }));
  const addTag = (t: string) => patch((prev) => ({ tags: [...prev.tags, t] }));

  return (
    <div>
      <button onClick={setDark}>Dark mode</button>
      <button onClick={() => addTag('react')}>+react</button>
      <pre>{JSON.stringify(settings, null, 2)}</pre>
    </div>
  );
}
```

---

## Behavior

1. **Shallow merge**
   - The patch is combined with the state using a spread operation: new key–value pairs **overwrite** top‑level fields. Nested objects/arrays are **not** deeply merged — recreate them in the updater when needed.

2. **Two patch forms**
   - You can pass a **partial object** (`{ field: value }`) or a **functional updater** `(prev) => ({ field: next })`. The function receives the current state and must return a **partial object**.

3. **`patch` stability**
   - The `patch` function is memoized and **stable** between renders; safe to use in effect/callback dependency arrays.

4. **Lazy initialization**
   - If `initialState` is a function, it is called **once** on the first render.

5. **Immutability**
   - Do not mutate `prev` inside the updater. Return a new partial object and, when necessary, new nested structures.

6. **Arrays**
   - Because merging is shallow, array fields are **replaced** entirely. For insertion/removal create a new array: `({ list: [...prev.list, x] })`.

---

## When to Use

- Forms, filters, settings — when it’s convenient to keep multiple fields in one object and patch them as the user types.
- State where **individual** fields change often without rebuilding the entire object.
- View‑model style state where you need quick patches to independent parts.

---

## When **Not** to Use

- If the state isn’t an object (numbers, strings) — plain `useState` is simpler.
- If you need complex transactional updates/invariants — consider `useReducer`.
- If you require **deep** merging across a tree — use `usePatchDeepState` instead.

---

## Common Mistakes

1. **Expecting a deep merge**
   - The patch is **shallow**. For nested updates return a new nested object/array.

2. **Mutating the previous state**
   - Don’t change `prev` in place inside the updater — always create new structures.

3. **Passing an event object as a patch**
   - Avoid `onChange={patch}` — the DOM event object would be used as a patch. Wrap the handler: `onChange={(event) => patch({ field: event.target.value })}`.

4. **Returning a non‑object from the updater**
   - The updater must return a **partial object**. Returning `undefined` or a primitive breaks the merge logic.

5. **Accidentally overwriting an entire object field**
   - `patch({ theme: { mode: 'dark' } })` replaces the whole `theme`. If you need to change just one field, combine with the previous value: `patch((prev) => ({ theme: { ...prev.theme, mode: 'dark' } }))` — or use `usePatchDeepState`.

---

## Typing

**Exported types**

- `UsePatchStateFunction<ObjectType extends PlainObject = PlainObject>`
   - Function for partially updating an object state.
   - Accepts:
      - Partial object: `Partial<ObjectType>`.
      - Or functional updater: `(currentState: ObjectType) => Partial<ObjectType>`.
   - The update is applied via **shallow** merge.
   - Returns `void`.

---

## See also

- [useDebounceState](useDebounceState.md)
- [usePatchDeepState](usePatchDeepState.md)
- [useThrottleState](useThrottleState.md)
