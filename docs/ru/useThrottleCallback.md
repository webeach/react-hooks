# `useThrottleCallback`

## Описание

`useThrottleCallback` возвращает **троттлированную** функцию, которая ограничивает частоту вызова `callback` окном в `delayMs` миллисекунд.

Семантика по умолчанию — **leading + trailing**:
- **leading**: первый вызов после «тишины» выполняется **сразу**;
- **trailing**: дальнейшие вызовы внутри окна не исполняют `callback` немедленно, но **один** отложенный вызов будет выполнен в конце окна с **последними** аргументами.

— стабильная ссылка на функцию;  
— всегда использует **актуальный** `callback` и `delayMs`;  
— автоматически очищает отложенный вызов при размонтировании.

---

## Сигнатура

```ts
function useThrottleCallback<Args extends any[]>(
  callback: (...args: Args) => unknown,
  delayMs: number,
): (...args: Args) => void;
```

**Параметры**
- `callback` — функция, которую нужно «затроттлить». Может выполняться сразу (leading) или один раз по завершении окна (trailing) с последними аргументами.
- `delayMs` — минимальный интервал (мс) между последовательными выполнениями.

**Возвращает**
- Троттлированную функцию `(...args) => void` со **стабильной** идентичностью.

---

## Поведение (коротко)

1. Первый вызов после паузы выполняет `callback` **немедленно**.
2. Повторные вызовы **внутри окна** схлопываются в **один** отложенный вызов в конце окна; берутся **последние аргументы**.
3. Изменение `delayMs` не влияет на уже запланированный отложенный вызов; новое значение применяется для **следующих** вызовов.
4. При размонтировании отложенный вызов автоматически **отменяется**.

---

## Примеры

### 1) Прокрутка: не чаще, чем раз в 100 мс

```tsx
import { useThrottleCallback } from '@webeach/react-hooks/useThrottleCallback';

export function ScrollHandler() {
  const onScrollThrottled = useThrottleCallback(() => {
    updateVisibleRegion();
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', onScrollThrottled);
    return () => window.removeEventListener('scroll', onScrollThrottled);
  }, [onScrollThrottled]);

  return null;
}
```

### 2) Resize/мерки: использовать последние значения

```tsx
import { useThrottleCallback } from '@webeach/react-hooks/useThrottleCallback';

export function LayoutObserver({ container }: { container: HTMLElement }) {
  const recompute = useThrottleCallback((width: number) => {
    doLayout(width);
  }, 200);

  useEffect(() => {
    const handler = () => recompute(container.offsetWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [recompute, container]);

  return null;
}
```

### 3) Динамическая смена задержки

```tsx
import { useThrottleCallback } from '@webeach/react-hooks/useThrottleCallback';

export function AdjustableThrottle() {
  const [delay, setDelay] = useState(500);
  const send = useThrottleCallback((payload: unknown) => {
    post('/analytics', payload);
  }, delay);

  // Новое значение `delay` применяется к последующим вызовам
  return (
    <>
      <button onClick={() => setDelay((d) => (d === 500 ? 200 : 500))}>
        Toggle delay
      </button>
      <button onClick={() => send({ ts: Date.now() })}>Send</button>
    </>
  );
}
```

---

## Когда использовать

- Ограничить частоту дорогих операций: пересчёты, сетевые запросы, обработка скролла/ресайза.
- Нужен быстрый **первый** отклик и возможный **один** вызов по окончании окна.
- Требуется стабильная ссылка обработчика (для подписок и зависимостей эффектов).

## Когда не использовать

- Нужен ровно один вызов после «затишья» — используйте `useDebounceCallback`.
- Нужен «leading‑only» или «trailing‑only» режим — текущая реализация делает leading + trailing; выделенные режимы потребуют модификации.
- Нужен фиксированный периодический запуск — подойдёт `useLoop`.

---

## Частые ошибки

- Ожидать несколько trailing‑вызовов в одном окне — будет максимум **один**.
- Думать, что смена `delayMs` ускорит уже запланированный trailing — нет; сработает по старому окну.

---

## Смотрите также

- [useCallbackCompare](useCallbackCompare.md)
- [useDebounceCallback](useDebounceCallback.md)
- [useDebounceState](useDebounceState.md)
- [useThrottleState](useThrottleState.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
