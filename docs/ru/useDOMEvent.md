# `useDOMEvent`

## Описание

`useDOMEvent` — хук для **типобезопасного** подключения DOM‑событий к элементу. Поддерживает четыре формы вызова: с готовым `ref` и одним событием, с автосозданием `ref` и одним событием, с `ref` и **картой** событий, а также с картой событий и автосозданием `ref`.

Хук автоматически использует **актуальные обработчики** без перевешивания слушателей и аккуратно отсоединяет их при размонтировании. По умолчанию опции слушателя: `capture: false`, `once: false`, `passive: false`.

---

## Сигнатура

```ts
// 1) ref + одно событие
function useDOMEvent<El extends Element | null, T extends UseDOMEventType>(
  ref: React.RefObject<El | null>,
  eventType: T,
  eventHandler: UseDOMEventHandler<T>,
  eventOptions?: AddEventListenerOptions,
): void;

// 2) одно событие + автoref
function useDOMEvent<El extends Element | null, T extends UseDOMEventType>(
  eventType: T,
  eventHandler: UseDOMEventHandler<T>,
  eventOptions?: AddEventListenerOptions,
): [React.RefObject<El | null>];

// 3) ref + карта событий
function useDOMEvent<El extends Element | null>(
  ref: React.RefObject<El | null>,
  eventsMap: UseDOMEventMap,
): void;

// 4) карта событий + автoref
function useDOMEvent<El extends Element | null>(
  eventsMap: UseDOMEventMap,
): [React.RefObject<El | null>];
```

- **Параметры**
   - `ref` — ссылка на DOM‑элемент для навешивания слушателей.
   - `eventType` — строка DOM‑события (например, `'click'`, `'keydown'`).
   - `eventHandler` — обработчик события; тип события выводится автоматически.
   - `eventOptions?` — опции слушателя (`capture`, `once`, `passive`).
   - `eventsMap` — объект вида `{ type: handler | [handler, options] }`.

- **Возвращает**
   - В формах с автoref — кортеж `[ref]`. В формах с переданным `ref` — `void`.

---

## Примеры

### 1) Существующий `ref` + одиночное событие

```tsx
import { useRef } from 'react';
import { useDOMEvent } from '@webeach/react-hooks/useDOMEvent';

export function InputOnEnter() {
  const inputRef = useRef<HTMLInputElement>(null);

  useDOMEvent(inputRef, 'keydown', (event) => {
    if (event.key === 'Enter') {
      console.log('Submit!');
      event.preventDefault();
    }
  });

  return <input ref={inputRef} />;
}
```

### 2) Автосоздание `ref` + опции слушателя

```tsx
import { useDOMEvent } from '@webeach/react-hooks/useDOMEvent';

export function ScrollLogger() {
  const [ref] = useDOMEvent<HTMLDivElement>('scroll', (event) => {
    console.log('scrollTop =', event.target.scrollTop);
  }, { passive: true });

  return <div ref={ref} style={{ overflow: 'auto', maxHeight: 200 }}>…content…</div>;
}
```

### 3) Карта событий с разными типами и опциями

```tsx
import { useRef } from 'react';
import { useDOMEvent } from '@webeach/react-hooks/useDOMEvent';

export function HoverAndClick() {
  const ref = useRef<HTMLButtonElement>(null);

  useDOMEvent(ref, {
    mouseenter: (event) => console.log('x', event.clientX), // MouseEvent
    click: [(event) => console.log('clicked', event.button), { capture: false }],
  });

  return <button ref={ref}>Hover or Click</button>;
}
```

---

## Поведение

1. **Подключение в layout‑фазе**
   - Слушатели навешиваются/снимаются синхронно в layout‑фазе, чтобы не пропускать ранние события перед пейнтом.

2. **Актуальность обработчиков**
   - Обработчики читаются из «живой» ссылки; вы можете менять функции между рендерами, и это **не** приведёт к перевешиванию слушателей — будет использована актуальная версия.

3. **Когда перевешиваются слушатели**
   - Переподключение происходит при смене **элемента** (`ref.current`) или **структуры** карты событий/их опций (`capture`/`once`/`passive`). Изменение самих функций‑обработчиков не требует перевешивания.

4. **Опции по умолчанию**
   - Если опции не переданы, используются `capture: false`, `once: false`, `passive: false`.

5. **Автоочистка**
   - Все слушатели автоматически снимаются при размонтировании компонента.

6. **SSR‑безопасность**
   - Во время рендера к `window`/`document` обращений нет; подписка выполняется в эффекте после маунта.

---

## Когда использовать

- Подключение нативных DOM‑событий к элементам без обёрток (например, кастомные скролл‑контейнеры, `contentEditable`).
- Сценарии, где обработчик часто меняется и важно **не** перевешивать слушатели на каждый рендер.
- Когда удобнее описать несколько событий одной картой (одним вызовом).

---

## Когда **не** использовать

- Если достаточно обычных React‑обработчиков (`onClick`, `onChange`) и не нужны нативные опции слушателя.
- Для событий документа/окна можно использовать `ref` на `document.body`/`window`, но часто удобнее специализированные хуки (`useWindowEvent`, и т.п.).

---

## Частые ошибки

1. **Передача обработчика напрямую как пропса**
   - Не пишите `onClick={handler}` на React‑элементе, ожидая тип `MouseEvent` DOM. React‑синтетика и нативные события различаются; данный хук работает с **нативными** событиями через `addEventListener`.

2. **Потерянный `ref` в формах с автoref**
   - Не забудьте привязать возвращённый `ref` к элементу: `<div ref={ref} />`. Иначе слушатели не будут навешены.

3. **Случайная смена опций**
   - Изменение `capture`/`once`/`passive` приводит к перевешиванию слушателей. Убедитесь, что это ожидаемо.

4. **Использование `signal`**
   - Параметр `signal` в опциях не поддерживается этим API; при необходимости отмены используйте собственную логику.

---

## Типизация

**Экспортируемые типы**

- `UseDOMEventHandler<EventType>`
   - `(event: UseDOMEventInstance<EventType>) => void` — типобезопасный обработчик; тип события выводится из имени (`'click'` → `MouseEvent`, `'keydown'` → `KeyboardEvent`).

- `UseDOMEventInstance<EventType>`
   - Соответствующий объект события из `GlobalEventHandlersEventMap[EventType]`.

- `UseDOMEventMap`
   - Сопоставление `{ [type]: handler | [handler, options] }` для навешивания нескольких событий одним вызовом.

- `UseDOMEventOptions`
   - Опции слушателя без `signal`: `{ capture?: boolean; once?: boolean; passive?: boolean }`.

- `UseDOMEventType`
   - Объединение всех ключей `GlobalEventHandlersEventMap` (например, `'click'`, `'keydown'`).

---

## Смотрите также

- [useOutsideEvent](useOutsideEvent.md)
- [useWindowEvent](useWindowEvent.md)
