# `useMediaQuery`

## Description

`useMediaQuery` — a React hook for subscribing to **CSS media queries**. It returns a boolean value indicating whether the current window matches the given conditions.

Supports multiple call forms: single rule, multiple rules, with or without an explicit media type (`all`, `screen`, `print`).

---

## Signature

```ts
// Overload 1: single rule with default type "all"
function useMediaQuery(rule: UseMediaQueryRule): UseMediaQueryReturn;

// Overload 2: multiple rules (OR) with default type "all"
function useMediaQuery(rules: ReadonlyArray<UseMediaQueryRule>): UseMediaQueryReturn;

// Overload 3: explicit type + single rule
function useMediaQuery(type: UseMediaQueryType, rule: UseMediaQueryRule): UseMediaQueryReturn;

// Overload 4: explicit type + multiple rules (OR)
function useMediaQuery(type: UseMediaQueryType, rules: ReadonlyArray<UseMediaQueryRule>): UseMediaQueryReturn;
```

- **Parameters**
   - `type?: UseMediaQueryType` — media query type (`all`, `screen`, `print`). Default is `all`.
   - `rule | rules` — condition object(s) of type `UseMediaQueryRule` (e.g., `minWidth`, `orientation`, `prefersColorScheme`).

- **Returns**: `UseMediaQueryReturn` — a tuple `[isMatch: boolean]` where `isMatch` reflects the current state.

---

## Examples

### 1) Single media query

```tsx
import { useMediaQuery } from '@webeach/react-hooks/useMediaQuery';

export function Layout() {
  const [isLargeScreen] = useMediaQuery({ minWidth: 1024 });

  return <div>{isLargeScreen ? 'Desktop' : 'Mobile'}</div>;
}
```

### 2) Multiple rules (OR)

```tsx
import { useMediaQuery } from '@webeach/react-hooks/useMediaQuery';

export function Responsive() {
  const [isMobileOrLandscape] = useMediaQuery([
    { maxWidth: 600 },
    { orientation: 'landscape' },
  ]);

  return <div>{isMobileOrLandscape ? 'Compact view' : 'Full view'}</div>;
}
```

### 3) Explicit type

```tsx
import { useMediaQuery } from '@webeach/react-hooks/useMediaQuery';

export function PrintLayout() {
  const [isPrintReady] = useMediaQuery('print', { orientation: 'portrait' });

  return <div>{isPrintReady ? 'Portrait print layout' : 'Other'}</div>;
}
```

### 4) Multiple conditions in a single rule (AND)

```tsx
import { useMediaQuery } from '@webeach/react-hooks/useMediaQuery';

export function DesktopLandscape() {
  const [isDesktopLandscape] = useMediaQuery({
    minWidth: 1024,
    orientation: 'landscape',
  });

  return <div>{isDesktopLandscape ? 'Wide desktop' : 'Other'}</div>;
}
```

---

## Behavior

1. **Combining rules**
   - If you pass an array of rules, they are joined with commas (`query1, query2`), which corresponds to OR logic.
   - If you pass a single rule with multiple properties, they are joined with `and` (AND logic).

2. **SSR compatibility**
   - On the server it always returns `[false]`, without attempting to access `window`.

---

## When to use

- For adaptive components (mobile/desktop layout).
- For enabling/disabling UI features based on user preferences (`prefers-reduced-motion`, `prefers-color-scheme`).
- For conditional rendering in print context (`print`).

---

## When **not** to use

- If you need complex resize logic or element size calculations — better use `useResizeObserver`.
- If you only need to check the width once — simpler to use `window.innerWidth`.

---

## Common mistakes

1. **Expecting AND logic with arrays**
   - Passing an array works as OR, not AND. For AND combinations, put conditions into a single object.

2. **Incorrect usage in SSR**
   - On the server the result is always `false`. Do not rely on it without a fallback.

3. **Ignoring units**
   - `minWidth` and `maxWidth` are always in `px`, `minResolution`/`maxResolution` — in `dppx`.

---

## Typing

**Exported types**

- `UseMediaQueryReturn`
  - Tuple `[isMatch: boolean]`.

- `UseMediaQueryRule`
  - Object of conditions: `minWidth`, `maxWidth`, `orientation`, `prefersColorScheme`, etc.

- `UseMediaQueryType`
  - Media query type: `'all' | 'screen' | 'print'`.

---

## See also

- [useResizeObserver](useResizeObserver.md)
- [useViewportBreakpoint](useViewportBreakpoint.md)
