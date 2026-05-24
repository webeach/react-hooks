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
    <a href="https://react-hooks.webea.ch">📖 Документация</a>
  </p>
  <p>Набор умных React‑хуков для производительных интерфейсов</p>
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

[useAsyncCallback](https://react-hooks.webea.ch/ru/hooks/useAsyncCallback.html), [useAsyncHandler](https://react-hooks.webea.ch/ru/hooks/useAsyncHandler.html), [useBoolean](https://react-hooks.webea.ch/ru/hooks/useBoolean.html), [useCallbackCompare](https://react-hooks.webea.ch/ru/hooks/useCallbackCompare.html), [useCollection](https://react-hooks.webea.ch/ru/hooks/useCollection.html), [useControlled](https://react-hooks.webea.ch/ru/hooks/useControlled.html), [useDebounceCallback](https://react-hooks.webea.ch/ru/hooks/useDebounceCallback.html), [useDebounceState](https://react-hooks.webea.ch/ru/hooks/useDebounceState.html), [useDemandStructure](https://react-hooks.webea.ch/ru/hooks/useDemandStructure.html), [useDeps](https://react-hooks.webea.ch/ru/hooks/useDeps.html), [useDOMEvent](https://react-hooks.webea.ch/ru/hooks/useDOMEvent.html), [useEffectCompare](https://react-hooks.webea.ch/ru/hooks/useEffectCompare.html), [useForceUpdate](https://react-hooks.webea.ch/ru/hooks/useForceUpdate.html), [useFrame](https://react-hooks.webea.ch/ru/hooks/useFrame.html), [useFrameExtended](https://react-hooks.webea.ch/ru/hooks/useFrameExtended.html), [useImageLoader](https://react-hooks.webea.ch/ru/hooks/useImageLoader.html), [useIntersectionObserver](https://react-hooks.webea.ch/ru/hooks/useIntersectionObserver.html), [useIsomorphicLayoutEffect](https://react-hooks.webea.ch/ru/hooks/useIsomorphicLayoutEffect.html), [useLayoutEffectCompare](https://react-hooks.webea.ch/ru/hooks/useLayoutEffectCompare.html), [useLiveRef](https://react-hooks.webea.ch/ru/hooks/useLiveRef.html), [useLocalStorage](https://react-hooks.webea.ch/ru/hooks/useLocalStorage.html), [useLoop](https://react-hooks.webea.ch/ru/hooks/useLoop.html), [useMap](https://react-hooks.webea.ch/ru/hooks/useMap.html), [useMediaQuery](https://react-hooks.webea.ch/ru/hooks/useMediaQuery.html), [useMemoCompare](https://react-hooks.webea.ch/ru/hooks/useMemoCompare.html), [useNumber](https://react-hooks.webea.ch/ru/hooks/useNumber.html), [useOutsideEvent](https://react-hooks.webea.ch/ru/hooks/useOutsideEvent.html), [usePageTitle](https://react-hooks.webea.ch/ru/hooks/usePageTitle.html), [usePageVisibility](https://react-hooks.webea.ch/ru/hooks/usePageVisibility.html), [usePatchDeepState](https://react-hooks.webea.ch/ru/hooks/usePatchDeepState.html), [usePatchState](https://react-hooks.webea.ch/ru/hooks/usePatchState.html), [useRefEffect](https://react-hooks.webea.ch/ru/hooks/useRefEffect.html), [useRefState](https://react-hooks.webea.ch/ru/hooks/useRefState.html), [useResizeObserver](https://react-hooks.webea.ch/ru/hooks/useResizeObserver.html), [useSessionStorage](https://react-hooks.webea.ch/ru/hooks/useSessionStorage.html), [useSet](https://react-hooks.webea.ch/ru/hooks/useSet.html), [useStatus](https://react-hooks.webea.ch/ru/hooks/useStatus.html), [useThrottleCallback](https://react-hooks.webea.ch/ru/hooks/useThrottleCallback.html), [useThrottleState](https://react-hooks.webea.ch/ru/hooks/useThrottleState.html), [useTimeout](https://react-hooks.webea.ch/ru/hooks/useTimeout.html), [useTimeoutExtended](https://react-hooks.webea.ch/ru/hooks/useTimeoutExtended.html), [useToggle](https://react-hooks.webea.ch/ru/hooks/useToggle.html), [useUnmount](https://react-hooks.webea.ch/ru/hooks/useUnmount.html), [useViewportBreakpoint](https://react-hooks.webea.ch/ru/hooks/useViewportBreakpoint.html), [useWindowEvent](https://react-hooks.webea.ch/ru/hooks/useWindowEvent.html)

### По категориям

#### Состояние — простые примитивы

[useControlled](https://react-hooks.webea.ch/ru/hooks/useControlled.html), [useBoolean](https://react-hooks.webea.ch/ru/hooks/useBoolean.html), [useNumber](https://react-hooks.webea.ch/ru/hooks/useNumber.html), [useToggle](https://react-hooks.webea.ch/ru/hooks/useToggle.html), [useStatus](https://react-hooks.webea.ch/ru/hooks/useStatus.html)

#### Состояние — объектные паттерны

[usePatchDeepState](https://react-hooks.webea.ch/ru/hooks/usePatchDeepState.html), [usePatchState](https://react-hooks.webea.ch/ru/hooks/usePatchState.html)

#### Состояние — коллекции

[useCollection](https://react-hooks.webea.ch/ru/hooks/useCollection.html), [useMap](https://react-hooks.webea.ch/ru/hooks/useMap.html), [useSet](https://react-hooks.webea.ch/ru/hooks/useSet.html)

#### Состояние — хранилища (персистентность)

[useLocalStorage](https://react-hooks.webea.ch/ru/hooks/useLocalStorage.html), [useSessionStorage](https://react-hooks.webea.ch/ru/hooks/useSessionStorage.html)

#### Таймеры, циклы и кадры

[useFrame](https://react-hooks.webea.ch/ru/hooks/useFrame.html), [useFrameExtended](https://react-hooks.webea.ch/ru/hooks/useFrameExtended.html), [useLoop](https://react-hooks.webea.ch/ru/hooks/useLoop.html), [useTimeout](https://react-hooks.webea.ch/ru/hooks/useTimeout.html), [useTimeoutExtended](https://react-hooks.webea.ch/ru/hooks/useTimeoutExtended.html)

#### Ограничение частоты (throttle/debounce)

[useDebounceCallback](https://react-hooks.webea.ch/ru/hooks/useDebounceCallback.html), [useDebounceState](https://react-hooks.webea.ch/ru/hooks/useDebounceState.html), [useThrottleCallback](https://react-hooks.webea.ch/ru/hooks/useThrottleCallback.html), [useThrottleState](https://react-hooks.webea.ch/ru/hooks/useThrottleState.html)

#### Асинхронные операции

[useAsyncCallback](https://react-hooks.webea.ch/ru/hooks/useAsyncCallback.html), [useAsyncHandler](https://react-hooks.webea.ch/ru/hooks/useAsyncHandler.html), [useImageLoader](https://react-hooks.webea.ch/ru/hooks/useImageLoader.html)

#### Оптимизация зависимостей

[useDeps](https://react-hooks.webea.ch/ru/hooks/useDeps.html), [useCallbackCompare](https://react-hooks.webea.ch/ru/hooks/useCallbackCompare.html), [useEffectCompare](https://react-hooks.webea.ch/ru/hooks/useEffectCompare.html), [useLayoutEffectCompare](https://react-hooks.webea.ch/ru/hooks/useLayoutEffectCompare.html), [useMemoCompare](https://react-hooks.webea.ch/ru/hooks/useMemoCompare.html), [useIsomorphicLayoutEffect](https://react-hooks.webea.ch/ru/hooks/useIsomorphicLayoutEffect.html)

#### Жизненный цикл

[useEffectCompare](https://react-hooks.webea.ch/ru/hooks/useEffectCompare.html), [useLayoutEffectCompare](https://react-hooks.webea.ch/ru/hooks/useLayoutEffectCompare.html), [useUnmount](https://react-hooks.webea.ch/ru/hooks/useUnmount.html)

#### Рефы

[useLiveRef](https://react-hooks.webea.ch/ru/hooks/useLiveRef.html), [useRefEffect](https://react-hooks.webea.ch/ru/hooks/useRefEffect.html)

#### События

[useDOMEvent](https://react-hooks.webea.ch/ru/hooks/useDOMEvent.html), [useWindowEvent](https://react-hooks.webea.ch/ru/hooks/useWindowEvent.html), [useOutsideEvent](https://react-hooks.webea.ch/ru/hooks/useOutsideEvent.html)

#### Наблюдатели (Observers)

[useIntersectionObserver](https://react-hooks.webea.ch/ru/hooks/useIntersectionObserver.html), [useResizeObserver](https://react-hooks.webea.ch/ru/hooks/useResizeObserver.html)

#### Страница/документ

[useMediaQuery](https://react-hooks.webea.ch/ru/hooks/useMediaQuery.html), [usePageTitle](https://react-hooks.webea.ch/ru/hooks/usePageTitle.html), [usePageVisibility](https://react-hooks.webea.ch/ru/hooks/usePageVisibility.html), [useViewportBreakpoint](https://react-hooks.webea.ch/ru/hooks/useViewportBreakpoint.html)

#### Служебные

[useDemandStructure](https://react-hooks.webea.ch/ru/hooks/useDemandStructure.html), [useForceUpdate](https://react-hooks.webea.ch/ru/hooks/useForceUpdate.html), [useRefState](https://react-hooks.webea.ch/ru/hooks/useRefState.html)

---

## 🧩 Зависимости

Библиотека имеет **единственную внешнюю зависимость** — [@webeach/collection](https://github.com/webeach/collection).

- Эта зависимость используется **только** хуком [`useCollection`](https://react-hooks.webea.ch/ru/hooks/useCollection.html).
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
