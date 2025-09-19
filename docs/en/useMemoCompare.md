# `useMemoCompare`

## Description

`useMemoCompare` is a wrapper around `useMemo` that recalculates the value **only on a “meaningful” change** of dependencies. It supports three comparison forms:

- a dependencies array with **shallow index‑by‑index comparison** (`===`),
- a **custom comparator function** plus a separate value,
- **comparator‑only**, when the comparison logic is fully encapsulated inside the comparator.

---

## Signature

```ts
// 1) Dependencies array
function useMemoCompare<ValueType>(
  factory: () => ValueType,
  deps: unknown[],
): ValueType;

// 2) Custom comparator + value
function useMemoCompare<ValueType, ComparedValue>(
  factory: () => ValueType,
  compare: (prev: ComparedValue, next: ComparedValue) => boolean,
  comparedValue: ComparedValue,
): ValueType;

// 3) Comparator only
function useMemoCompare<ValueType>(
  factory: () => ValueType,
  compare: () => boolean,
): ValueType;
```

- **Parameters**
   - `factory` — a function that returns the memoized value; it must be pure and have no side effects.
   - `deps` — a dependencies array; compared **shallowly** by index (`===`).
   - `compare` — a comparator function that must return `true` when values are **equal** (no change) and `false` when they **differ** (there is a change).
   - `comparedValue` — the value to be compared by the custom comparator.

- **Returns**
   - The memoized value of type `ValueType`.

---

## Examples

### 1) Dependencies array with shallow comparison

```tsx
import { useMemoCompare } from '@webeach/react-hooks/useMemoCompare';

type Item = { title: string; price: number };

function Products({ items, query, sort }: { items: Item[]; query: string; sort: 'asc' | 'desc' }) {
  const filtered = useMemoCompare(
    () =>
      items
        .filter((p) => p.title.includes(query))
        .sort((a, b) => (sort === 'asc' ? a.price - b.price : b.price - a.price)),
    [items, query, sort],
  );

  return <List data={filtered} />;
}
```

### 2) Custom comparator by the “meaning” of an object

```tsx
import { useMemoCompare } from '@webeach/react-hooks/useMemoCompare';

function UserBadge({ user }: { user: { id: string; name: string; role: string } | null }) {
  const view = useMemoCompare(
    () => buildUserView(user),
    (prev, next) => prev?.id === next?.id, // recompute only if the id changed
    user,
  );
  return <Badge data={view} />;
}
```

### 3) Comparator only (logic inside the function)

```tsx
import { useMemoCompare } from '@webeach/react-hooks/useMemoCompare';

declare const lastAppliedHash: { current: string };

type ThemeConfig = { hash: string };

function ThemeProvider({ config }: { config: ThemeConfig }) {
  const theme = useMemoCompare(
    () => createTheme(config),
    () => config.hash === lastAppliedHash.current,
  );
  return <ThemeContext.Provider value={theme} />;
}
```

---

## Behavior

1. **Recompute trigger**
   - `factory` is called only when a **change is detected** in dependencies. Otherwise, the previous memoized value is returned without recomputation.

2. **Dynamic dependencies array**
   - In the `deps` form, the array can be fully **dynamic**: its length and order may change between renders. The comparison accounts for both values by index and length; a length change is also considered a change. Unlike regular `useMemo`, there is **no requirement** to keep the array length strictly stable across renders.

3. **Factory purity**
   - `factory` must be side‑effect free (no state setters, subscriptions, or I/O). Use effects for side effects.

4. **Result stability**
   - When no change is detected, the **same reference** to the previous value is returned (useful for `React.memo`, `useEffect`, etc.).

---

## When to Use

- Expensive computations/transformations that depend on complex objects.
- Data normalization/indexing, view‑model preparation, cacheable selectors.
- When you want to recompute only on **semantic** changes according to a custom rule.

---

## When **Not** to Use

- If the computation is cheap — extra memoization may overcomplicate the code.
- If you need a **callback**, not a value — use `useCallbackCompare`.
- For side effects — use `useEffectCompare`/`useLayoutEffectCompare`.

---

## Common Mistakes

1. **Inverted comparator logic**
   - The comparator must return `true` for equality and `false` for difference. Otherwise, you’ll get unnecessary/missed recomputations.

2. **Side effects inside `factory`**
   - Do not call `setState`, subscribe, or touch external effects inside `factory`.

3. **Stale closures**
   - If `factory` uses outer values, ensure they are up‑to‑date (via parameters, a `ref`, or correct comparisons), otherwise you’ll get outdated data.

4. **Wrong comparison key**
   - In the comparator form, make sure you use the right criterion of “significance” (e.g., `id` instead of the whole object reference).

---

## See Also

- [useCallbackCompare](useCallbackCompare.md)
- [useEffectCompare](useEffectCompare.md)
- [useMemoCompare](useMemoCompare.md)
- [useLayoutEffectCompare](useLayoutEffectCompare.md)
