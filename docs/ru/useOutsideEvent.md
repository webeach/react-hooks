# `useOutsideEvent`

## Описание

`useOutsideEvent` — хук, который подписывается на событие **на уровне `document`** и вызывает обработчик **только если событие произошло вне** переданного элемента (`ref`). Подходит для закрытия модалок/дропдаунов по клику снаружи, обработки «наружных» `mousedown`/`touchstart` и т.п.

---

## Сигнатура

```ts
function useOutsideEvent<
  ElementType extends HTMLElement,
  EventType extends UseOutsideEventType,
>(
  ref: RefObject<ElementType | null>,
  eventType: EventType,
  handler: UseOutsideEventHandler<EventType>,
): void;
```

- **Параметры**
   - `ref` — ссылка на целевой DOM‑элемент, для которого нужно детектировать «внешние» события.
   - `eventType` — тип DOM‑события, например `'click' | 'mousedown' | 'pointerdown' | 'touchstart'` и т.д.
   - `handler` — колбэк, вызываемый **только когда событие произошло вне** `ref.current`.

- **Возвращает**: `void`.

---

## Примеры

### 1) Закрытие дропдауна кликом снаружи
```tsx
const ref = useRef<HTMLDivElement>(null);
const [open, setOpen] = useState(false);

useOutsideEvent(ref, 'click', () => setOpen(false));

return (
  <div>
    <button onClick={() => setOpen((v) => !v)}>Toggle</button>
    {open && (
      <div ref={ref} role="menu"> ... </div>
    )}
  </div>
);
```

### 2) Реакция на «ранние» взаимодействия
```tsx
// Сработает во время нажатия, ещё до click
useOutsideEvent(ref, 'mousedown', onOutsidePress);
// На сенсорных — аналогично
useOutsideEvent(ref, 'touchstart', onOutsideTouch);
```

### 3) Несколько типов событий
```tsx
useOutsideEvent(ref, 'pointerdown', onOutside);
useOutsideEvent(ref, 'keydown', (e) => {
  if (e.key === 'Escape') onOutside(e);
});
```

---

## Поведение

1. **Внешность события**
   - Событие считается «внешним», если `!element.contains(event.target as Element)`.

2. **Подписка/очистка**
   - Подписка происходит на `document` при маунте/когда `ref.current` установлен.
   - Очистка выполняется при размонтировании и при смене `eventType`.

3. **Актуальный обработчик**
   - Через `useLiveRef` вызывается **последняя** версия `handler` (без повторной подписки при его изменениях).

4. **Зависимости**
   - Переподписка происходит при смене `eventType`. Смена `handler` не триггерит переподписку.

5. **SSR‑безопасность**
   - Сайд‑эффект выполняется только в браузере (в рамках `useEffect`/`useRefEffect`).

---

## Когда использовать

- Закрытие поповеров/дропдаунов/меню кликом снаружи.
- Блокировка взаимодействий вне конкретной области.
- Отмена жестов/действий при клике вне компонента.

## Когда **не** использовать

- Если оверлей/контент отрисован через **портал**, который логически относится к виджету, но вне DOM‑дерева элемента — `contains` вернёт `false`, и событие будет считаться «внешним». В таких случаях используйте общий контейнер‑`ref` либо собственную логику.
- Если нужно ловить события **только внутри** элемента — используйте обычные обработчики на самом элементе.

---

## Частые ошибки

1. **`ref.current` равен `null`**
   - Подписка не произойдёт, пока элемент не смонтирован. Убедитесь, что `ref` прикреплён к нужному узлу.

2. **Неподходящий тип события**
   - `click` срабатывает позже, чем `mousedown`/`pointerdown`. Для моментальной реакции выбирайте «down»‑события.

3. **Остановка всплытия**
   - Если внутри элемента вызывается `event.stopPropagation()`, событие всё равно всплывёт до `document`? Нет — оно будет остановлено и до обработчика не дойдёт. Проверьте обработчики внутри.

4. **Shadow DOM**
   - `contains` за пределами того же дерева теневого DOM может работать не так, как ожидается. При работе с Shadow DOM учитывайте композицию событий.

---

## Типизация

**Экспортируемые типы**

- `UseOutsideEventHandler<EventType extends UseOutsideEventType = UseOutsideEventType>`
   - Колбэк, вызываемый при срабатывании указанного DOM-события:  
    `(event: GlobalEventHandlersEventMap[EventType]) => void`.

- `UseOutsideEventType`
   - Объединение всех стандартных DOM-событий (`keyof GlobalEventHandlersEventMap`).
   - Ограничивает список событий, доступных для использования в `useOutsideEvent`.

---

## Смотрите также

- [useDOMEvent](useDOMEvent.md)
- [useWindowEvent](useWindowEvent.md)
