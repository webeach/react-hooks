# Быстрый старт

`@webeach/react-hooks` — набор умных React-хуков для производительных интерфейсов. Работает с React 18+ и полностью совместим с SSR.

## Установка

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

## Использование

Импортируйте хук из корневого entry:

```tsx
import { useBoolean } from '@webeach/react-hooks';

function Example() {
  const [isOpen, { toggle }] = useBoolean(false);

  return <button onClick={toggle}>{isOpen ? 'Закрыть' : 'Открыть'}</button>;
}
```

Либо импортируйте отдельный хук по subpath — так загрузится только код этого хука, что особенно важно для CommonJS-сборок:

```tsx
import { useBoolean } from '@webeach/react-hooks';
```

## Требования

- React **18+**
- Node.js **18+** (для тулинга)

## Что дальше

Полный список хуков — в разделе [Хуки](/ru/hooks/useBoolean).
