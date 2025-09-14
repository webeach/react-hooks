# `useDebounceCallback`

## Описание

`useDebounceCallback` возвращает **дебаунс‑функцию**, которая откладывает вызов переданного `callback` до тех пор, пока после **последнего** вызова не пройдёт `delayMs` миллисекунд. Подходит для «шумных» событий (ввод, ресайз, скролл), когда нужно вызвать логику **один раз** с **последними** аргументами.

— стабильная ссылка на функцию (её безопасно передавать как обработчик);
— использует **актуальную** версию `callback` на момент срабатывания;
— автоматически очищает таймер при размонтировании (никаких «поздних» вызовов).

---

## Сигнатура

```ts
function useDebounceCallback<Args extends any[]>(
  callback: (...args: Args) => unknown,
  delayMs: number,
): (...args: Args) => void;
```

**Параметры**
- `callback` — функция, которую нужно «задебаунсить». Будет вызвана с **последними** переданными аргументами.
- `delayMs` — задержка в миллисекундах.

**Возвращает**
- Дебаунс‑функцию `(...args) => void` со **стабильной** идентичностью.

---

## Поведение (коротко)

1. Каждый новый вызов **перезапускает** таймер; выполняется **один** вызов по истечении `delayMs` с **последними** аргументами.
2. Изменение `delayMs` само по себе **не влияет** на уже запланированный вызов; новое значение применяется при **следующем** вызове дебаунс‑функции.
3. При размонтировании таймер очищается — отложенный вызов **не** произойдёт.
4. Ссылка на возвращаемую функцию стабильна между рендерами; внутри она использует **текущий** `callback`.

---

## Примеры

### 1) Поиск по вводу

```tsx
import { useDebounceCallback } from '@webeach/react-hooks/useDebounceCallback';

export function SearchBox() {
  const [query, setQuery] = useState('');

  const request = useDebounceCallback((q: string) => {
    fetch(`/api/search?q=${encodeURIComponent(q)}`);
  }, 300);

  return (
    <input
      value={query}
      onChange={(event) => {
        const value = event.currentTarget.value;
        setQuery(value);
        request(value);
      }}
      placeholder="Поиск..."
    />
  );
}
```

### 2) Ресайз: пересчёт макета не чаще, чем раз в N мс

```tsx
import { useDebounceCallback } from '@webeach/react-hooks/useDebounceCallback';

export function LayoutObserver() {
  const recompute = useDebounceCallback(() => {
    // тяжёлая работа
  }, 200);

  useEffect(() => {
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [recompute]);

  return null;
}
```

### 3) Смена задержки на лету

```tsx
import { useDebounceCallback } from '@webeach/react-hooks/useDebounceCallback';

export function AdjustableDelay() {
  const [delay, setDelay] = useState(500);
  const debouncedLog = useDebounceCallback((value: string) => console.log(value), delay);

  // Новая задержка применится к СЛЕДУЮЩЕМУ вызову
  return (
    <>
      <input onChange={(event) => debouncedLog(event.currentTarget.value)} />
      <button onClick={() => setDelay((d) => (d === 500 ? 1000 : 500))}>
        Toggle delay
      </button>
    </>
  );
}
```

---

## Когда использовать

- «Шумные» события, где важен **последний** ввод: поиск, автокомплит, фильтры.
- Сглаживание быстрых последовательных вызовов: пересчёт размеров, синхронизация в сеть.
- Нужно сократить число повторных/дорогих операций.

## Когда не использовать

- Нужен первый быстрый вызов с ограничением частоты — используйте **useThrottle**.
- Нужны и «leading», и «trailing» режимы — текущая версия реализует только trailing.

---

## Частые ошибки

- Ожидать вызов через `delayMs` после **первого** вызова — дебаунс ждёт `delayMs` после **последнего**.
- Считать, что изменение `delayMs` влияет на уже запланированный вызов — нет; нужно вызвать дебаунс‑функцию ещё раз.

---

## Смотрите также

- [useCallbackCompare](useCallbackCompare.md)
- [useDebounceState](useDebounceState.md)
- [useThrottleCallback](useThrottleCallback.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
