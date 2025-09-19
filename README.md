<div align="center">
  <img alt="react-hooks" src="./assets/logo.svg" height="96">
  <br><br><br>
  <p>
    <a href="https://www.npmjs.com/package/@webeach/react-hooks">
       <img src="https://img.shields.io/npm/v/@webeach/react-hooks.svg?color=646fe1&labelColor=9B7AEF" alt="npm package" />
    </a>
    <a href="https://github.com/webeach/react-hooks/actions/workflows/ci.yml">
      <img src="https://img.shields.io/github/actions/workflow/status/webeach/react-hooks/ci.yml?color=646fe1&labelColor=9B7AEF" alt="build" />
    </a>
    <a href="https://www.npmjs.com/package/@webeach/react-hooks">
      <img src="https://img.shields.io/npm/dm/@webeach/react-hooks.svg?color=646fe1&labelColor=9B7AEF" alt="npm downloads" />
    </a>
  </p>
  <p><a href="./README.md">🇺🇸 English version</a> | <a href="./README.ru.md">🇷🇺 Русская версия</a></p>
  <p>A set of smart React hooks for performant UIs (React 18+)</p>
</div>

---

## 💎 Highlights

- **Fewer re-renders.** Hooks update state only when needed: lazy flags, stable handlers and refs.
- **Hybrid return.** Many hooks can be used as a **tuple** or as an **object** — pick the shape you prefer.
- **Clean effects.** Subscriptions and cleanup are sensible by default; behavior is predictable.
- **SSR-ready.** Browser APIs are touched strictly inside effects.

---

## 📦 Installation

```bash
npm install @webeach/react-hooks
```

or

```bash
pnpm install @webeach/react-hooks
```

or

```bash
yarn add @webeach/react-hooks
```

---

## 📥 Import

**ES Modules**

```ts
import { useBoolean } from '@webeach/react-hooks/useBoolean';
import { useEffectCompare } from '@webeach/react-hooks/useEffectCompare';
import { useWindowEvent } from '@webeach/react-hooks/useWindowEvent';

// or
import { useBoolean, useEffectCompare, useWindowEvent } from '@webeach/react-hooks';
```

**CommonJS**

```ts
const { useBoolean } = require('@webeach/react-hooks/useBoolean');
const { useEffectCompare } = require('@webeach/react-hooks/useEffectCompare');
const { useWindowEvent } = require('@webeach/react-hooks/useWindowEvent');

// or
const { useBoolean, useEffectCompare, useWindowEvent } = require('@webeach/react-hooks');
```

### 🌿 Tree‑shaking
- Every hook is available as an **individual module path** (`@webeach/react-hooks/useX`). Importing this way pulls **only the code you need** — the most predictable and compact option for any bundler (ESM and CJS).
- Named import from the package root (`@webeach/react-hooks`) supports tree‑shaking in bundlers that optimize **ES modules** (Vite/Rollup/esbuild/Webpack 5 in production). Unused exports will be removed at build time.
- For **CommonJS** projects, we recommend per‑module imports (`require('@webeach/react-hooks/useX')`) to avoid pulling extra code through the index.

---

## 🛠 Hooks

### Alphabetical

+ [useAsyncCallback](./docs/en/useAsyncCallback.md)
+ [useAsyncHandler](./docs/en/useAsyncHandler.md)
+ [useBoolean](./docs/en/useBoolean.md)
+ [useCallbackCompare](./docs/en/useCallbackCompare.md)
+ [useCollection](./docs/en/useCollection.md)
+ [useControlled](./docs/en/useControlled.md)
+ [useDebounceCallback](./docs/en/useDebounceCallback.md)
+ [useDebounceState](./docs/en/useDebounceState.md)
+ [useDemandStructure](./docs/en/useDemandStructure.md)
+ [useDeps](./docs/en/useDeps.md)
+ [useDOMEvent](./docs/en/useDOMEvent.md)
+ [useEffectCompare](./docs/en/useEffectCompare.md)
+ [useForceUpdate](./docs/en/useForceUpdate.md)
+ [useFrame](./docs/en/useFrame.md)
+ [useFrameExtended](./docs/en/useFrameExtended.md)
+ [useImageLoader](./docs/en/useImageLoader.md)
+ [useIntersectionObserver](./docs/en/useIntersectionObserver.md)
+ [useIsomorphicLayoutEffect](./docs/en/useIsomorphicLayoutEffect.md)
+ [useLayoutEffectCompare](./docs/en/useLayoutEffectCompare.md)
+ [useLiveRef](./docs/en/useLiveRef.md)
+ [useLocalStorage](./docs/en/useLocalStorage.md)
+ [useLoop](./docs/en/useLoop.md)
+ [useMap](./docs/en/useMap.md)
+ [useMediaQuery](./docs/en/useMediaQuery.md)
+ [useMemoCompare](./docs/en/useMemoCompare.md)
+ [useNumber](./docs/en/useNumber.md)
+ [useOutsideEvent](./docs/en/useOutsideEvent.md)
+ [usePageTitle](./docs/en/usePageTitle.md)
+ [usePageVisibility](./docs/en/usePageVisibility.md)
+ [usePatchDeepState](./docs/en/usePatchDeepState.md)
+ [usePatchState](./docs/en/usePatchState.md)
+ [useRefEffect](./docs/en/useRefEffect.md)
+ [useRefState](./docs/en/useRefState.md)
+ [useResizeObserver](./docs/en/useResizeObserver.md)
+ [useSessionStorage](./docs/en/useSessionStorage.md)
+ [useSet](./docs/en/useSet.md)
+ [useStatus](./docs/en/useStatus.md)
+ [useThrottleCallback](./docs/en/useThrottleCallback.md)
+ [useThrottleState](./docs/en/useThrottleState.md)
+ [useTimeout](./docs/en/useTimeout.md)
+ [useTimeoutExtended](./docs/en/useTimeoutExtended.md)
+ [useToggle](./docs/en/useToggle.md)
+ [useUnmount](./docs/en/useUnmount.md)
+ [useWindowEvent](./docs/en/useWindowEvent.md)

### By category

#### State — simple primitives
- [useControlled](./docs/en/useControlled.md)
- [useBoolean](./docs/en/useBoolean.md)
- [useNumber](./docs/en/useNumber.md)
- [useToggle](./docs/en/useToggle.md)
- [useStatus](./docs/en/useStatus.md)

#### State — object patterns
- [usePatchDeepState](./docs/en/usePatchDeepState.md)
- [usePatchState](./docs/en/usePatchState.md)

#### State — collections
- [useCollection](./docs/en/useCollection.md)
- [useMap](./docs/en/useMap.md)
- [useSet](./docs/en/useSet.md)

#### State — storage (persistence)
- [useLocalStorage](./docs/en/useLocalStorage.md)
- [useSessionStorage](./docs/en/useSessionStorage.md)

#### Timers, loops & frames
- [useFrame](./docs/en/useFrame.md)
- [useFrameExtended](./docs/en/useFrameExtended.md)
- [useLoop](./docs/en/useLoop.md)
- [useTimeout](./docs/en/useTimeout.md)
- [useTimeoutExtended](./docs/en/useTimeoutExtended.md)

#### Rate limiting (throttle/debounce)
- [useDebounceCallback](./docs/en/useDebounceCallback.md)
- [useDebounceState](./docs/en/useDebounceState.md)
- [useThrottleCallback](./docs/en/useThrottleCallback.md)
- [useThrottleState](./docs/en/useThrottleState.md)

#### Async operations
- [useAsyncCallback](./docs/en/useAsyncCallback.md)
- [useAsyncHandler](./docs/en/useAsyncHandler.md)
- [useImageLoader](./docs/en/useImageLoader.md)

#### Dependency optimization
- [useDeps](./docs/en/useDeps.md)
- [useCallbackCompare](./docs/en/useCallbackCompare.md)
- [useEffectCompare](./docs/en/useEffectCompare.md)
- [useLayoutEffectCompare](./docs/en/useLayoutEffectCompare.md)
- [useMemoCompare](./docs/en/useMemoCompare.md)
- [useIsomorphicLayoutEffect](./docs/en/useIsomorphicLayoutEffect.md)

#### Lifecycle
- [useEffectCompare](./docs/en/useEffectCompare.md)
- [useLayoutEffectCompare](./docs/en/useLayoutEffectCompare.md)
- [useUnmount](./docs/en/useUnmount.md)

#### Refs
- [useLiveRef](./docs/en/useLiveRef.md)
- [useRefEffect](./docs/en/useRefEffect.md)

#### Events
- [useDOMEvent](./docs/en/useDOMEvent.md)
- [useWindowEvent](./docs/en/useWindowEvent.md)
- [useOutsideEvent](./docs/en/useOutsideEvent.md)

#### Observers
- [useIntersectionObserver](./docs/en/useIntersectionObserver.md)
- [useResizeObserver](./docs/en/useResizeObserver.md)

#### Page & document
- [useMediaQuery](./docs/en/useMediaQuery.md)
- [usePageTitle](./docs/en/usePageTitle.md)
- [usePageVisibility](./docs/en/usePageVisibility.md)

#### Utilities
- [useDemandStructure](./docs/en/useDemandStructure.md)
- [useForceUpdate](./docs/en/useForceUpdate.md)
- [useRefState](./docs/en/useRefState.md)

---

## 🧩 Dependencies

This package has **a single external dependency** — [@webeach/collection](https://github.com/webeach/collection).

- It is used **only** by the [`useCollection`](./docs/en/useCollection.md) hook.
- Other hooks do not import or require `collection`.

---

## 🔖 Releasing

Releases are automated with `semantic-release`.

Before publishing a new version, make sure that:

1. All changes are committed and pushed to `main`.
2. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
  - `feat: ...` — new features
  - `fix: ...` — bug fixes
  - `chore: ...`, `refactor: ...`, etc. — as needed
3. The next version (`patch`, `minor`, `major`) is derived automatically from the commit types.

---

## 👤 Author

Developed and maintained by [Ruslan Martynov](https://github.com/ruslan-mart).

Have an idea or found a bug? Open an issue or send a pull request.

---

## 📄 License

This package is distributed under the [MIT License](./LICENSE).
