# `useLiveRef`

## Описание

`useLiveRef` — это хук, который всегда возвращает **один и тот же** `ref`‑объект, чьё свойство `.current` на каждом рендере обновляется до **последнего** переданного значения. Это удобно, когда нужно читать актуальное значение внутри колбэков, эффектов, таймеров, обработчиков событий и т.п., **без** повторной подписки и ре-рендеров.

---

## Сигнатура

```ts
function useLiveRef<Value>(value: Value): React.RefObject<Value>;
```

- **Параметры**
  - `value: Value` — текущее значение, которое должно быть доступно через `ref.current`.
- **Возвращает**
  - `RefObject<Value>` — стабильный объект `ref` (не меняется между рендерами), где `ref.current` всегда указывает на последнее значение `value`.

---

## Примеры

### 1) Доступ к актуальному значению в обработчике браузерного события

```tsx
import { useEffect } from 'react';
import { useLiveRef } from '@webeach/react-hooks/useLiveRef';

export function CursorTracker({ enabled }: { enabled: boolean }) {
  const enabledRef = useLiveRef(enabled);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      // Берём актуальный флаг из ref, а не из замыкания первого рендера
      if (!enabledRef.current) {
        return;
      }
      // ...логика обработчика
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [enabledRef]); // enabledRef стабилен; эффект не пересоздаётся из-за смены enabled (можно его не указывать в зависимостях)

  return null;
}
```

### 2) Актуальные пропсы в `setInterval`

```tsx
import { useEffect } from 'react';
import { useLiveRef } from '@webeach/react-hooks/useLiveRef';

export function Poller({ intervalMs, onTick }: { intervalMs: number; onTick: () => void }) {
  const onTickRef = useLiveRef(onTick);

  useEffect(() => {
    const id = setInterval(() => {
      // Не нужно пересоздавать интервал при изменении onTick
      onTickRef.current();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, onTickRef]);

  return null;
}
```

### 3) Стабильные колбэки и актуальные данные внутри них

```tsx
import { useCallback, useState } from 'react';
import { useLiveRef } from '@webeach/react-hooks/useLiveRef';

export function Example() {
  const [count, setCount] = useState(0);
  const countRef = useLiveRef(count);

  // memoized колбэк не зависит от count, но внутри читает актуальный count
  const log = useCallback(() => {
    console.log('current count =', countRef.current);
  }, []);

  const handleButtonClick = () => {
    setCount((c) => c + 1);
    log();
  };

  return (
    <button onClick={handleButtonClick}>
      increment & log
    </button>
  );
}
```

---

## Поведение

1. **Стабильность объекта `ref`**
   - Возвращаемый объект `ref` создаётся один раз и **не меняется** между рендерами. Это позволяет использовать его в зависимостях эффектов и колбэков без лишних пересозданий.

2. **Обновление `.current` на каждом рендере**
   - Внутри хука `ref.current = value` выполняется на каждом рендере, благодаря чему в обработчиках всегда доступно **самое свежее** значение.

3. **Отсутствие лишних перерисовок**
   - Обновление `ref.current` **не** вызывает ре-рендер компонента.

4. **SSR/ISR**
   - Хук не обращается к `window`/`document` и безопасен для выполнения на сервере. На сервере `ref.current` будет равен последнему `value`, переданному в момент рендера.

5. **Сравнение с альтернативами**
   - В отличие от `useRef(initial)`, где вы сами должны обновлять `.current`, `useLiveRef` делает это автоматически каждый рендер.
   - В отличие от хранения значения в `useState`, `useLiveRef` не вызывает перерисовки при обновлении `.current`.
   - В отличие от простого замыкания, `useLiveRef` не «застаивает» значение: обработчики читают **актуальное**.

---

## Когда использовать

- Нужен доступ к последнему значению внутри долгоживущих подписок: `addEventListener`, `MutationObserver`, `ResizeObserver`, `setInterval`, `requestAnimationFrame`, WebSocket‑колбэков и т.п.
- Хотите держать колбэки и эффекты **стабильными** (не зависящими от часто меняющихся значений), но при этом читать **актуальные** данные.

---

## Когда **не** использовать

- Если требуется **реактивность** UI при изменении значения — используйте `useState`/`useReducer`. `useLiveRef` не перерисовывает компонент.

---

## Частые ошибки

1. **Ожидание перерисовки от `ref`**
   - Обновление `ref.current` не вызывает ререндер. Если вы привязываете отрисовку к этому значению, используйте состояние.

2. **Добавление изменчивых значений в зависимости эффекта**
   - Цель `useLiveRef` — избежать лишних пересозданий эффекта/колбэка. В зависимостях храните **сам `ref`**, а не исходное значение, которое «живёт» внутри него.

---

## Смотрите также

- [useRefEffect](useRefEffect.md)
- [useRefState](useRefState.md)
