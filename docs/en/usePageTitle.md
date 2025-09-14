# `usePageTitle`

## Description

`usePageTitle` is a hook that sets `document.title` for the lifetime of a component. It supports **nested** usage: it keeps a stack of titles and, on unmount, restores the previous title (or the original one if the stack becomes empty).

---

## Signature

```ts
function usePageTitle(title: string): void;
```

- **Parameters**
   - `title: string` — the page title to set on the current render.

- **Returns**
   - `void` — no return value; the hook manages `document.title` and the title history.

---

## Examples

### 1) Basic usage

```tsx
import { usePageTitle } from '@webeach/react-hooks/usePageTitle';

export function SettingsPage() {
  usePageTitle('Settings — MyApp');

  return <h1>Settings</h1>;
}
```

### 2) Nested components: the most recently mounted takes priority

```tsx
import { usePageTitle } from '@webeach/react-hooks/usePageTitle';

function PageLayout() {
  usePageTitle('Dashboard — MyApp');

  return <Widget />; // a child can override the title
}

function Widget() {
  usePageTitle('Notifications — MyApp');

  return <div />; // while Widget is mounted, the title is "Notifications — MyApp"
}
// After Widget unmounts, the title reverts to "Dashboard — MyApp"
```

### 3) Reactive title updates from props/state

```tsx
import { usePageTitle } from '@webeach/react-hooks/usePageTitle';

type UserProfileProps = {
  name: string;
};

export function UserProfile(props: UserProfileProps) {
  const { name } = props;
  
  usePageTitle(`${name} — Profile`);

  return <h1>{name}</h1>;
}
```

---

## Behavior

1. **LIFO priority**
   - The most recently **mounted** `usePageTitle` has priority and defines the current title. Updates to lower levels **do not appear** until the top instance unmounts.

2. **Title restoration**
   - On unmount, the hook removes its entry from the stack and restores the previous title. When the stack is empty, it restores the **original** `document.title` captured on the hook’s first use.

3. **Update on every render**
   - When the current instance’s `title` changes, the title is updated immediately; the stack entry is updated **without** changing the order (priority still belongs to the most recently mounted instance).

4. **Layout semantics**
   - The title is updated during the **layout phase** (isomorphic layout effect), ensuring it’s applied before paint on the client.

5. **SSR‑safe**
   - There are no side effects on the server; access to `document` happens only after mount. The hook is safe for SSR/ISR.

6. **Global original value**
   - The original `document.title` is saved once on the first hook usage and is used to restore the title after the last entry is removed.

---

## When to Use

- Pages and routes in SPA/MPA where a component is responsible for the tab title.
- Nested widgets/modals that temporarily override the title.
- Dynamic titles based on data (user name, page state, etc.).

---

## When **Not** to Use

- If the title is managed by a router/meta framework (Next/Remix/React‑Helmet) — avoid having multiple sources of truth; prefer a single mechanism.
- If the title should not change per component — static markup is enough.

---

## Common Mistakes

1. **Expecting “last update” priority instead of “last mount”**
   - The stack order is defined by **mounting**, not by the time of the last update. To temporarily raise priority, mount a separate hook instance higher in the tree or unmount the current top one.

2. **Managing the title from multiple places**
   - If both the router and components change the title, you may see tug‑of‑war behavior. Choose a single source of truth.

3. **Attempting to read `document` during SSR**
   - `document` is unavailable on the server. Let the hook handle updates on the client after mount.

---

## See Also

- [usePageVisibility](usePageVisibility.md)
