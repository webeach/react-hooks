# `useDemandStructure`

## Description

`useDemandStructure` is a **system-level hook** for **lazy evaluation** of values and **tracking property access**. It builds an object/tuple where each field is a *getter* that calls its `accessor` **every time it’s read**. Additionally, the returned structure contains a special symbol `$DemandStructureUsingSymbol` that stores a map of which fields have been accessed.

This hook is primarily intended for building **other hooks** (an infrastructural utility), for example:
- Creating hybrid return values (both tuple and object with aliases).
- Enabling reactivity **only if** a specific field has actually been read.

---

## Signature

```ts
// A) Array of accessors (tuple without names)
function useDemandStructure<
  const AccessorArray extends readonly UseDemandStructureAccessor<any>[]
>(
  accessors: readonly [...AccessorArray],
): UseDemandStructureReturnBase<{
  [Key in keyof AccessorArray]: AccessorArray[Key] extends UseDemandStructureAccessor<infer R> ? R : never;
}>;

// B) Array with aliases (hybrid: indexes + names)
function useDemandStructure<
  const AccessorArray extends ReadonlyArray<UseDemandStructureAccessorWithAlias<any>>
>(
  accessors: AccessorArray,
): UseDemandStructureReturnBase<
  { [I in keyof AccessorArray]: AccessorArray[I] extends UseDemandStructureAccessorWithAlias<infer V> ? V : never } &
  { readonly [Item in AccessorArray[number] as Item['alias']]: Item extends UseDemandStructureAccessorWithAlias<infer V> ? V : never }
>;

// C) Object of accessors (only named properties)
function useDemandStructure<
  const AccessorObject extends { readonly [key: string]: UseDemandStructureAccessor }
>(
  accessors: AccessorObject,
): UseDemandStructureReturnBase<{ [K in keyof AccessorObject]: ReturnType<AccessorObject[K]> }>;
```

- **Parameters**
   - `accessors` — a set of functions (or `{ alias, accessor }` objects) that compute values **on demand**.

- **Returns**: `UseDemandStructureReturnBase<…>` — a lazily computed structure:
   - numeric indices and/or named properties (depending on form);
   - a special symbol `$DemandStructureUsingSymbol` with a map of accessed keys.

---

## Examples

### 1) Hybrid: indexes + aliases

```tsx
import { useDemandStructure } from '@webeach/react-hooks/useDemandStructure';

type DemoHybridProps = {
  count: number;
};

export function DemoHybrid(props: DemoHybridProps) {
  const { count } = props;

  const result = useDemandStructure([
    {
      alias: 'value',
      accessor: () => count,
    },
    {
      alias: 'double',
      accessor: () => count * 2,
    },
  ]);

  // Access by index
  const first = result[0]; // == count

  // Access by alias
  const x2 = result.double; // == count * 2

  return <div>{first} → {x2}</div>;
}
```

### 2) Object form with lazy evaluation

```tsx
const metrics = useDemandStructure({
  now: () => Date.now(),
  heavy: () => expensiveCompute(), // executed only when metrics.heavy is read
});

console.log(metrics.now);
// ...expensiveCompute is NOT called until metrics.heavy is accessed
```

### 3) Usage tracking for conditional reactivity

```tsx
import { $DemandStructureUsingSymbol } from '@webeach/react-hooks/useDemandStructure';

function useVisibilityWithOptIn(forceUpdate: () => void) {
  const state = useDemandStructure([
    {
      alias: 'isVisible',
      accessor: () => document.visibilityState === 'visible',
    },
  ]);

  // Somewhere in an event handler:
  const used = state[$DemandStructureUsingSymbol].isVisible;
  if (used) {
    forceUpdate(); // trigger re-render only if the field was actually accessed
  }

  return state;
}
```

---

## Behavior

1. **Lazy evaluation**
   - Each accessor is called **only when the corresponding property is read**.

2. **Usage tracking**
   - `[$DemandStructureUsingSymbol]` stores `true` for keys (indexes/aliases/names) that have been accessed.

3. **Hybrid structures**
   - An array with aliases provides access **both by index and by alias**. Also includes `length` and `Symbol.iterator` for array-like behavior.

4. **Stable reference**
   - The returned structure is stable across renders; current accessors are always taken through a live `ref`.

5. **No value caching**
   - Accessor results are **not memoized**. If computation is expensive and accessed often, wrap it in `useMemo` inside the accessor.

6. **SSR safe**
   - The hook itself doesn’t touch browser APIs. Use DOM APIs only inside accessors that run in effects/layout effects.

---

## When to use

- Building **hybrid hook APIs** (tuple + object with aliases) without duplication.
- Fine-grained optimization: trigger re-renders **only if a specific field is accessed**.
- As an **infrastructure utility** for other hooks.

## When **not** to use

- In typical components where simple `useMemo` or `useState` is sufficient.
- For values that are **always read** — lazy evaluation brings no benefit.
- When transparency is more important than micro-optimizations (can make debugging harder).

---

## Common mistakes

1. **Passing a value instead of a function**
   - Each accessor must be a function `() => value`, not a raw value.

2. **Expecting caching**
   - Values are recomputed on **every read**. Wrap expensive logic in `useMemo` if needed.

3. **Alias conflicts**
   - Ensure aliases are unique and do not overlap with numeric indexes.

---

## Typing

- **Exported types**
   - `UseDemandStructureReturnBase<ObjectType>` — base return type with the usage-tracking symbol.
   - `UseDemandStructureAccessor<ValueType>` — accessor signature `(isInitial: boolean) => ValueType`.
   - `UseDemandStructureAccessorWithAlias<ValueType>` — object with `alias` and `accessor` fields.

---

## See also

- [useRefState](useRefState.md)
