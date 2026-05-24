# Quick Start

`@webeach/react-hooks` is a set of smart React hooks for performant UIs. Works with React 18+ and is fully SSR-friendly.

## Installation

::: code-group

```bash [pnpm]
pnpm add @webeach/react-hooks
```

```bash [npm]
npm install @webeach/react-hooks
```

```bash [yarn]
yarn add @webeach/react-hooks
```

:::

## Usage

Import a hook from the root entry:

```tsx
import { useBoolean } from '@webeach/react-hooks';

function Example() {
  const [isOpen, { toggle }] = useBoolean(false);

  return <button onClick={toggle}>{isOpen ? 'Close' : 'Open'}</button>;
}
```

Or import a single hook via its subpath — this loads only that hook's code, which is especially useful for CommonJS consumers:

```tsx
import { useBoolean } from '@webeach/react-hooks';
```

## Requirements

- React **18+**
- Node.js **18+** (for tooling)

## Next steps

Browse the full list of hooks in the [Hooks](/hooks/useBoolean) section.
