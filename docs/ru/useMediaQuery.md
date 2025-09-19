# `useMediaQuery`

## Описание

`useMediaQuery` — хук для подписки на **CSS media queries** из React. Возвращает булево значение, указывающее, соответствует ли текущее окно указанным условиям.

Поддерживает разные формы вызова: один или несколько правил, с явным или неявным указанием типа (`all`, `screen`, `print`).

---

## Сигнатура

```ts
// Перегрузка 1: одно правило с типом по умолчанию "all"
function useMediaQuery(rule: UseMediaQueryRule): UseMediaQueryReturn;

// Перегрузка 2: несколько правил (OR) с типом по умолчанию "all"
function useMediaQuery(rules: ReadonlyArray<UseMediaQueryRule>): UseMediaQueryReturn;

// Перегрузка 3: явный тип + одно правило
function useMediaQuery(type: UseMediaQueryType, rule: UseMediaQueryRule): UseMediaQueryReturn;

// Перегрузка 4: явный тип + несколько правил (OR)
function useMediaQuery(type: UseMediaQueryType, rules: ReadonlyArray<UseMediaQueryRule>): UseMediaQueryReturn;
```

- **Параметры**
   - `type?: UseMediaQueryType` — тип медиа-запроса (`all`, `screen`, `print`). По умолчанию — `all`.
   - `rule | rules` — объект(ы) условий `UseMediaQueryRule` (например, `minWidth`, `orientation`, `prefersColorScheme`).

- **Возвращает**: `UseMediaQueryReturn` — кортеж `[isMatch: boolean]`, где `isMatch` отражает текущее состояние.

---

## Примеры

### 1) Один медиа-запрос

```tsx
import { useMediaQuery } from '@webeach/react-hooks/useMediaQuery';

export function Layout() {
  const [isLargeScreen] = useMediaQuery({ minWidth: 1024 });

  return <div>{isLargeScreen ? 'Desktop' : 'Mobile'}</div>;
}
```

### 2) Несколько правил (OR)

```tsx
import { useMediaQuery } from '@webeach/react-hooks/useMediaQuery';

export function Responsive() {
  const [isMobileOrLandscape] = useMediaQuery([
    { maxWidth: 600 },
    { orientation: 'landscape' },
  ]);

  return <div>{isMobileOrLandscape ? 'Compact view' : 'Full view'}</div>;
}
```

### 3) Явный тип

```tsx
import { useMediaQuery } from '@webeach/react-hooks/useMediaQuery';

export function PrintLayout() {
  const [isPrintReady] = useMediaQuery('print', { orientation: 'portrait' });

  return <div>{isPrintReady ? 'Portrait print layout' : 'Other'}</div>;
}
```

### 4) Несколько условий в одном правиле (AND)

```tsx
import { useMediaQuery } from '@webeach/react-hooks/useMediaQuery';

export function DesktopLandscape() {
  const [isDesktopLandscape] = useMediaQuery({
    minWidth: 1024,
    orientation: 'landscape',
  });

  return <div>{isDesktopLandscape ? 'Wide desktop' : 'Other'}</div>;
}
```

---

## Поведение

1. **Комбинация правил**
   - Если передан массив правил, они объединяются через запятую (`query1, query2`), что соответствует OR-логике.
   - Если передано одно правило с несколькими свойствами, они объединяются через `and` (AND-логика).

2. **SSR-совместимость**
   - На сервере всегда возвращается `[false]`, без попытки доступа к `window`.

---

## Когда использовать

- Для адаптивных компонентов (мобильная/десктопная верстка).
- Для включения/выключения UI-функций по пользовательским настройкам (`prefers-reduced-motion`, `prefers-color-scheme`).
- Для условного рендера при печати (`print`).

---

## Когда **не** использовать

- Если нужна сложная логика резайза или вычисления размеров элемента — лучше `useResizeObserver.
- Если нужно лишь единоразово проверить ширину — проще использовать `window.innerWidth`.

---

## Частые ошибки

1. **Ожидание AND-логики в массиве**
   - Передача массива работает как OR, а не AND. Для AND-комбинаций объединяйте правила в один объект.

2. **Неверное использование в SSR**
   - На сервере результат всегда `false`. Не завязывайтесь на него без fallback.

3. **Игнорирование единиц измерения**
   - `minWidth` и `maxWidth` всегда интерпретируются в `px`, `minResolution`/`maxResolution` — в `dppx`.

---

## Типизация

**Экспортируемые типы**

- `UseMediaQueryReturn`
   - Кортеж `[isMatch: boolean]`.

- `UseMediaQueryRule`
   - Объект условий: `minWidth`, `maxWidth`, `orientation`, `prefersColorScheme` и др.

- `UseMediaQueryType`
   - Тип медиа-запроса: `'all' | 'screen' | 'print'`.

---

## Смотрите также

- [useResizeObserver](useResizeObserver.md)
