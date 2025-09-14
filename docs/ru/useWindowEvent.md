# `useWindowEvent`

## Описание

`useWindowEvent` — хук для **типобезопасного** подключения нативных событий глобального объекта `window`. Поддерживает две формы: одиночное событие и **карта** событий. Хук использует актуальные обработчики без перевешивания слушателей и корректно снимает их при размонтировании. Опции по умолчанию: `capture: false`, `once: false`, `passive: false`.

---

## Сигнатура

```ts
// 1) Одиночное событие
function useWindowEvent<T extends UseWindowEventType>(
  eventType: T,
  eventHandler: UseWindowEventHandler<T>,
  eventOptions?: AddEventListenerOptions,
): void;

// 2) Карта событий
function useWindowEvent(eventsMap: UseWindowEventMap): void;
```

- **Параметры**
   - `eventType` — строка события окна (`'resize'`, `'scroll'`, `'keydown'`, и т.д.).
   - `eventHandler` — обработчик; тип события выводится автоматически.
   - `eventOptions?` — опции слушателя (`capture`, `once`, `passive`).
   - `eventsMap` — объект вида `{ type: handler | [handler, options] }`.

- **Возвращает**
   - `void`.

---

## Примеры

### 1) Логирование ширины окна при `resize`

```tsx
import { useState } from 'react';
import { useWindowEvent } from '@webeach/react-hooks/useWindowEvent';

export function ViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useWindowEvent('resize', () => {
    setWidth(window.innerWidth);
  });

  return <div>width: {width}px</div>;
}
```

### 2) Предупреждение перед уходом со страницы (`beforeunload`)

```tsx
import { useWindowEvent } from '@webeach/react-hooks/useWindowEvent';

type ConfirmLeaveProps = {
  enabled: boolean;
};

export function ConfirmLeave(props: ConfirmLeaveProps) {
  const { enabled } = props;
  
  useWindowEvent('beforeunload', (event) => {
    if (!enabled) {
      return;
    }

    event.preventDefault();
    event.returnValue = '';
  });

  return null;
}
```

### 3) Карта событий: `scroll` (passive) + `keydown` (once)

```tsx
import { useWindowEvent } from '@webeach/react-hooks/useWindowEvent';

export function ScrollAndHotkey() {
  useWindowEvent({
    scroll: [
      () => {
        // работаем без preventDefault; passive=true улучшает производительность скролла
        console.debug('scrollY =', window.scrollY);
      },
      { passive: true },
    ],
    keydown: [
      (event) => {
        if (event.key === 'h') {
          console.log('hotkey!');
        }
      },
      { once: true },
    ],
  });

  return null;
}
```

---

## Поведение

1. **Подключение в layout‑фазе**
   - Подписка и отписка выполняются синхронно в layout‑фазе, чтобы не пропускать ранние события до пейнта.

2. **Актуальность обработчиков**
   - Хук хранит обработчики в «живой» ссылке, поэтому вы можете менять функции между рендерами без перевешивания слушателей — вызовется актуальная версия.

3. **Когда происходит перевешивание**
   - Слушатели перевешиваются при изменении **структуры** карты событий/их опций (`capture`/`once`/`passive`). Изменение самих функций‑обработчиков не требует перевешивания.

4. **Опции по умолчанию**
   - Если опции не указаны, используются `capture: false`, `once: false`, `passive: false`.

5. **Автоматическая очистка**
   - Все подписки автоматически снимаются при размонтировании компонента.

6. **SSR‑безопасность**
   - Во время рендера к `window` обращений нет; подписка происходит только после маунта.

---

## Когда использовать

- События глобального окна: `resize`, `scroll`, `keydown`, `visibilitychange`, `beforeunload` и др.
- Сценарии, где обработчик часто меняется и важно **не** перевешивать слушатели.
- Когда удобно описать несколько событий одной картой.

---

## Когда **не** использовать

- Если хватает React‑обработчиков на элементах (`onClick`, `onChange`) — они не требуют глобальных слушателей.
- Для специфичных источников событий (`document`, `media`, `BroadcastChannel`) используйте соответствующие хуки/обёртки.

---

## Частые ошибки

1. **Отсутствие `passive` для скролла**
   - Если не планируете вызывать `preventDefault`, указывайте `{ passive: true }` для лучшей производительности прокрутки.

2. **Ожидание синтетических событий React**
   - Хук работает с **нативными** событиями `window`. Типы и поведение отличаются от `SyntheticEvent`.

3. **Случайная смена опций**
   - Изменение `capture`/`once`/`passive` приводит к перевешиванию. Убедитесь, что это осознанное действие.

4. **Использование `signal`**
   - Параметр `signal` не поддерживается; используйте собственные механизмы отмены при необходимости.

---

## Типизация

**Экспортируемые типы**

- `UseWindowEventHandler<EventType>`
   - `(event: UseWindowEventInstance<EventType>) => void` — типобезопасный обработчик; тип события выводится из имени (`'keydown'` → `KeyboardEvent`, `'resize'` → `UIEvent` / `Event`).

- `UseWindowEventInstance<EventType>`
   - Соответствующий объект события из `WindowEventMap[EventType]`.

- `UseWindowEventMap`
   - Сопоставление `{ [type]: handler | [handler, options] }` для навешивания нескольких подписок одним вызовом.

- `UseWindowEventOptions`
   - Опции слушателя без `signal`: `{ capture?: boolean; once?: boolean; passive?: boolean }`.

- `UseWindowEventType`
   - Объединение всех ключей `WindowEventMap`.

---

## Смотрите также

- [useOutsideEvent](useOutsideEvent.md)
- [useDOMEvent](useWindowEvent.md)
