# `useToggle`

## Описание

`useToggle` — хук для управления булевым состоянием с единым методом `toggle`. Возвращает *гибридную* структуру, поддерживающую **кортежную** и **объектную** деструктуризацию.

Особенности `toggle`:
- без аргументов — **переключает** текущее значение `true ⇄ false`;
- с аргументом `true`/`false` — **принудительно устанавливает** переданное значение.

---

## Сигнатура

```ts
function useToggle(initialValue?: boolean): UseToggleReturn;
```

- **Параметры**
  - `initialValue?: boolean` — начальное значение; по умолчанию `false`.

- **Возвращает**: `UseToggleReturn` — гибридная структура с полями/позициями:
  - `value: boolean` — текущее значение;
  - `toggle(force?: boolean): void` — переключить значение или установить его принудительно;
  - кортежный доступ: `[value, toggle]`.

---

## Примеры

### 1) Базовое использование (кортеж)

```tsx
import { useToggle } from '@webeach/react-hooks/useToggle';

export function PasswordField() {
  const [visible, toggle] = useToggle(false);

  return (
    <label>
      <input type={visible ? 'text' : 'password'} />
      <button type="button" onClick={() => toggle()}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </label>
  );
}
```

### 2) Принудительная установка значения

```tsx
import { useToggle } from '@webeach/react-hooks/useToggle';

export function Filters() {
  const state = useToggle(true);

  return (
    <div>
      <button onClick={() => state.toggle(false)}>Disable</button>
      <button onClick={() => state.toggle(true)}>Enable</button>
      <button onClick={() => state.toggle()}>Toggle</button>
      <div>Enabled: {String(state.value)}</div>
    </div>
  );
}
```

### 3) Клавиатурное управление

```tsx
import { useEffect } from 'react';
import { useToggle } from '@webeach/react-hooks/useToggle';

export function KeyboardControlled() {
  const { value, toggle } = useToggle(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 't') toggle();      // переключить
      if (e.key === '1') toggle(true);  // включить
      if (e.key === '0') toggle(false); // выключить
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  return <div>Active: {String(value)}</div>;
}
```

---

## Поведение

1. **Простая модель состояния**
   - Хранит одно булево значение (`useState`).

2. **Мемоизированный экшен**
   - `toggle` мемоизирован через `useCallback` и стабилен между рендерами
   - Функция сохраняет ссылочную идентичность, поэтому её безопасно указывать в зависимостях эффектов (`useEffect`) и колбэков (`useCallback`)

3. **Гибридная структура**
   - Благодаря `useDemandStructure` доступен **оба** способа деструктуризации (кортеж и объект) без дублирования вычислений.

4. **Без побочных эффектов**
   - Хук безопасен для SSR/ISR; обращений к глобальным объектам нет.

---

## Когда использовать

- UI‑переключатели: показать/скрыть, включить/выключить, открыть/закрыть.
- Когда нужен один универсальный экшен `toggle(force?)` для переключения и принудительной установки.

---

## Когда **не** использовать

- Если требуется хранить больше, чем `true/false` (например, трёхсостоянный флаг) — используйте свой `useState` с перечислениями или специализированный хук.
- Если нужна сложная логика переходов между состояниями — рассматривайте `useReducer`.

---

## Частые ошибки

1. **Ожидание наличия `setTrue`/`setFalse`**
   - В этом хуке доступны только `value` и `toggle(force?)`. Для явных экшенов используйте `useBoolean`.

2. **Неправильные зависимости эффектов**
   - В эффектах указывайте `toggle`, а не `value`, если логика не зависит от самого значения.

3. **Передача `toggle` напрямую в обработчики событий**
   - Если использовать `onClick={toggle}`, объект события попадёт как аргумент `force`, что будет интерпретировано как «включить» (аналог `toggle(true)`). Это может неожиданно активировать состояние. Используйте обёртку: `onClick={() => toggle()}` либо явно задавайте значение: `onClick={() => toggle(false)}` / `onClick={() => toggle(true)}`.

---

## Типизация

**Экспортируемые типы**

- `UseToggleFunction`
   - Функция для обновления булевого состояния: `(force?: boolean) => void`.
     - Без аргументов — инвертирует текущее значение.
     - С `true` или `false` — устанавливает значение явно.

- `UseToggleReturn`
   - Гибрид: кортеж `[value, toggle]` **и** объект `{ value, toggle }`.

- `UseToggleReturnObject`
   - Объектная форма: `{ value: boolean; toggle: UseToggleFunction }`.

- `UseToggleReturnTuple`
   - Кортежная форма: `[value: boolean, toggle: UseToggleFunction]`.

---

## Смотрите также

- [useBoolean](useBoolean.md)
- [useControlled](useControlled.md)
- [useNumber](useNumber.md)
