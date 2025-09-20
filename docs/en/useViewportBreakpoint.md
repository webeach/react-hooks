# `useViewportBreakpoint`

## Description

`useViewportBreakpoint` — a React hook for tracking responsive breakpoints using `window.matchMedia`.

- Converts a breakpoint map into a sorted list and creates a `MediaQueryList` for each one (with caching).
- Automatically updates the active breakpoint when the viewport width changes.
- Returns `matches` — an object with all breakpoints and their state (true/false), and `activeBreakpoint` — the currently active breakpoint.
- Supports `defaultBreakpoint` as a fallback, especially useful in SSR to provide a predictable value before hydration.
- The returned structure is hybrid: available both as a tuple `[matches, activeBreakpoint]` and as an object `{ matches, activeBreakpoint }`.

---

## Signature

```ts
function useViewportBreakpoint<BreakpointKey extends string | symbol>(
  breakpointMap: Record<BreakpointKey, number>,
  options?: UseViewportBreakpointOptions<BreakpointKey>,
): UseViewportBreakpointReturn<BreakpointKey>;
```

- **Parameters**
   - `breakpointMap: Record<BreakpointKey, number>` — map of breakpoint keys to their minimum width in pixels.
   - `options?: UseViewportBreakpointOptions` — optional settings:
      - `defaultBreakpoint?: BreakpointKey` — fallback key when no breakpoint matches.

- **Returns**: `UseViewportBreakpointReturn` — a hybrid structure with both tuple and object forms:
   - `matches: Record<BreakpointKey, boolean>` — map of all breakpoints and whether they currently match.
   - `activeBreakpoint: BreakpointKey | null` — the currently active breakpoint key, or `null` if none matches.
   - Tuple access: `[matches, activeBreakpoint]`.

---

## Examples

### 1) Basic usage (tuple)

```tsx
import { useViewportBreakpoint } from '@webeach/react-hooks/useViewportBreakpoint';

export function ResponsiveLayout() {
  const [matches, active] = useViewportBreakpoint({
    mobile: 0,
    tablet: 768,
    desktop: 1200,
  });

  return (
    <div>
      <p>Active breakpoint: {String(active)}</p>
      {matches.mobile && <MobileMenu />}
      {matches.desktop && <DesktopNav />}
    </div>
  );
}
```

### 2) Named access (object)

```tsx
import { useViewportBreakpoint } from '@webeach/react-hooks/useViewportBreakpoint';

export function Sidebar() {
  const { matches, activeBreakpoint } = useViewportBreakpoint({
    narrow: 0,
    wide: 1000,
  });

  return (
    <aside>
      <h2>Breakpoint: {String(activeBreakpoint)}</h2>
      {matches.narrow && <CollapsedSidebar />}
      {matches.wide && <ExpandedSidebar />}
    </aside>
  );
}
```

### 3) With defaultBreakpoint

```tsx
const { matches, activeBreakpoint } = useViewportBreakpoint(
  { sm: 0, md: 600, lg: 1200 },
  { defaultBreakpoint: 'sm' },
);

// If no media query matches, 'sm' will be returned as active (relevant in SSR).
```

---

## Behavior

1. **Sorted breakpoints**
   - Breakpoints are sorted by their numeric width values (from smallest to largest).
2. **Single active breakpoint**
   - Only one breakpoint can be active (`activeBreakpoint`) at any given time.
3. **SSR safety**
   - On the server, empty values are returned, and the hook activates properly in the browser.
4. **Media query caching**
   - Each `min-width` media query is cached to avoid creating duplicate `MediaQueryList` instances.
5. **Stable return structure**
   - The returned object/tuple is stable thanks to `useDemandStructure`.
6. **Fallback breakpoint**
   - If no media query matches and a `defaultBreakpoint` is provided, it is used as the active breakpoint.
   - Especially useful in SSR to have a predictable value before hydration in the browser.

---

## When to use

- Responsive layouts where you need to know the active breakpoint in React.
- Conditional rendering of UI elements depending on viewport width.
- Managing adaptive components (menus, sidebars, navigation, grids).

---

## When **not** to use

- If you only need CSS-based breakpoints without JS awareness — prefer pure CSS.
- For extremely performance-sensitive contexts with dozens of listeners — consider optimizing.

---

## Common mistakes

1. **Expecting multiple breakpoints to be active**
   - Only one breakpoint can be `true` at a time.
2. **Forgetting to provide a default breakpoint**
   - Without it, `activeBreakpoint` can be `null` when none matches.
3. **Overlapping or unsorted values**
   - Always provide consistent ascending values for breakpoints.

---

## Typing

**Exported types**

- `UseViewportBreakpointMatches<BreakpointKey>`
   - Record of breakpoints and their boolean state.

- `UseViewportBreakpointOptions<BreakpointKey>`
   - Options object with `defaultBreakpoint`.

- `UseViewportBreakpointReturn<BreakpointKey>`
   - Hybrid: tuple `[matches, activeBreakpoint]` **and** object `{ matches, activeBreakpoint }`.

---

## See also

- [useResizeObserver](useResizeObserver.md)
- [useMediaQuery](useMediaQuery.md)
