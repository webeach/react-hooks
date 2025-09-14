# `useDeps`

## Description

`useDeps` is a hook that returns a **stable identifier** (`id`) and increments it whenever a given set of dependencies is considered changed. It supports multiple usage forms (overloads):

1) No arguments — `id` **never changes** (always `0`).
2) With a dependency array — change is detected using **shallow index-based comparison** (`===`).
3) With a comparator function and a value — change is detected by a **custom comparator**.
4) With only a comparator function — change is detected by **custom logic** inside the comparator (e.g., using a closure).

`id` works as a convenient **signal** to restart effects, reset caches, or reinitialize logic when equality rules are more complex than simple reference checks.

---

## Signature

```ts
// 1) No arguments — stable id (always 0)
function useDeps(): [id: number];

// 2) Dependency array — shallow (===) index-based comparison
function useDeps(deps: unknown[]): [id: number];

// 3) Custom comparator + compared value
function useDeps<ValueType>(
  compare: (prev: ValueType, next: ValueType) => boolean, // return true if EQUAL (no change)
  comparedValue: ValueType,
): [id: number];

// 4) Comparator only — all comparison logic inside the function (e.g., closure)
function useDeps(compare: () => boolean): [id: number]; // return true if EQUAL (no change)
```

- **Parameters**
   - `deps?: unknown[]` — dependency array for shallow comparison.
   - `compare?: (prev, next) => boolean` — comparator that returns **`true` if values are equal (no change)**, or **`false` if they differ** (increment `id`).
   - `comparedValue?: unknown` — value passed to the custom comparator.

- **Returns**: `[id: number]` — a tuple containing the current stable identifier.

---

## Examples

### 1) No arguments (static id)

```tsx
const [id] = useDeps();
// id === 0 for all renders
```

### 2) Dependency array (shallow comparison)

```tsx
const [reloadId] = useDeps([page, pageSize, query]);

useEffect(() => {
  // runs only if page/pageSize/query changed in value (===) or array length changed
  fetchData({ page, pageSize, query });
}, [reloadId]);
```

### 3) Custom comparator + value

```tsx
// Re-run only when "meaning" of user changes (id or role differ)
const [userVersion] = useDeps(
  (prev, next) => prev?.id === next?.id && prev?.role === next?.role,
  currentUser,
);

useEffect(() => {
  reinitUserSession(currentUser);
}, [userVersion]);
```

### 4) Comparator only (all logic inside)

```tsx
// Comparison via closure: read something external (e.g., cache hash)
const [stamp] = useDeps(() => cache.getHash() === lastAppliedHash.current);

useEffect(() => {
  lastAppliedHash.current = cache.getHash();
  warmUpCache();
}, [stamp]);
```

---

## Behavior

1. **Basic initialization**
   - On the first render, `id` is `0` and does not increment until a change is detected.

2. **Change detection with `deps` array**
   - Shallow comparison by index (`===`) and array length. If any item differs, `id` increments.

3. **Change detection with comparator**
   - Comparator should return `true` if values are considered **equal** (no change), or `false` if they differ (change detected). On difference, `id` increments.

4. **Comparator without value**
   - The function is called on every render and must decide if a change occurred based on closure state. Return `true` for equality, `false` for difference.

5. **Stable counter**
   - `id` increases monotonically (0, 1, 2, …). It never resets automatically.

6. **Stable return**
   - The hook always returns a tuple with the same shape; only `id` changes.

---

## When to use

- When default `useEffect` dependency comparison (`===`) is not enough.
- As a simple **change signal** for effects, caches, or reinitialization.
- To unify multiple or complex dependencies into a single numeric marker.

## When **not** to use

- If a plain `useEffect` dependency array is sufficient.
- If you always need deep equality — use `useEffectCompare` instead.
- If you need the actual derived value (not just an incrementing id) — use `useMemo` or another state hook.

---

## Common mistakes

1. **Wrong comparator logic**
   - Comparator must return `true` when values are equal. Returning the opposite will cause unnecessary or missing increments.

2. **Recreating dependency arrays every render**
   - If you spread or build a new array each render (`[...obj]`), shallow compare will treat it as changed if references differ.

3. **Expecting `id` to reset**
   - The counter never resets automatically. If you need a reset, manage your own state.

4. **Ignoring closure issues**
   - When using `useDeps(compare)`, make sure your comparator logic reads from stable refs to avoid false positives.

---

## Typing

**Exported types**

- `UseDepsCompareFunction<ValueType = undefined>`
   - If `ValueType` is **not provided** → function: `() => boolean` (comparison logic inside closure).
   - If `ValueType` is **provided** → function: `(prevValue: ValueType, nextValue: ValueType) => boolean` (return `true` if equal).

---

## See also

- [useCallbackCompare](useCallbackCompare.md)
- [useEffectCompare](useEffectCompare.md)
- [useLayoutEffectCompare](useLayoutEffectCompare.md)
- [useMemoCompare](useMemoCompare.md)
