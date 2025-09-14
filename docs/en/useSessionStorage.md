# `useSessionStorage`

## Description

`useSessionStorage` is a hook that binds React state to `sessionStorage` under a given key.

- Initializes the value from storage (if there is a **valid string**), otherwise from `initialValue`.
- Returns a tuple `[value, setValue]`.
- `setValue` accepts either a direct value or a functional updater `(prev) => next`.
- Supports customizable `serializer`/`deserializer`.
- Data lives within the **current tab/window** and is cleared when the **browser session ends** (unlike `localStorage`).

---

## Signature

```ts
function useSessionStorage<ValueType = undefined>(
  key: string,
  initialValue?: undefined,
  options?: UseSessionStorageOptions<ValueType>,
): UseSessionStorageReturn<ValueType | undefined>;

function useSessionStorage<ValueType>(
  key: string,
  initialValue: ValueType | (() => ValueType),
  options?: UseSessionStorageOptions<ValueType>,
): UseSessionStorageReturn<ValueType>;
```

- **Parameters**
   - `key` — the key in `sessionStorage`.
   - `initialValue?` — initial value or factory. Used if storage does not contain a valid string.
   - `options?` — serialization settings:
      - `serializer?: (key, value) => string` — converts a value to a string before writing.
      - `deserializer?: (key, raw) => Value | undefined` — parses a string from storage. Return `undefined` to treat as “no value”.

- **Returns**: `UseSessionStorageReturn<Value>` — tuple `[value, setValue]`.

---

## Examples

### 1) Page parameter for the lifetime of a session
```tsx
const [step, setStep] = useSessionStorage<number>('wizard:step', 1);

const next = () => setStep((prev) => (prev ?? 1) + 1);
```

### 2) Deleting a value (resetting the key)
```tsx
const [draft, setDraft] = useSessionStorage<string | undefined>('form:draft');

// remove the stored value and set state to undefined
setDraft(undefined);
```

### 3) Custom serializers
```tsx
type Filter = { q: string; page: number };

const serializer = (_key: string, value: Filter) => JSON.stringify({ root: value });
const deserializer = (_key: string, rawValue: string): Filter | undefined => {
  const parsed = JSON.parse(rawValue);
  return parsed?.root;
};

const [filter, setFilter] = useSessionStorage<Filter>(
  'list:filter',
  { q: '', page: 1 },
  { serializer, deserializer },
);
```

---

## Behavior

1. **Initialization**
   - On mount, reads the `raw` string from `sessionStorage[key]` and applies `deserializer`.
   - If `deserializer` returns `undefined`, `initialValue` is used.

2. **Update**
   - `setValue(next)` writes a new string (via `serializer`) or removes the key if `next === undefined`.
   - A functional updater `(prev) => next` is supported.

3. **Key change**
   - When `key` changes, the hook re‑reads the value for the new key, applying `deserializer` again.

4. **Scope & lifetime**
   - Values in `sessionStorage` are **not shared** across tabs and are cleared when the tab/window closes or the browser session ends.

---

## When to Use

- Wizards, temporary filters, and per‑tab page state.
- Drafts and input that should survive reloads but **not** session termination.
- Ephemeral UI settings for the current window.

## When **Not** to Use

- You need persistence **between** sessions — use `useLocalStorage`.
- Large or complex structures — consider `IndexedDB`.
- Sensitive data without encryption.

---

## Common Mistakes

1. **Expecting cross‑tab sharing**
   - `sessionStorage` is tab‑scoped; it doesn’t sync automatically.

2. **Expecting `initialValue` after `setValue(undefined)`**
   - In the current mount, `value` becomes `undefined`. `initialValue` is applied **only** on the next mount (if the key is absent).

3. **Inconsistent storage format**
   - Changing `serializer`/`deserializer` may break old values — plan migrations.

---

## Typing

**Exported types**

- `UseSessionStorageReturn<Value>` — `[value: Value, setValue: (action) => void]`.
- `UseSessionStorageOptions<Value>` — options for `serializer`/`deserializer`.
- `UseSessionStorageSetAction<Value>` — `Value | ((prev: Value) => Value)`.

---

## See also

- [useLocalStorage](useLocalStorage.md)
