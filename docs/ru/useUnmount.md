# `useUnmount`

## Описание

`useUnmount` — хук, который выполняет переданную функцию **один раз при размонтировании** компонента.

- При маунте хук ничего не делает.
- При анмаунте вызывает актуальный колбэк (через `useLiveRef`) — это гарантирует, что сработает **последняя версия** функции.

---

## Сигнатура

```ts
function useUnmount(callback: UseUnmountCallback): void;
```

- **Параметры**
   - `callback` — функция, вызываемая при размонтировании компонента.

- **Возвращает**: `void`.

---

## Примеры

### 1) Отписка от событий
```tsx
import { useEffect } from 'react';
import { useUnmount } from '@webeach/react-hooks/useUnmount';

export function Chat() {
  useEffect(() => {
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useUnmount(() => {
    window.removeEventListener('focus', onFocus);
  });

  return null;
}
```

### 2) Очистка таймера/интервала
```tsx
import { useUnmount } from '@webeach/react-hooks/useUnmount';

export function Ticker() {
  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useUnmount(() => {
    // запасная очистка, если понадобится
    clearIntervalAllSomehow?.();
  });

  return null;
}
```

### 3) Сохранение черновика/логирование
```tsx
import { useUnmount } from '@webeach/react-hooks/useUnmount';

export function Editor() {
  useUnmount(() => {
    saveDraft();
    console.log('Editor unmounted');
  });
  return <textarea />;
}
```

---

## Поведение

1. **Размонтирование**
  - Колбэк выполняется один раз при анмаунте компонента.

2. **Актуальность колбэка**
  - Используется `useLiveRef`, поэтому при анмаунте вызывается **последняя** версия `callback`, даже если он менялся между рендерами.

3. **SSR‑безопасность**
  - Эффект выполняется только в браузере. На сервере побочные эффекты не запускаются.

---

## Когда использовать

- Освобождение ресурсов: таймеры, подписки, контроллеры, веб‑сокеты.
- Сохранение состояния или аналитика при уходе со страницы/раздела.
- Атомарная финализация действий, начатых в компоненте.

## Когда **не** использовать

- Если очистку можно вернуть из того же `useEffect`, где ресурс создаётся — предпочтительнее сделать это в `return` колбэке эффекта.
- Для логики, которая должна срабатывать **на каждом** обновлении — используйте `useEffect` с зависимостями.

---

## Типизация

**Экспортируемые типы**

- `UseUnmountCallback`
   - Колбэк, вызываемый при размонтировании компонента: `() => any`.

---

## Смотрите также

- [useCallbackCompare](useCallbackCompare.md)
- [useEffectCompare](useEffectCompare.md)
- [useIsomorphicLayoutEffect](useIsomorphicLayoutEffect.md)
- [useLayoutEffectCompare](useLayoutEffectCompare.md)
- [useMemoCompare](useMemoCompare.md)
- [useRefEffect](useRefEffect.md)
