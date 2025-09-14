# `useIntersectionObserver`

## Описание

`useIntersectionObserver` — хук для наблюдения за видимостью DOM-элемента через `IntersectionObserver`.  
Подписывается на элемент из `ref`, по каждому изменению может вызывать **колбэк**, а также предоставляет **лениво-активируемое** поле `currentEntry` c последней записью наблюдателя.

Хук возвращает *гибридную* структуру: её можно деструктурировать как **кортеж** (`[currentEntry]`) или как **объект** (`{ currentEntry }`).

---

## Сигнатура

```ts
function useIntersectionObserver<ElementType extends Element | null>(
  ref: RefObject<ElementType | null>,
  callback?: UseIntersectionObserverCallback,
): UseIntersectionObserverReturn;
```

- **Параметры**
   - `ref` — ссылочный объект на элемент, видимость которого нужно отслеживать.
   - `callback?` — функция, вызываемая при каждом изменении; принимает актуальный `IntersectionObserverEntry`.

- **Возвращает**: `UseIntersectionObserverReturn`
   - Объект/кортеж с полем `currentEntry: IntersectionObserverEntry | null` — последняя запись наблюдателя (обновляется по мере изменений; ререндеры включаются **после первого доступа** к этому полю).

---

## Примеры

### 1) Проверка, находится ли элемент в зоне видимости

```tsx
import { useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@webeach/react-hooks/useIntersectionObserver';

export function Section() {
  const ref = useRef<HTMLDivElement>(null);
  const { currentEntry } = useIntersectionObserver(ref);

  useEffect(() => {
    if (currentEntry?.isIntersecting) {
      console.log('Элемент виден на экране');
    }
  }, [currentEntry]);

  return <div ref={ref} style={{ height: 300 }}>Секция</div>;
}
```

### 2) Побочный эффект только через `callback`

```tsx
import { useRef } from 'react';
import { useIntersectionObserver } from '@webeach/react-hooks/useIntersectionObserver';

export function AnalyticsTracker() {
  const ref = useRef<HTMLElement>(null);

  useIntersectionObserver(ref, (entry) => {
    if (entry.isIntersecting) {
      console.log('Отправляем событие: элемент появился');
    }
  });

  return <section ref={ref} style={{ minHeight: 400 }} />;
}
```

### 3) Ленивая загрузка изображений

```tsx
import { useRef, useEffect, useState } from 'react';
import { useIntersectionObserver } from '@webeach/react-hooks/useIntersectionObserver';

export function LazyImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const { currentEntry } = useIntersectionObserver(ref);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (currentEntry?.isIntersecting) {
      setLoaded(true);
    }
  }, [currentEntry]);

  return <img ref={ref} src={loaded ? src : undefined} alt={alt} />;
}
```

---

## Поведение

1. **Подписка и переподписка**
   - Наблюдатель подключается к `ref.current` после маунта и переподключается при смене элемента.

2. **Ленивая реактивность `currentEntry`**
   - Ререндеры для `currentEntry` включаются на первом внешнем чтении поля. Пока поле не читают, обновления не приводят к перерисовкам.

3. **Колбэк независим от `currentEntry`**
   - `callback`, если указан, вызывается при каждом изменении пересечения вне зависимости от использования `currentEntry`.

4. **Очистка**
   - Наблюдатель автоматически отключается при размонтировании компонента и при смене целевого элемента.

5. **SSR-безопасность**
   - Логика подписки выполняется только в браузере; при серверном рендеринге побочные эффекты не выполняются.

---

## Когда использовать

1. **Ленивая загрузка**
   - Загружать изображения, видео или данные только при появлении элемента в области видимости.

2. **Анимации при скролле**
   - Запускать анимации, когда блок появляется на экране.

3. **Аналитика**
   - Отслеживать просмотры секций или баннеров без глобальных слушателей скролла.

---

## Когда **не** использовать

1. **Единичная проверка видимости**
   - Для одноразового вычисления позиции достаточно `getBoundingClientRect`.

2. **Если важна только прокрутка окна**
   - Используйте глобальные события (`scroll`, `resize`) вместо локального наблюдателя.

---

## Частые ошибки

1. **Отсутствие привязки `ref` к элементу**
   - Если `ref.current === null`, подписка не произойдёт. Убедитесь, что `ref` передан в нужный элемент.

2. **Ожидание ререндера без доступа к `currentEntry`**
   - Если вы используете только `callback`, компонент не будет перерисовываться — это ожидаемое поведение.

3. **Случайная переподписка**
   - Следите, чтобы сам `ref` был стабильным; не создавайте новый `ref` на каждый рендер.

---

## Типизация

**Экспортируемые типы**

- `UseIntersectionObserverCallback`
   - `(entry: IntersectionObserverEntry) => void`.

- `UseIntersectionObserverReturn`
   - Гибрид: объект `{ currentEntry: IntersectionObserverEntry | null }` **и** кортеж `[currentEntry: IntersectionObserverEntry | null]`.

- `UseIntersectionObserverReturnObject`
   - Объектная форма: `{ currentEntry: IntersectionObserverEntry | null }`.

- `UseIntersectionObserverReturnTuple`
   - Кортежная форма: `[currentEntry: IntersectionObserverEntry | null]`.

---

## Смотрите также

- [useResizeObserver](useResizeObserver.md)
