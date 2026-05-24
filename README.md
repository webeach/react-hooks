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
  <p>
    <a href="https://react-hooks.webea.ch">📖 Documentation</a>
  </p>
  <p>A set of smart React hooks for performant UIs</p>
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

```bash
pnpm install @webeach/react-hooks
```

```bash
yarn add @webeach/react-hooks
```

---

## 📥 Import

```ts
import { useBoolean } from '@webeach/react-hooks/useBoolean';
import { useEffectCompare } from '@webeach/react-hooks/useEffectCompare';
import { useWindowEvent } from '@webeach/react-hooks/useWindowEvent';

// or
import {
  useBoolean,
  useEffectCompare,
  useWindowEvent,
} from '@webeach/react-hooks';
```

### 🌿 Tree‑shaking

- Every hook is available as an **individual module path** (`@webeach/react-hooks/useX`). Importing this way pulls **only the code you need** — the most predictable and compact option for any bundler (ESM and CJS).
- Named import from the package root (`@webeach/react-hooks`) supports tree‑shaking in bundlers that optimize **ES modules** (Vite/Rollup/esbuild/Webpack 5 in production). Unused exports will be removed at build time.
- For **CommonJS** projects, we recommend per‑module imports (`require('@webeach/react-hooks/useX')`) to avoid pulling extra code through the index.

---

## 🛠 Hooks

### Alphabetical

[useAsyncCallback](https://react-hooks.webea.ch/hooks/useAsyncCallback.html), [useAsyncHandler](https://react-hooks.webea.ch/hooks/useAsyncHandler.html), [useBoolean](https://react-hooks.webea.ch/hooks/useBoolean.html), [useCallbackCompare](https://react-hooks.webea.ch/hooks/useCallbackCompare.html), [useCollection](https://react-hooks.webea.ch/hooks/useCollection.html), [useControlled](https://react-hooks.webea.ch/hooks/useControlled.html), [useDebounceCallback](https://react-hooks.webea.ch/hooks/useDebounceCallback.html), [useDebounceState](https://react-hooks.webea.ch/hooks/useDebounceState.html), [useDemandStructure](https://react-hooks.webea.ch/hooks/useDemandStructure.html), [useDeps](https://react-hooks.webea.ch/hooks/useDeps.html), [useDOMEvent](https://react-hooks.webea.ch/hooks/useDOMEvent.html), [useEffectCompare](https://react-hooks.webea.ch/hooks/useEffectCompare.html), [useForceUpdate](https://react-hooks.webea.ch/hooks/useForceUpdate.html), [useFrame](https://react-hooks.webea.ch/hooks/useFrame.html), [useFrameExtended](https://react-hooks.webea.ch/hooks/useFrameExtended.html), [useImageLoader](https://react-hooks.webea.ch/hooks/useImageLoader.html), [useIntersectionObserver](https://react-hooks.webea.ch/hooks/useIntersectionObserver.html), [useIsomorphicLayoutEffect](https://react-hooks.webea.ch/hooks/useIsomorphicLayoutEffect.html), [useLayoutEffectCompare](https://react-hooks.webea.ch/hooks/useLayoutEffectCompare.html), [useLiveRef](https://react-hooks.webea.ch/hooks/useLiveRef.html), [useLocalStorage](https://react-hooks.webea.ch/hooks/useLocalStorage.html), [useLoop](https://react-hooks.webea.ch/hooks/useLoop.html), [useMap](https://react-hooks.webea.ch/hooks/useMap.html), [useMediaQuery](https://react-hooks.webea.ch/hooks/useMediaQuery.html), [useMemoCompare](https://react-hooks.webea.ch/hooks/useMemoCompare.html), [useNumber](https://react-hooks.webea.ch/hooks/useNumber.html), [useOutsideEvent](https://react-hooks.webea.ch/hooks/useOutsideEvent.html), [usePageTitle](https://react-hooks.webea.ch/hooks/usePageTitle.html), [usePageVisibility](https://react-hooks.webea.ch/hooks/usePageVisibility.html), [usePatchDeepState](https://react-hooks.webea.ch/hooks/usePatchDeepState.html), [usePatchState](https://react-hooks.webea.ch/hooks/usePatchState.html), [useRefEffect](https://react-hooks.webea.ch/hooks/useRefEffect.html), [useRefState](https://react-hooks.webea.ch/hooks/useRefState.html), [useResizeObserver](https://react-hooks.webea.ch/hooks/useResizeObserver.html), [useSessionStorage](https://react-hooks.webea.ch/hooks/useSessionStorage.html), [useSet](https://react-hooks.webea.ch/hooks/useSet.html), [useStatus](https://react-hooks.webea.ch/hooks/useStatus.html), [useThrottleCallback](https://react-hooks.webea.ch/hooks/useThrottleCallback.html), [useThrottleState](https://react-hooks.webea.ch/hooks/useThrottleState.html), [useTimeout](https://react-hooks.webea.ch/hooks/useTimeout.html), [useTimeoutExtended](https://react-hooks.webea.ch/hooks/useTimeoutExtended.html), [useToggle](https://react-hooks.webea.ch/hooks/useToggle.html), [useUnmount](https://react-hooks.webea.ch/hooks/useUnmount.html), [useViewportBreakpoint](https://react-hooks.webea.ch/hooks/useViewportBreakpoint.html), [useWindowEvent](https://react-hooks.webea.ch/hooks/useWindowEvent.html)

### By category

#### State — simple primitives

[useControlled](https://react-hooks.webea.ch/hooks/useControlled.html), [useBoolean](https://react-hooks.webea.ch/hooks/useBoolean.html), [useNumber](https://react-hooks.webea.ch/hooks/useNumber.html), [useToggle](https://react-hooks.webea.ch/hooks/useToggle.html), [useStatus](https://react-hooks.webea.ch/hooks/useStatus.html)

#### State — object patterns

[usePatchDeepState](https://react-hooks.webea.ch/hooks/usePatchDeepState.html), [usePatchState](https://react-hooks.webea.ch/hooks/usePatchState.html)

#### State — collections

[useCollection](https://react-hooks.webea.ch/hooks/useCollection.html), [useMap](https://react-hooks.webea.ch/hooks/useMap.html), [useSet](https://react-hooks.webea.ch/hooks/useSet.html)

#### State — storage (persistence)

[useLocalStorage](https://react-hooks.webea.ch/hooks/useLocalStorage.html), [useSessionStorage](https://react-hooks.webea.ch/hooks/useSessionStorage.html)

#### Timers, loops & frames

[useFrame](https://react-hooks.webea.ch/hooks/useFrame.html), [useFrameExtended](https://react-hooks.webea.ch/hooks/useFrameExtended.html), [useLoop](https://react-hooks.webea.ch/hooks/useLoop.html), [useTimeout](https://react-hooks.webea.ch/hooks/useTimeout.html), [useTimeoutExtended](https://react-hooks.webea.ch/hooks/useTimeoutExtended.html)

#### Rate limiting (throttle/debounce)

[useDebounceCallback](https://react-hooks.webea.ch/hooks/useDebounceCallback.html), [useDebounceState](https://react-hooks.webea.ch/hooks/useDebounceState.html), [useThrottleCallback](https://react-hooks.webea.ch/hooks/useThrottleCallback.html), [useThrottleState](https://react-hooks.webea.ch/hooks/useThrottleState.html)

#### Async operations

[useAsyncCallback](https://react-hooks.webea.ch/hooks/useAsyncCallback.html), [useAsyncHandler](https://react-hooks.webea.ch/hooks/useAsyncHandler.html), [useImageLoader](https://react-hooks.webea.ch/hooks/useImageLoader.html)

#### Dependency optimization

[useDeps](https://react-hooks.webea.ch/hooks/useDeps.html), [useCallbackCompare](https://react-hooks.webea.ch/hooks/useCallbackCompare.html), [useEffectCompare](https://react-hooks.webea.ch/hooks/useEffectCompare.html), [useLayoutEffectCompare](https://react-hooks.webea.ch/hooks/useLayoutEffectCompare.html), [useMemoCompare](https://react-hooks.webea.ch/hooks/useMemoCompare.html), [useIsomorphicLayoutEffect](https://react-hooks.webea.ch/hooks/useIsomorphicLayoutEffect.html)

#### Lifecycle

[useEffectCompare](https://react-hooks.webea.ch/hooks/useEffectCompare.html), [useLayoutEffectCompare](https://react-hooks.webea.ch/hooks/useLayoutEffectCompare.html), [useUnmount](https://react-hooks.webea.ch/hooks/useUnmount.html)

#### Refs

[useLiveRef](https://react-hooks.webea.ch/hooks/useLiveRef.html), [useRefEffect](https://react-hooks.webea.ch/hooks/useRefEffect.html)

#### Events

[useDOMEvent](https://react-hooks.webea.ch/hooks/useDOMEvent.html), [useWindowEvent](https://react-hooks.webea.ch/hooks/useWindowEvent.html), [useOutsideEvent](https://react-hooks.webea.ch/hooks/useOutsideEvent.html)

#### Observers

[useIntersectionObserver](https://react-hooks.webea.ch/hooks/useIntersectionObserver.html), [useResizeObserver](https://react-hooks.webea.ch/hooks/useResizeObserver.html)

#### Page & document

[useMediaQuery](https://react-hooks.webea.ch/hooks/useMediaQuery.html), [usePageTitle](https://react-hooks.webea.ch/hooks/usePageTitle.html), [usePageVisibility](https://react-hooks.webea.ch/hooks/usePageVisibility.html), [useViewportBreakpoint](https://react-hooks.webea.ch/hooks/useViewportBreakpoint.html)

#### Utilities

[useDemandStructure](https://react-hooks.webea.ch/hooks/useDemandStructure.html), [useForceUpdate](https://react-hooks.webea.ch/hooks/useForceUpdate.html), [useRefState](https://react-hooks.webea.ch/hooks/useRefState.html)

---

## 🧩 Dependencies

This package has **a single external dependency** — [@webeach/collection](https://github.com/webeach/collection).

- It is used **only** by the [`useCollection`](https://react-hooks.webea.ch/hooks/useCollection.html) hook.
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
