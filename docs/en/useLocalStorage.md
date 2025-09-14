# `useLocalStorage`

## Description

`useLocalStorage` is a hook that binds React state to `localStorage` under a given key.

- Initializes the value from storage (if there is a **valid string**), otherwise from `initialValue`.
- Returns a tuple `[value, setValue]`.
- `setValue` accepts either a direct value or a functional updater `(prev) => next`.
- Supports customizable `serializer`/`deserializer`, as well as cross‑tab synchronization via `watch`.

---

## Signature

```ts
function useLocalStorage<ValueType = undefined>(
  key: string,
  initialValue?: undefined,
  options?: UseLocalStorageOptions<ValueType>,
): UseLocalStorageReturn<ValueType | undefined>;

function useLocalStorage<ValueType>(
  key: string,
  initialValue: ValueType | (() => ValueType),
  options?: UseLocalStorageOptions<ValueType>,
): UseLocalStorageReturn<ValueType>;
```

- **Parameters**
   - `key` — the key in `localStorage`.
   - `initialValue?` — initial value or factory. Used if storage does not contain a valid string.
   - `options?` — serialization and behavior settings:
    - `serializer?: (key, value) => string` — converts a value to a string before writing.
    - `deserializer?: (key, raw) => Value | undefined` — parses a string from storage. Return `undefined` to treat as “no value”.
    - `watch?: boolean` — whether to update state when this key changes in other tabs.

- **Returns**: `UseLocalStorageReturn<Value>` — tuple `[value, setValue]`.

---

## Examples

### 1) Basic preference persistence
```tsx
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(
  'ui:theme',
  'light',
);

// later, on toggle
setTheme('dark');
```

### 2) Counter with a functional updater
```tsx
const [count, setCount] = useLocalStorage<number>('app:count', 0);

const inc = () => setCount((prev) => (prev ?? 0) + 1);
const reset = () => setCount(0);
```

### 3) Deleting a value (resetting the key)
```tsx
const [token, setToken] = useLocalStorage<string | undefined>('auth:token');

// remove the stored value and set state to undefined
setToken(undefined);
```

### 4) Custom serializers
```tsx
type Profile = { id: number; name: string };

const serializer = (_key: string, value: Profile) => JSON.stringify({ root: value });
const deserializer = (_key: string, rawValue: string): Profile | undefined => {
  const parsed = JSON.parse(rawValue);
  return parsed?.root;
};

const [profile, setProfile] = useLocalStorage<Profile>(
  'user:profile',
  { id: 1, name: 'Ada' },
  { serializer, deserializer },
);
```

### 5) Cross‑tab synchronization
```tsx
const [filter, setFilter] = useLocalStorage<string>('list:filter', '', {
  watch: true,
});
```

---

## Behavior

1. **Initialization**
   - On mount, reads the `raw` string from `localStorage[key]` and applies `deserializer`.
   - If `deserializer` returns `undefined`, `initialValue` is used.

2. **Update**
   - `setValue(next)` writes a new string (via `serializer`) or removes the key if `next === undefined`.
   - A functional updater receives the current value `prev` and must return the next one.

3. **Key change**
   - When `key` changes, the hook re‑reads the value for the new key, applying `deserializer` again.

4. **Cross‑tab synchronization** (if `watch: true`)
   - Updates state on the `storage` event when both `key` and `storageArea` match.

---

## When to Use

- User preferences (theme, language, filters, layouts).
- Small caches and flags (last opened tab, “has the user seen the banner”).
- Form persistence and drafts across reloads.

## When **Not** to Use

- Large volumes or complex structures (prefer `IndexedDB`).
- Sensitive data without encryption.
- State that shouldn’t survive a reload.

---

## Common Mistakes

1. **Inconsistent storage format**
   - Changing serialization/deserialization logic may break old values — plan migrations.

2. **Expecting `initialValue` after `setValue(undefined)`**
   - In the current mount, `value` becomes `undefined`. `initialValue` is applied **only** on the first mount.

3. **Forgetting `watch` for a shared key**
   - If a key is edited from another tab, enable `watch: true` to get automatic updates.

---

## Types

**Exported types**

- `UseLocalStorageReturn<Value>` — `[value: Value, setValue: (action) => void]`.
- `UseLocalStorageOptions<Value>` — options for `serializer`/`deserializer` and `watch`.
- `UseLocalStorageSetAction<Value>` — `Value | ((prev: Value) => Value)`.

---

## See also

- [useSessionStorage](useSessionStorage.md)
