# `useResizeObserver`

## Описание

`useResizeObserver` — хук для наблюдения за изменениями размеров DOM‑элемента через `ResizeObserver`. Подписывается на элемент из `ref`, по каждому изменению может вызывать **колбэк**, а также предоставляет **лениво‑активируемое** поле `currentEntry` c последней записью наблюдателя.

Хук возвращает *гибридную* структуру: её можно деструктурировать как **кортеж** (`[currentEntry]`) или как **объект** (`{ currentEntry }`).

---

## Сигнатура

```ts
function useResizeObserver<ElementType extends Element | null>(
  ref: RefObject<ElementType | null>,
  callback?: UseResizeObserverCallback,
): UseResizeObserverReturn;
```

- **Параметры**
   - `ref` — ссылочный объект на элемент, размеры которого нужно отслеживать.
   - `callback?` — функция, вызываемая при каждом изменении; принимает актуальный `ResizeObserverEntry`.

- **Возвращает**: `UseResizeObserverReturn`
   - Объект/кортеж с полем `currentEntry: ResizeObserverEntry | null` — последняя запись наблюдателя (обновляется по мере изменений; ререндеры включаются **после первого доступа** к этому полю).

---

## Примеры

### 1) Чтение ширины/высоты через объектный доступ

```tsx
import { useRef, useEffect } from 'react';
import { useResizeObserver } from '@webeach/react-hooks/useResizeObserver';

export function BoxInfo() {
  const ref = useRef<HTMLDivElement>(null);
  const { currentEntry } = useResizeObserver(ref);

  useEffect(() => {
    if (currentEntry) {
      console.log('size:', currentEntry.contentRect.width, currentEntry.contentRect.height);
    }
  }, [currentEntry]);

  return <div ref={ref} style={{ resize: 'both', overflow: 'auto' }} />;
}
```

### 2) Побочный эффект только через `callback`

```tsx
import { useRef } from 'react';
import { useResizeObserver } from '@webeach/react-hooks/useResizeObserver';

export function SyncCssVar() {
  const ref = useRef<HTMLElement>(null);

  useResizeObserver(ref, (entry) => {
    // не используем currentEntry → лишних ререндеров нет
    entry.target.setAttribute(
      'style',
      `--w:${entry.contentRect.width}px; --h:${entry.contentRect.height}px;`
    );
  });

  return <section ref={ref} />;
}
```

### 3) Список, который подстраивает количество колонок

```tsx
import { useRef, useMemo } from 'react';
import { useResizeObserver } from '@webeach/react-hooks/useResizeObserver';

export function ResponsiveGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const [entry] = useResizeObserver(ref);

  const columns = useMemo(() => {
    const w = entry?.contentRect.width ?? 0;
    return w > 1000 ? 4 : w > 700 ? 3 : w > 400 ? 2 : 1;
  }, [entry]);

  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {/* ...items */}
    </div>
  );
}
```

---

## Поведение

1. **Подписка и переподписка**
   - Наблюдатель подключается к `ref.current` после маунта и переподключается при смене элемента.

2. **Ленивая реактивность `currentEntry`**
   - Ререндеры для `currentEntry` включаются на первом внешнем чтении поля. Пока поле не читают, обновления не приводят к перерисовкам.

3. **Колбэк независим от `currentEntry`**
   - `callback`, если указан, вызывается при каждом изменении размеров вне зависимости от использования `currentEntry`.

4. **Очистка**
   - Наблюдатель автоматически отключается при размонтировании компонента и при смене целевого элемента.

5. **SSR‑безопасность**
   - Логика подписки выполняется только в браузере; при серверном рендеринге побочные эффекты не выполняются.

---

## Когда использовать

1. **Адаптивные компоненты**
   - Следить за размерами контейнера и перестраивать раскладку/стили при изменениях.

2. **Интеграции с графикой/канвасом**
   - Подгонять холст, шкалы, вьюпорты под контейнер без листенеров окна.

3. **Оптимизация без глобальных слушателей**
   - Локально отслеживать только нужный элемент вместо `window.resize`.

---

## Когда **не** использовать

1. **Редкие разовые измерения**
   - Для одноразового чтения размера достаточно `getBoundingClientRect` в эффекте.

2. **Если важны лишь размеры окна**
   - Используйте хук для `window`‑событий (например, `useWindowEvent('resize', ...)`).

---

## Частые ошибки

1. **Отсутствие привязки `ref` к элементу**
   - Если `ref.current === null`, подписка не произойдёт. Убедитесь, что `ref` передан в `ref` нужного элемента.

2. **Ожидание ререндера без доступа к `currentEntry`**
   - Если вы используете только `callback`, компонент не будет перерисовываться — это ожидаемое поведение.

3. **Мутация данных из `currentEntry`**
   - `ResizeObserverEntry` следует воспринимать как снимок: используйте его значения, не пытайтесь менять их.

4. **Случайная переподписка**
   - Следите, чтобы сам `ref` был стабильным; не создавайте новый `ref` на каждый рендер.

---

## Типизация

- **Экспортируемые типы**

   - `UseResizeObserverCallback` — `(entry: ResizeObserverEntry) => void`.
   - `UseResizeObserverReturn` — гибридная форма (объект **и** кортеж).
   - `UseResizeObserverReturnObject` — `{ currentEntry: ResizeObserverEntry | null }`.
   - `UseResizeObserverReturnTuple` — `[currentEntry: ResizeObserverEntry | null]`.

---

## Смотрите также

- [useIntersectionObserver](useIntersectionObserver.md)
