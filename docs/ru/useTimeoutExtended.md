# `useTimeoutExtended`

## Описание

Хук `useTimeoutExtended` предоставляет полностью **контролируемый таймер** с методами управления (`start`, `restart`, `cancel`) и состоянием (`isPending`, `isDone`).

Таймер **никогда не запускается автоматически** — его всегда нужно запускать вручную.

Если нужен простой автоматический одноразовый таймер, рекомендуется использовать хук `useTimeout`.

---

## Сигнатура

```ts
// Вариант 1: с дефолтной задержкой
function useTimeoutExtended(
  callback: UseTimeoutExtendedCallback,
  delayMs: number,
): UseTimeoutExtendedReturn;

// Вариант 2: без дефолтной задержки
function useTimeoutExtended(
  callback: UseTimeoutExtendedCallback,
): UseTimeoutExtendedReturn<true>;
```

- **Параметры**
   - `callback` — функция, вызываемая после завершения таймера. Получает фактическое время выполнения (мс).
   - `delayMs` *(опционально)* — дефолтная длительность таймера. Используется при запуске без указания override‑значения.

- **Возвращает**
   - Объект‑структуру, включающую:
     - Методы:
        - `start(overrideDelayMs?)` — запускает или перезапускает таймер. Если передать аргумент, используется override‑длительность и она **игнорирует последующие изменения `delayMs`**.
        - `restart(overrideDelayMs?)` — алиас `start` для читаемости.
        - `cancel()` — отменяет активный таймер.
     - Состояние:
        - `isPending` — таймер активен.
        - `isDone` — таймер завершён.

---

## Поведение

1. Хук не запускает таймер автоматически.
2. При вызове `start()` или `restart()`:
   - если передан `overrideDelayMs`, используется эта длительность и будущие изменения `delayMs` игнорируются;
   - если аргумент не передан, используется текущее значение `delayMs` и при изменении `delayMs` таймер будет **автоматически пересчитан**, чтобы суммарная длительность соответствовала новому значению.
3. `cancel()` сбрасывает состояние и отменяет выполнение колбэка.
4. При размонтировании компонента активный таймер автоматически очищается.

---

## Примеры

### 1) С дефолтной задержкой

```tsx
import { useTimeoutExtended } from '@webeach/react-hooks/useTimeoutExtended';

function Example() {
  const { start, cancel, isPending, isDone } = useTimeoutExtended((elapsed) => {
    console.log(`Прошло ${elapsed} мс`);
  }, 1000);

  return (
    <div>
      <button onClick={() => start()}>Старт (1с)</button>
      <button onClick={() => start(2000)}>Старт с override (2с)</button>
      <button onClick={cancel}>Отмена</button>
      <p>
        {isPending && 'Таймер активен...'}
        {isDone && 'Готово!'}
      </p>
    </div>
  );
}
```

### 2) Без дефолтной задержки

```tsx
import { useTimeoutExtended } from '@webeach/react-hooks/useTimeoutExtended';

function Example() {
  const { start } = useTimeoutExtended((elapsed) => {
    alert(`Таймер завершился за ${elapsed} мс`);
  });

  return <button onClick={() => start(500)}>Старт на 500 мс</button>;
}
```

---

## Когда использовать

- Нужен **полный контроль** над запуском, перезапуском и отменой таймера.
- Нужно учитывать изменение задержки «на лету» с перерасчётом оставшегося времени.
- Важно различать состояния `isPending` и `isDone`.

---

## Когда не использовать

- Если нужен простой таймер «fire‑and‑forget» без ручного управления — используйте `useTimeout`.
- Если требуется **периодическое** выполнение — используйте `useLoop`.
- Если нужно запускать несколько таймеров одновременно, лучше написать менеджер или использовать пул.

---

## Частые ошибки

- Ожидание, что таймер стартует автоматически — на самом деле нужно явно вызвать `start()`.
- Изменение `delayMs` не влияет на активный таймер, если он был запущен с `overrideDelayMs`.
- `isDone` и `isPending` обновляются только если они реально используются (ленивое обновление).

---

## Типизация

- **Экспортируемые типы**
   - `UseTimeoutExtendedCallback` — функция: `(actualTime: number) => void`.
   - `UseTimeoutExtendedReturn<RequiredMsArg = false>` — объект методов и состояния.

---

## Смотрите также

- [useFrame](useFrame.md)
- [useFrameExtended](useFrameExtended.md)
- [useLoop](useLoop.md)
- [useTimeout](useTimeout.md)
