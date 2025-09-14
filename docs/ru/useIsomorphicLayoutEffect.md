# `useIsomorphicLayoutEffect`

## Описание

`useIsomorphicLayoutEffect` — это безопасная версия `useLayoutEffect`, которая автоматически переключается на `useEffect` при выполнении на сервере (например, во время SSR).

- В браузере ведёт себя как `useLayoutEffect`.
- На сервере использует `useEffect`, предотвращая предупреждение React: *"useLayoutEffect does nothing on the server"*.

---

## Сигнатура

```ts
export const useIsomorphicLayoutEffect: typeof useLayoutEffect | typeof useEffect;
```

---

## Пример

```tsx
import { useIsomorphicLayoutEffect } from '@webeach/react-hooks/useIsomorphicLayoutEffect';

function Component() {
  useIsomorphicLayoutEffect(() => {
    console.log('Runs layout effect only in the browser');
  }, []);

  return <div />;
}
```

---

## Когда использовать

- При написании компонентов, которые должны одинаково работать и в браузере, и на сервере.
- Чтобы избежать предупреждений React во время server-side rendering.

---

## Когда **не** использовать

- В проектах, где не используется SSR (можно напрямую использовать `useLayoutEffect`).
- Когда достаточно обычного `useEffect` без синхронных DOM-операций.

---

## Частые ошибки

1. **Игнорирование SSR-предупреждений**
   - Использование `useLayoutEffect` напрямую может привести к предупреждениям на сервере.

2. **Смешение с `useEffect`**
   - Используйте `useIsomorphicLayoutEffect`, когда нужны синхронные побочные эффекты в браузере и корректная работа при SSR.

---

## Смотрите также

- [useLayoutEffectCompare](useLayoutEffectCompare.md)
