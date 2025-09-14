# `useDebounceState`

## Описание

`useDebounceState` — это состояние с дебаунс‑сеттером. Каждое новое присваивание откладывает обновление на `delayMs` миллисекунд и схлопывает серию быстрых вызовов в один — с последним значением (trailing debounce).

— стабильная ссылка на сеттер;
— использует актуальные значения при выполнении;
— автоматически очищает отложенное обновление при размонтировании.

---

## Сигнатура

```ts
// Вариант 1: только задержка, начальное значение — undefined
function useDebounceState<State = undefined>(
  delayMs: number,
): UseDebounceStateReturn<State | undefined>;

// Вариант 2: явное начальное значение
function useDebounceState<State>(
  initialState: State | (() => State),
  delayMs: number,
): UseDebounceStateReturn<State>;
```

**Параметры**
- `initialState` — начальное значение или ленивый инициализатор (опционально).
- `delayMs` — задержка обновления в миллисекундах.

**Возвращает**
- Кортеж `[state, setDebounceState]`:
   - `state` — текущее значение состояния;
   - `setDebounceState(next)` — дебаунс‑сеттер (стабильная ссылка).

---

## Поведение (коротко)

1. Каждый новый вызов `setDebounceState` перезапускает ожидание; в итоге выполняется одно обновление с последним значением.
2. Функциональные обновления поддерживаются: `setDebounceState(prev => next)`; при серии победит последняя функция.
3. Смена `delayMs` не влияет на уже запланированное обновление; новое значение применяется при следующем вызове сеттера.
4. Ссылка на сеттер стабильна между рендерами; можно безопасно использовать в deps и подписках.
5. При размонтировании отложенное обновление очищается (никаких поздних записей).

---

## Примеры

### 1) Поле ввода с отложенной синхронизацией

```tsx
import { useDebounceState } from '@webeach/react-hooks/useDebounceState';

export function SearchBox() {
  const [query, setQuery] = useDebounceState('', 300);
  return (
    <input
      value={query ?? ''}
      onChange={(event) => setQuery(event.currentTarget.value)}
      placeholder="Поиск..."
    />
  );
}
```

### 2) Функциональные обновления

```tsx
import { useDebounceState } from '@webeach/react-hooks/useDebounceState';

export function Counter() {
  const [count, setCount] = useDebounceState(0, 200);
  return (
    <button onClick={() => setCount((x) => x + 1)}>+1 (debounced)</button>
  );
}
```

### 3) Регулируемая задержка

```tsx
import { useDebounceState } from '@webeach/react-hooks/useDebounceState';

export function Adjustable() {
  const [delay, setDelay] = useState(500);
  const [text, setText] = useDebounceState('', delay);
  // Новая задержка вступает в силу со следующего вызова setText
  return (
    <>
      <input onChange={(e) => setText(e.currentTarget.value)} />
      <button onClick={() => setDelay((d) => (d === 500 ? 1000 : 500))}>
        Toggle delay
      </button>
      <div>Value: {text}</div>
    </>
  );
}
```

---

## Когда использовать

- «Шумные» источники изменений: ввод текста, перетаскивания, слайдеры.
- Нужно уменьшить количество дорогих пересчётов/запросов и брать последнее значение.
- Нужен простой API «как useState, но с задержкой».

## Когда не использовать

- Нужен «первый быстрый вызов» с ограничением частоты — используйте `useThrottleState`.
- Требуются режимы leading/leading+trailing — текущая реализация делает только trailing.
- Нужна строгая периодичность — используйте `useLoop`.

---

## Частые ошибки

- Ожидать обновление через `delayMs` после первого вызова — дебаунс ждёт тихий период после последнего.
- Думать, что смена `delayMs` сразу ускорит/замедлит уже поставленное обновление — нет; нужно вызвать сеттер снова.

---

## Типизация

**Экспортируемые типы**

- `UseDebounceStateSetAction<State>`
   - Либо прямое значение `State`.
   - Либо функциональный апдейтер: `(prev: State) => State`.

- `UseDebounceStateDispatch<State>`
   - Сеттер состояния с дебаунсом: `(action: UseDebounceStateSetAction<State>) => void`.

- `UseDebounceStateReturn<State>`
   - Кортеж: `[state: State, setDebounceState: UseDebounceStateDispatch<State>]`.

---

## Смотрите также

- [useDebounceCallback](useDebounceCallback.md)
- [usePatchDeepState](usePatchDeepState.md)
- [usePatchState](usePatchState.md)
- [useThrottleState](useThrottleState.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
