# `useViewportBreakpoint`

## Описание

`useViewportBreakpoint` — React-хук для отслеживания брейкпоинтов (точек перелома) с помощью `window.matchMedia`.

- Преобразует карту брейкпоинтов в отсортированный список и создаёт для каждого `MediaQueryList` (с кешированием).
- Автоматически обновляет активный брейкпоинт при изменении ширины окна.
- Возвращает `matches` — объект со всеми брейкпоинтами и их состоянием (true/false) и `activeBreakpoint` — текущий активный брейкпоинт.
- Поддерживает `defaultBreakpoint` как запасной вариант, особенно полезный при SSR для предсказуемого значения до монтирования.
- Возвращаемая структура гибридная: доступна и как кортеж `[matches, activeBreakpoint]`, и как объект `{ matches, activeBreakpoint }`.

---

## Сигнатура

```ts
function useViewportBreakpoint<BreakpointKey extends string | symbol>(
  breakpointMap: Record<BreakpointKey, number>,
  options?: UseViewportBreakpointOptions<BreakpointKey>,
): UseViewportBreakpointReturn<BreakpointKey>;
```

- **Параметры**
   - `breakpointMap: Record<BreakpointKey, number>` — карта брейкпоинтов: ключ → минимальная ширина в пикселях.
   - `options?: UseViewportBreakpointOptions` — дополнительные настройки:
      - `defaultBreakpoint?: BreakpointKey` — запасной ключ, который считается активным, если ни один брейкпоинт не подходит.

- **Возвращает**: `UseViewportBreakpointReturn` — гибридная структура с кортежем и объектом:
   - `matches: Record<BreakpointKey, boolean>` — карта всех брейкпоинтов с их состоянием.
   - `activeBreakpoint: BreakpointKey | null` — активный брейкпоинт или `null`, если ни один не подходит.
   - Кортеж: `[matches, activeBreakpoint]`.

---

## Примеры

### 1) Базовое использование (кортеж)

```tsx
import { useViewportBreakpoint } from '@webeach/react-hooks/useViewportBreakpoint';

export function ResponsiveLayout() {
  const [matches, active] = useViewportBreakpoint({
    mobile: 0,
    tablet: 768,
    desktop: 1200,
  });

  return (
    <div>
      <p>Активный брейкпоинт: {String(active)}</p>
      {matches.mobile && <MobileMenu />}
      {matches.desktop && <DesktopNav />}
    </div>
  );
}
```

### 2) Именованный доступ (объект)

```tsx
import { useViewportBreakpoint } from '@webeach/react-hooks/useViewportBreakpoint';

export function Sidebar() {
  const { matches, activeBreakpoint } = useViewportBreakpoint({
    narrow: 0,
    wide: 1000,
  });

  return (
    <aside>
      <h2>Брейкпоинт: {String(activeBreakpoint)}</h2>
      {matches.narrow && <CollapsedSidebar />}
      {matches.wide && <ExpandedSidebar />}
    </aside>
  );
}
```

### 3) С запасным брейкпоинтом

```tsx
const { matches, activeBreakpoint } = useViewportBreakpoint(
  { sm: 0, md: 600, lg: 1200 },
  { defaultBreakpoint: 'sm' },
);

// Если ни один брейкпоинт не подходит, будет возвращён 'sm' (актуально в SSR).
```

---

## Поведение

1. **Сортировка брейкпоинтов**
   - Брейкпоинты сортируются по числовым значениям ширины (от меньшего к большему).
2. **Один активный брейкпоинт**
   - В каждый момент времени активен только один брейкпоинт (`activeBreakpoint`).
3. **SSR-безопасность**
   - На сервере возвращаются пустые значения, в браузере хук активируется корректно.
4. **Кэширование медиа-запросов**
   - Каждый `min-width` медиа-запрос кэшируется, чтобы избежать создания дубликатов `MediaQueryList`.
5. **Стабильная структура возврата**
   - Возвращаемый объект/кортеж стабилен благодаря `useDemandStructure`.
6. **Запасной брейкпоинт**
   - Если ни один медиа-запрос не совпал и указан `defaultBreakpoint`, он используется как активный брейкпоинт.
   - Особенно полезно при SSR, чтобы иметь предсказуемое значение ещё до монтирования в браузере.

---

## Когда использовать

- Для адаптивных интерфейсов, когда нужно знать активный брейкпоинт в React.
- Для условного рендера UI в зависимости от ширины окна.
- Для управления адаптивными компонентами (меню, сайдбары, сетки).

---

## Когда **не** использовать

- Если достаточно только CSS-медиа-запросов без участия JS.
- В особо производительных случаях с десятками слушателей — стоит оптимизировать.

---

## Частые ошибки

1. **Ожидание нескольких активных брейкпоинтов**
   - В один момент времени активен только один.
2. **Отсутствие запасного брейкпоинта**
   - Без `defaultBreakpoint` `activeBreakpoint` может быть `null`.
3. **Несогласованные значения**
   - Всегда указывайте возрастающие числа для брейкпоинтов.

---

## Типизация

**Экспортируемые типы**

- `UseViewportBreakpointMatches<BreakpointKey>`
  - Карта брейкпоинтов и их булевых состояний.

- `UseViewportBreakpointOptions<BreakpointKey>`
  - Опции с полем `defaultBreakpoint`.

- `UseViewportBreakpointReturn<BreakpointKey>`
  - Гибрид: кортеж `[matches, activeBreakpoint]` **и** объект `{ matches, activeBreakpoint }`.

---

## Смотрите также

- [useResizeObserver](useResizeObserver.md)
- [useMediaQuery](useMediaQuery.md)
