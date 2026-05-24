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
  <p>Набор умных React‑хуков для производительных интерфейсов (React 18+)</p>
</div>

---

## 💎 Особенности

- **Меньше перерисовок.** Хуки обновляют состояние только по необходимости: ленивые флаги, стабильные обработчики и ссылки.
- **Гибридный возврат.** Некоторые хуки можно использовать как **кортеж** или как **объект** — выбирайте формат под задачу.
- **Аккуратные эффекты.** Подписки и очистка ресурсов настроены по умолчанию, поведение предсказуемо.
- **Полная совместимость с SSR.** Хуки используют браузерные API строго внутри эффектов.

---

## 📦 Установка

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

## 📥 Подключение

```ts
import { useBoolean } from '@webeach/react-hooks/useBoolean';
import { useEffectCompare } from '@webeach/react-hooks/useEffectCompare';
import { useWindowEvent } from '@webeach/react-hooks/useWindowEvent';

// или
import {
  useBoolean,
  useEffectCompare,
  useWindowEvent,
} from '@webeach/react-hooks';
```

### 🌿 Tree‑shaking

- Каждый хук доступен как **отдельный модуль по пути** (`@webeach/react-hooks/useX`). Такой импорт подтягивает **только нужный код** — это самый предсказуемый и компактный вариант для любых бандлеров (ESM и CJS).
- Именованный импорт из корня (`@webeach/react-hooks`) поддерживает tree‑shaking в сборщиках, которые оптимизируют **ES‑модули** (Vite/Rollup/esbuild/Webpack 5 в production). Неиспользуемые экспорты будут удалены на этапе сборки.
- Для проектов на **CommonJS** рекомендуем точечные импорты по пути модуля (`require('@webeach/react-hooks/useX')`), чтобы не тянуть лишние файлы через индекс.

---

## 🛠 Список хуков

### По алфавиту

- [useAsyncCallback](./docs/ru/useAsyncCallback.md)
- [useAsyncHandler](./docs/ru/useAsyncHandler.md)
- [useBoolean](./docs/ru/useBoolean.md)
- [useCallbackCompare](./docs/ru/useCallbackCompare.md)
- [useCollection](./docs/ru/useCollection.md)
- [useControlled](./docs/ru/useControlled.md)
- [useDebounceCallback](./docs/ru/useDebounceCallback.md)
- [useDebounceState](./docs/ru/useDebounceState.md)
- [useDemandStructure](./docs/ru/useDemandStructure.md)
- [useDeps](./docs/ru/useDeps.md)
- [useDOMEvent](./docs/ru/useDOMEvent.md)
- [useEffectCompare](./docs/ru/useEffectCompare.md)
- [useForceUpdate](./docs/ru/useForceUpdate.md)
- [useFrame](./docs/ru/useFrame.md)
- [useFrameExtended](./docs/ru/useFrameExtended.md)
- [useImageLoader](./docs/ru/useImageLoader.md)
- [useIntersectionObserver](./docs/ru/useIntersectionObserver.md)
- [useIsomorphicLayoutEffect](./docs/ru/useIsomorphicLayoutEffect.md)
- [useLayoutEffectСompare](./docs/ru/useLayoutEffectСompare.md)
- [useLiveRef](./docs/ru/useLiveRef.md)
- [useLocalStorage](./docs/ru/useLocalStorage.md)
- [useLoop](./docs/ru/useLoop.md)
- [useMap](./docs/ru/useMap.md)
- [useMediaQuery](./docs/ru/useMediaQuery.md)
- [useMemoCompare](./docs/ru/useMemoCompare.md)
- [useNumber](./docs/ru/useNumber.md)
- [useOutsideEvent](./docs/ru/useOutsideEvent.md)
- [usePageTitle](./docs/ru/usePageTitle.md)
- [usePageVisibility](./docs/ru/usePageVisibility.md)
- [usePatchDeepState](./docs/ru/usePatchDeepState.md)
- [usePatchState](./docs/ru/usePatchState.md)
- [useRefEffect](./docs/ru/useRefEffect.md)
- [useRefState](./docs/ru/useRefState.md)
- [useResizeObserver](./docs/ru/useResizeObserver.md)
- [useSessionStorage](./docs/ru/useSessionStorage.md)
- [useSet](./docs/ru/useSet.md)
- [useStatus](./docs/ru/useStatus.md)
- [useThrottleCallback](./docs/ru/useThrottleCallback.md)
- [useThrottleState](./docs/ru/useThrottleState.md)
- [useTimeout](./docs/ru/useTimeout.md)
- [useTimeoutExtended](./docs/ru/useTimeoutExtended.md)
- [useToggle](./docs/ru/useToggle.md)
- [useUnmount](./docs/ru/useUnmount.md)
- [useViewportBreakpoint](./docs/ru/useViewportBreakpoint.md)
- [useWindowEvent](./docs/ru/useWindowEvent.md)

### По категориям

#### Состояние — простые примитивы

- [useControlled](./docs/ru/useControlled.md)
- [useBoolean](./docs/ru/useBoolean.md)
- [useNumber](./docs/ru/useNumber.md)
- [useToggle](./docs/ru/useToggle.md)
- [useStatus](./docs/ru/useStatus.md)

#### Состояние — объектные паттерны

- [usePatchDeepState](./docs/ru/usePatchDeepState.md)
- [usePatchState](./docs/ru/usePatchState.md)

#### Состояние — коллекции

- [useCollection](./docs/ru/useCollection.md)
- [useMap](./docs/ru/useMap.md)
- [useSet](./docs/ru/useSet.md)

#### Состояние — хранилища (персистентность)

- [useLocalStorage](./docs/ru/useLocalStorage.md)
- [useSessionStorage](./docs/ru/useSessionStorage.md)

#### Таймеры, циклы и кадры

- [useFrame](./docs/ru/useFrame.md)
- [useFrameExtended](./docs/ru/useFrameExtended.md)
- [useLoop](./docs/ru/useLoop.md)
- [useTimeout](./docs/ru/useTimeout.md)
- [useTimeoutExtended](./docs/ru/useTimeoutExtended.md)

#### Ограничение частоты (throttle/debounce)

- [useDebounceCallback](./docs/ru/useDebounceCallback.md)
- [useDebounceState](./docs/ru/useDebounceState.md)
- [useThrottleCallback](./docs/ru/useThrottleCallback.md)
- [useThrottleState](./docs/ru/useThrottleState.md)

#### Асинхронные операции

- [useAsyncCallback](./docs/ru/useAsyncCallback.md)
- [useAsyncHandler](./docs/ru/useAsyncHandler.md)
- [useImageLoader](./docs/ru/useImageLoader.md)

#### Оптимизация зависимостей

- [useDeps](./docs/ru/useDeps.md)
- [useCallbackCompare](./docs/ru/useCallbackCompare.md)
- [useEffectCompare](./docs/ru/useEffectCompare.md)
- [useLayoutEffectCompare](./docs/ru/useLayoutEffectCompare.md)
- [useMemoCompare](./docs/ru/useMemoCompare.md)
- [useIsomorphicLayoutEffect](./docs/ru/useIsomorphicLayoutEffect.md)

#### Жизненный цикл

- [useEffectCompare](./docs/ru/useEffectCompare.md)
- [useLayoutEffectCompare](./docs/ru/useLayoutEffectCompare.md)
- [useUnmount](./docs/ru/useUnmount.md)

#### Рефы

- [useLiveRef](./docs/ru/useLiveRef.md)
- [useRefEffect](./docs/ru/useRefEffect.md)

#### События

- [useDOMEvent](./docs/ru/useDOMEvent.md)
- [useWindowEvent](./docs/ru/useWindowEvent.md)
- [useOutsideEvent](./docs/ru/useOutsideEvent.md)

#### Наблюдатели (Observers)

- [useIntersectionObserver](./docs/ru/useIntersectionObserver.md)
- [useResizeObserver](./docs/ru/useResizeObserver.md)

#### Страница/документ

- [useMediaQuery](./docs/ru/useMediaQuery.md)
- [usePageTitle](./docs/ru/usePageTitle.md)
- [usePageVisibility](./docs/ru/usePageVisibility.md)
- [useViewportBreakpoint](./docs/ru/useViewportBreakpoint.md)

#### Служебные

- [useDemandStructure](./docs/ru/useDemandStructure.md)
- [useForceUpdate](./docs/ru/useForceUpdate.md)
- [useRefState](./docs/ru/useRefState.md)

---

## 🧩 Зависимости

Библиотека имеет **единственную внешнюю зависимость** — [@webeach/collection](https://github.com/webeach/collection).

- Эта зависимость используется **только** хуком [`useCollection`](./docs/ru/useCollection.md).
- Прочие хуки не импортируют и не требуют `collection`.

---

## 🔖 Выпуск новой версии

Релизы обрабатываются автоматически с помощью `semantic-release`.

Перед публикацией новой версии убедись, что:

1. Все изменения закоммичены и запушены в ветку `main`.
2. Сообщения коммитов соответствуют формату [Conventional Commits](https://www.conventionalcommits.org/ru/v1.0.0/):

- `feat: ...` — для новых фич
- `fix: ...` — для исправлений багов
- `chore: ...`, `refactor: ...` и другие типы — по необходимости

3. Версионирование определяется автоматически на основе типа коммитов (`patch`, `minor`, `major`).

---

## 👨‍💻 Автор

Разработка и поддержка: [Руслан Мартынов](https://github.com/ruslan-mart)

Если у тебя есть предложения или найден баг, открывай issue или отправляй pull request.

---

## 📄 Лицензия

Этот пакет распространяется под [лицензией MIT](./LICENSE).
