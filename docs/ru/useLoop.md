# `useLoop`

## Описание

`useLoop` — хук для периодического выполнения кода на базе одноразовых `setTimeout`. Поддерживает **паузы/продолжение**, **ручной** и **автоматический** режимы, аккуратно работает со временем (использует `performance.now()`), и умеет учитывать/сбрасывать «остаток» при возобновлении.

Если нужен одноразовый таймер с расширенным управлением — см. `useTimeoutExtended`. Для простого разового запуска — `useTimeout`.

---

## Сигнатура

```ts
// Перегрузка 1: фиксированная длительность
function useLoop(
  callback: UseLoopCallback,
  durationMs: number,
): UseLoopReturn;

// Перегрузка 2: полная конфигурация
function useLoop(
  callback: UseLoopCallback,
  options: UseLoopOptions,
): UseLoopReturn;
```

**Параметры**
- `callback` — вызывается на каждом тике. Получает `{ actualTime, resume }`:
   - `actualTime` — фактически прошедшее время (мс) за текущий интервал;
   - `resume()` — продолжить цикл (актуально при `manual: true`).
- `durationMs` — длительность одного интервала (мс) для краткой перегрузки.
- `options` — полная конфигурация (см. ниже).

**Возвращает**
- Управляющую функцию `run()` — запустить или продолжить цикл с текущими опциями.

> Возврат поддерживает кортеж/объект (через `useDemandStructure`), но внешне вы используете **одну функцию `run()`**.

---

## Опции (`UseLoopOptions`)

```ts
{
  /** автозапуск при маунте (по умолчанию false) */
  autorun?: boolean;
  /** внешняя пауза/возобновление (по умолчанию false) */
  disabled?: boolean;
  /** длительность одного интервала (мс) */
  durationMs: number;
  /** ручной режим: один тик и ожидание (по умолчанию false) */
  manual?: boolean;
  /** при возобновлении/смене длительности — сбрасывать остаток? (по умолчанию false) */
  resetElapsedOnResume?: boolean;
}
```

- **`manual: false`** — после каждого тика хук **сам перепланирует** следующий.
- **`manual: true`** — выполняется **один тик**, дальше пауза. Чтобы продолжить, вызовите `resume()` **внутри** `callback` или `run()` **снаружи**.
- **`disabled`** — переводит цикл в паузу; при возвращении в `false` цикл продолжится.
- **`resetElapsedOnResume`**:
   - `false` — продолжать с **оставшимся** временем текущего интервала;
   - `true` — следующий интервал начинается **с нуля** полной длительностью.

---

## Поведение

1. Каждый тик запускает следующий по правилам, заданным опциями (`manual`, `disabled`).
2. В `callback` приходит `actualTime` — это реальная длительность прошедшего интервала.
3. Пауза (`disabled: true`) останавливает текущий цикл. Возобновление продолжит либо с остатка, либо «с нуля» — зависит от `resetElapsedOnResume`.
4. Изменение `durationMs` применяется предсказуемо: либо учитывается текущий прогресс (если так настроено), либо начнёт действовать со следующего тика.
5. При размонтировании таймер корректно останавливается.

---

## Примеры

### 1) Базовый цикл, ручной запуск

```tsx
import { useLoop } from '@webeach/react-hooks/useLoop';

export function Example() {
  const [run] = useLoop(({ actualTime }) => {
    console.log('tick ~', actualTime, 'ms');
  }, 1000);

  return <button onClick={run}>Start</button>;
}
```

### 2) Автозапуск и автоматическое перепланирование

```tsx
import { useLoop } from '@webeach/react-hooks/useLoop';

export function Example() {
  const [run] = useLoop(({ actualTime }) => {
    // выполняется каждые ~500мс
  }, {
    durationMs: 500,
    autorun: true,
  });

  return <button onClick={run}>Restart</button>;
}
```

### 3) Ручной режим: по одному тику

```tsx
import { useLoop } from '@webeach/react-hooks/useLoop';

export function Example() {
  const [run] = useLoop(({ actualTime, resume }) => {
    doWork();
    if (shouldContinue()) {
      resume(); // продолжить следующий тик сразу из callback
    }
  }, {
    durationMs: 800,
    manual: true,
  });

  return <button onClick={run}>Tick</button>;
}
```

### 4) Пауза/продолжение извне

```tsx
import { useLoop } from '@webeach/react-hooks/useLoop';

export function Example() {
  const [paused, setPaused] = useState(false);
  const [run] = useLoop(() => {
    // ...
  }, {
    durationMs: 1000,
    autorun: true,
    disabled: paused,
  });

  return (
    <>
      <button onClick={() => setPaused(true)}>Pause</button>
      <button onClick={() => setPaused(false)}>Resume</button>
      <button onClick={run}>Restart</button>
    </>
  );
}
```

### 5) Смена длительности без сброса остатка

```tsx
import { useLoop } from '@webeach/react-hooks/useLoop';

export function Example() {
  const [ms, setMs] = useState(1000);
  const run = useLoop(() => {}, { durationMs: ms, autorun: true, resetElapsedOnResume: false });

  return (
    <>
      <button onClick={() => setMs(2000)}>Make 2s</button>
      <button onClick={run}>Restart</button>
    </>
  );
}
```

---

## Когда использовать

- Нужен **периодический** запуск логики с паузой/возобновлением.
- Важно учитывать **дрейф** (получать фактическое время тика `actualTime`).
- Требуется **ручной режим** (продолжение из `callback`).

## Когда не использовать

- Нужен один запуск через N мс — используйте `useTimeout` или `useTimeoutExtended`.
- Нужны тики «в кадр» — подойдёт хук `useFrame` или `useFrameExtended`.
- Нужно «догонять пропуски» пачкой — `useLoop` не делает catch‑up, он планирует по одному тика.

---

## Частые ошибки

- В `manual: true` цикл **не** продолжится сам — нужно вызвать `resume()` в `callback` или `run()` снаружи.
- `autorun` при `disabled: true` ничего не запустит, пока не снять `disabled`.
- При `resetElapsedOnResume: true` смена `durationMs` не влияет на **текущий** таймер — только на следующий.

---

## Типы

**Экспортируемым типы**

- `UseLoopCallback(options)` — `{ actualTime: number; resume: () => void }`.
- `UseLoopOptions` — см. опции выше.
- `UseLoopReturn` — наружу доступен `run()` (кортеж/объект — в зависимости от деструктуризации).

---

## Смотрите также

- [useFrame](useFrame.md)
- [useFrameExtended](useFrameExtended.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
