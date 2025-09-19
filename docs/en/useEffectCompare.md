# `useEffectCompare`

## Description

`useEffectCompare` is a wrapper around `useEffect` that executes the effect **only when the dependencies have "logically" changed**. Instead of React’s default reference comparison, you can provide:

- a dependency array with **shallow index-based comparison** (`===`),
- a **custom comparator function** with a separate value,
- or **just a comparator function** if the comparison logic is fully encapsulated (e.g., using closure state).

---

## Signature

```ts
// 1) Dependency array
function useEffectCompare(
  effect: () => void | (() => void),
  deps: unknown[],
): void;

// 2) Custom comparator + value
function useEffectCompare<ComparedValue>(
  effect: () => void | (() => void),
  compare: (prev: ComparedValue, next: ComparedValue) => boolean,
  comparedValue: ComparedValue,
): void;

// 3) Comparator only
function useEffectCompare(
  effect: () => void | (() => void),
  compare: () => boolean,
): void;
```

- **Parameters**
   - `effect` — the effect function; may return a cleanup function (same as in `useEffect`).
   - `deps` — dependency array; compared **shallowly** by index (`===`).
   - `compare` — a function that returns `true` if values are considered **equal** (no change) and `false` if they **differ** (change detected).
   - `comparedValue` — a value passed into the custom comparator.

- **Returns**
   - `void` — just like `useEffect`.

---

## Examples

### 1) Dependency array with shallow comparison

```tsx
import { useEffectCompare } from '@webeach/react-hooks/useEffectCompare';

function Search({ query, page, pageSize }: { query: string; page: number; pageSize: number }) {
  useEffectCompare(() => {
    // Runs only if query/page/pageSize actually changed in value
    fetchResults({ query, page, pageSize });
  }, [query, page, pageSize]);

  return null;
}
```

### 2) Custom comparator by object semantics

```tsx
import { useEffectCompare } from '@webeach/react-hooks/useEffectCompare';

function Session({ user }: { user: { id: string; role: string } | null }) {
  useEffectCompare(
    () => {
      // Restart session only if id or role has changed
      reinitSession(user);
      return () => disposeSession();
    },
    (prev, next) => prev?.id === next?.id && prev?.role === next?.role,
    user,
  );

  return null;
}
```

### 3) Comparator only (closure-based logic)

```tsx
import { useEffectCompare } from '@webeach/react-hooks/useEffectCompare';

function CacheWarmup() {
  useEffectCompare(
    () => {
      warmUpCache();
    },
    () => cache.getHash() === lastAppliedHash.current,
  );

  return null;
}
```

---

## Behavior

1. **Effect trigger**
   - The effect is executed only if a **change is detected** by the chosen comparison method.
   - For arrays → shallow comparison by index and length.
   - For custom comparator → executes `effect` only when comparator returns `false`.

2. **Dynamic dependency arrays**
   - The `deps` array can be **dynamic**: length and order may change between renders. Comparison accounts for both length and index-based values. Unlike `useEffect`, you don’t need to keep the array shape stable.

3. **Comparator semantics**
   - Must return `true` when values are **equal** (no change) and `false` when they **differ** (effect should re-run).

4. **Cleanup**
   - The cleanup function returned from `effect` is called before the next run and on unmount (same as `useEffect`).

5. **Flexible forms**
   - Choose between dependency array, comparator + value, or comparator only — depending on your needs.

---

## When to use

- When React’s default dependency comparison (`===`) is insufficient.
- To optimize effects so they run only on **meaningful** changes.
- When working with objects/arrays where you only care about specific fields.

## When **not** to use

- If default `useEffect` with a dependency array works fine.
- If you need deep comparison of large/complex structures on every render (this can be expensive). Consider normalization or memoization instead.

---

## Common mistakes

1. **Reversed comparator return**
   - The comparator must return `true` if values are equal. Returning the opposite leads to missed or excessive re-runs.

2. **Creating new arrays/objects each render**
   - If you pass `[...obj]` or `{ ...obj }` each render, the shallow compare will treat it as changed even if contents are the same.

3. **Unstable comparator closures**
   - When using the comparator-only form, ensure it reads from stable refs. Otherwise, you might trigger unnecessary or skip required runs.

4. **Expecting `useLayoutEffect` behavior**
   - This hook wraps `useEffect`. If you need synchronous before-paint execution, use `useLayoutEffectCompare`.

---

## See also

- [useCallbackCompare](useCallbackCompare.md)
- [useDeps](useDeps.md)
- [useIsomorphicLayoutEffect](useIsomorphicLayoutEffect.md)
- [useLayoutEffectCompare](useLayoutEffectCompare.md)
- [useMemoCompare](useMemoCompare.md)
- [useRefEffect](useRefEffect.md)
- [useUnmount](useUnmount.md)
