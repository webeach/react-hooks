# `useRefEffect`

## Описание

`useRefEffect` — хук, который **запускает обработчик, когда `ref.current` становится ненулевым** (появился DOM‑элемент/инстанс) и повторно вызывает его при **смене ссылки** или при изменении переданных зависимостей/сравниваемого значения. Обработчик может вернуть функцию очистки — она вызовется при смене элемента или размонтировании.

Хук использует сравнение зависимостей через `useDeps`, поэтому может работать и с **динамическими массивами зависимостей** (не требуется фиксированная длина), а также с **кастомной функцией сравнения**.

---

## Сигнатура

```ts
// 1) Только ref
function useRefEffect<RefValue>(
  ref: React.RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
): void;

// 2) ref + массив зависимостей (shallow ===, допускает динамическую длину)
function useRefEffect<RefValue>(
  ref: React.RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
  deps: unknown[],
): void;

// 3) ref + compare(prev, next) + comparedValue
function useRefEffect<RefValue, ComparedValue>(
  ref: React.RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
  compare: (prev: ComparedValue, next: ComparedValue) => boolean,
  comparedValue: ComparedValue,
): void;

// 4) ref + compare() (управляете сравнением вручную)
function useRefEffect<RefValue>(
  ref: React.RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
  compare: () => boolean,
): void;
```

- **Параметры**
   - `ref` — наблюдаемый `ref`; обработчик запустится, когда `ref.current` станет не `null/undefined`.
   - `handler(current)` — функция, получающая актуальное значение `ref.current`; может вернуть `cleanup`.
   - `deps` | `compare` | `comparedValue` — опциональные триггеры повторного вызова обработчика.

- **Возвращает**: `void`.

---

## Примеры

### 1) Фокус инпута при появлении

```tsx
import { useRef } from 'react';
import { useRefEffect } from '@webeach/react-hooks/useRefEffect';

export function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useRefEffect(inputRef, (element) => {
    element.focus();
  });

  return <input ref={inputRef} />;
}
```

### 2) Повторный вызов при изменении зависимостей

```tsx
import { useRefEffect } from '@webeach/react-hooks/useRefEffect';

type ThemeBoxProps = {
  theme: 'light' | 'dark';
};

export function ThemedBox(props: ThemeBoxProps) {
  const { theme } = props;
  
  const boxRef = useRef<HTMLDivElement>(null);

  useRefEffect(boxRef, (element) => {
    element.dataset.theme = theme;

    return () => {
      delete element.dataset.theme;
    };
  }, [theme]);

  return <div ref={boxRef} />;
}
```

### 3) Кастомное сравнение: реагируем только на смену `user.id`

```tsx
import { useRefEffect } from '@webeach/react-hooks/useRefEffect';

type User = {
  id: string;
  name: string
};

type UserBadgeProps = {
  user: User;
};

export function UserBadge(props: UserBadgeProps) {
  const { user } = props;
  
  const ref = useRef<HTMLDivElement>(null);

  useRefEffect(ref, (element) => {
    element.textContent = `User: ${user.name}`;
  }, (prev, next) => prev.id === next.id, user);

  return <div ref={ref} />;
}
```

---

## Поведение

1. **Триггеры запуска**
   - При маунте обработчик вызывается **сразу**, если `ref.current` уже не `null/undefined`.
   - Далее обработчик перевызывается при **смене ссылки** в `ref.current` либо при срабатывании переданных зависимостей (`deps` / `compare`).

2. **Очистка**
   - Если обработчик вернул `cleanup`, он вызовется **перед** следующим запуском обработчика и при размонтировании.

3. **Динамические зависимости**
   - При передаче `deps: unknown[]` сравнение выполняется поэлементно (`===`) и **не требует фиксированной длины** — массив может меняться между рендерами.

4. **Кастомное сравнение**
   - Вместо `deps` можно передать `compare(prev, next)` и `comparedValue` — обработчик перезапустится, когда `compare(prev, next)` вернёт `false`.
   - В продвинутом варианте можно передать только `compare()` и управлять условием вручную.

5. **Стабильность обработчика**
   - Хук читает **последнюю** версию `handler` через «живой» ref, поэтому нет необходимости оборачивать его в `useCallback` или добавлять в зависимости.

6. **Поведение при одинаковом элементе**
   - Если в `ref.current` повторно записан **тот же** объект, обработчик не перезапускается. Чтобы форсировать перезапуск, используйте `deps`/`compare`.

7. **Планирование вызова**
   - Смена `ref.current` обрабатывается с помощью `requestAnimationFrame`, что помогает избежать лишних layout‑попаданий. Первичный вызов при маунте — синхронный.

8. **SSR‑безопасность**
   - Используется изоморфный layout‑эффект; на сервере побочных действий нет.

---

## Когда использовать

- Подписки/инициализация на **конкретном DOM‑узле**: фокус, Resize/IntersectionObserver, сторонние виджеты, позиционирование.
- Императивные операции, которые должны запускаться при **смене элемента** в `ref`.
- Точные перезапуски по **кастомному условию** через `compare`.

---

## Когда **не** использовать

- Когда нужна обычная реакция на изменение **значений** без привязки к `ref` — подойдёт `useEffect`/`useEffectCompare`.
- Когда требуется синхронный вызов **на каждую** запись в `ref.current` без кадрирования — пишите свою обёртку, т.к. после маунта изменения обрабатываются с `requestAnimationFrame`.

---

## Частые ошибки

1. **Ожидание вызова при `null`**
   - Обработчик **не** вызывается, когда `ref.current` становится `null/undefined`; в этот момент вызывается только `cleanup`.

2. **Надежда на перезапуск при повторной записи того же элемента**
   - Перезапуска не будет; используйте `deps`/`compare`, если нужно форсировать.

3. **Сложные динамические `deps` без понимания сравнения**
   - Помните, сравнение — по индексам и `===`. Для более тонкого контроля используйте форму с `compare`.

---

## Типизация

**Экспортируемые типы**

- `UseRefEffectHandler<RefValue>`
   - Обработчик эффекта для значения рефа: `(current: RefValue) => void | (() => void)`.
   - Может вернуть функцию очистки, аналогично `useEffect`.)

---

## Смотрите также

- [useEffectCompare](useEffectCompare.md)
- [useIsomorphicLayoutEffect](useIsomorphicLayoutEffect.md)
- [useLayoutEffectCompare](useLayoutEffectCompare.md)
- [useRefEffect](useRefEffect.md)
- [useUnmount](useUnmount.md)
