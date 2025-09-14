# `useThrottleState`

## Описание

`useThrottleState` — состояние с **троттлинг‑сеттером** (leading + trailing).

- Первый вызов после «тихого периода» обновляет состояние **сразу** (leading).
- Все последующие вызовы **внутри окна** `delayMs` **схлопываются** в одно обновление в конце окна с **последним** значением (trailing).
- Ссылка на сеттер **стабильна** между рендерами (удобно для deps и подписок).
- Отложенное trailing‑обновление **очищается** при размонтировании.
- Изменение `delayMs` **не влияет** на уже запланированное trailing‑обновление; новый интервал применяется со **следующего** вызова сеттера.

---

## Сигнатура

```ts
// Вариант 1: только задержка, начальное значение — undefined
function useThrottleState<State = undefined>(
  delayMs: number,
): UseThrottleStateReturn<State | undefined>;

// Вариант 2: явное начальное значение
function useThrottleState<State>(
  initialState: State | (() => State),
  delayMs: number,
): UseThrottleStateReturn<State>;
```

**Параметры**
- `initialState` — начальное значение или ленивый инициализатор (опционально).
- `delayMs` — окно троттлинга в миллисекундах.

**Возвращает**
- Кортеж `[state, setThrottleState]`:
  - `state` — текущее значение состояния;
  - `setThrottleState(next)` — троттлинг‑сеттер (стабильная ссылка), принимает значение или функциональный апдейтер.

---

## Примеры

### 1) Поле ввода c «быстрым первым» и финализацией
```tsx
import { useThrottleState } from '@webeach/react-hooks/useThrottleState';

export function SearchBox() {
  const [query, setQuery] = useThrottleState('', 300);
  return (
    <input
      value={query ?? ''}
      onChange={(e) => setQuery(e.currentTarget.value)}
      placeholder="Поиск…"
    />
  );
}
```

### 2) Частые события (resize/scroll/drag)
```tsx
const [pos, setPos] = useThrottleState({ x: 0, y: 0 }, 100);

useEffect(() => {
  const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
  window.addEventListener('mousemove', onMove);
  return () => window.removeEventListener('mousemove', onMove);
}, []);
```

### 3) Функциональные обновления
```tsx
const [count, setCount] = useThrottleState(0, 250);

// первая попытка после простоя сразу применит +1,
// все последующие клики в течение окна схлопнутся в одно финальное +1
<button onClick={() => setCount((x) => x + 1)}>+1 (throttled)</button>
```

### 4) Регулируемый интервал
```tsx
const [delay, setDelay] = useState(300);
const [text, setText] = useThrottleState('', delay);
// новая задержка подействует со следующего вызова setText
```

---

## Поведение (коротко)

1. **Leading + trailing**: первая запись мгновенная; последняя запись за окно — в конце окна.
2. **Coalescing**: вызовы внутри окна объединяются; берётся **последнее** значение/апдейтер.
3. **Функции‑апдейтеры** поддерживаются; «побеждает» **последняя** функция.
4. **Stable setter**: ссылка на `setThrottleState` не меняется между рендерами.
5. **Unmount‑safe**: отложенные обновления очищаются при анмаунте.
6. **Смена `delayMs`**: не влияет на уже запланированное обновление.

---

## Когда использовать

- Высокочастотные источники: `mousemove`, `scroll`, `resize`, drag, input‑потоки.
- Нужен «быстрый отклик» и одна финализация значением «как получилось в конце».
- Ограничение частоты дорогостоящих пересчётов/запросов без потери отзывчивости.

## Когда **не** использовать

- Нужен «только последнее» после паузы — берите `useDebounceState`.
- Нужен строгий интервал тикания — используйте таймер/петлю.
- Нужен режим без trailing или с другим комбинированием — используйте низкоуровневый `useThrottleCallback`.

---

## Типизация

**Экспортируемые типы**

- `UseThrottleStateSetAction<State>`
   - Прямое значение: `State`.
   - Или функциональный апдейтер: `(prev: State) => State`.

- `UseThrottleStateDispatch<State>`
   - Сеттер состояния с троттлингом: `(action: UseThrottleStateSetAction<State>) => void`.

- `UseThrottleStateReturn<State>`
   - Кортеж: `[state: State, setThrottleState: UseThrottleStateDispatch<State>]`.


---

## Смотрите также

- [useCallbackCompare](useCallbackCompare.md)
- [useDebounceCallback](useDebounceCallback.md)
- [useDebounceState](useDebounceState.md)
- [useThrottleCallback](useThrottleCallback.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
