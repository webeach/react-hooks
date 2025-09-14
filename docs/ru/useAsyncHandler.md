# `useAsyncHandler`

## Описание

`useAsyncHandler` — хук, который **автоматически** выполняет асинхронную функцию при маунте и каждый раз, когда меняются зависимости (`deps`), и предоставляет текущее состояние выполнения через `status` (`isPending`, `isSuccess`, `isError`, `error`). Внутри использует `useAsyncCallback`, поэтому обновления статуса **ленивые**: перерисовки начинаются только после первого обращения к `status`.

Хук возвращает *гибридную* структуру, поддерживающую **кортежную** и **объектную** деструктуризацию:
- Кортеж: `[status]`
- Объект: `{ status }`

---

## Сигнатура

```ts
function useAsyncHandler(
  handler: UseAsyncHandlerFunction,
  deps: React.DependencyList,
): UseAsyncHandlerReturn;
```

- **Параметры**
   - `handler` — асинхронная функция без аргументов, которую нужно автоматически вызывать.
   - `deps` — список зависимостей (как во втором аргументе `useEffect`), при изменении которых `handler` будет вызываться повторно.

- **Возвращает**: `UseAsyncHandlerReturn` — гибридная структура со статусом:
   - `status` — содержит `isPending`, `isSuccess`, `isError` и `error`.

---

## Примеры

### 1) Загрузка данных при маунте

```tsx
import { useAsyncHandler } from '@webeach/react-hooks/useAsyncHandler';

export function DataLoader() {
  const { status } = useAsyncHandler(async () => {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new Error('Network error');
    }

    const result = await res.json();

    console.log(result);
  }, []);

  if (status.isPending) {
    return <div>Loading…</div>;
  }
  
  if (status.isError) {
    return <div role="alert">{status.error?.message}</div>;
  }
  
  return <div>Done</div>;
}
```

### 2) Повторная загрузка при изменении параметров

```tsx
import { useAsyncHandler } from '@webeach/react-hooks/useAsyncHandler';

type SearchProps = {
  query: string;
  page: number;
};

export function Search(props: SearchProps) {
  const { query, page } = props;
  
  const { status } = useAsyncHandler(async () => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`);
    
    if (!res.ok) {
      throw new Error('Failed to load');
    }

    const result = await res.json();

    console.log(result);
  }, [query, page]);

  return (
    <div>
      {status.isPending && <span>Loading…</span>}
      {status.isError && <span role="alert">{status.error?.message}</span>}
    </div>
  );
}
```

---

## Поведение

1. **Автовызов по `deps`**
   - На маунте и при каждом изменении `deps` хук вызывает `handler`. Возвращённая из `handler` ошибка переводит `status` в состояние ошибки.

2. **Ленивая реактивность `status`**
   - Пока `status` ни разу не прочитан, его изменения **не** вызывают перерисовку. После первого доступа хук синхронизирует состояние и включает реактивность.

3. **Очистка и отмена**
   - При размонтировании текущий запуск «аннулируется» (влияет только последний вызов), чтобы исключить гонки и обновления после анмаунта.

4. **Логи в разработке**
   - В режиме разработки ошибки `handler` дополнительно выводятся в консоль.

5. **Гибридный доступ**
   - Результат можно использовать как кортеж `[status]` или как объект `{ status }`.

6. **Без ручного управления**
   - Хук не предоставляет `abort`/`retry`. Если нужен ручной перезапуск, отмена или вызов по событию — используйте `useAsyncCallback`.

---

## Когда использовать

- Надо «подтянуть» данные строго при маунте и при изменении параметров.
- Страницы/виджеты, которые вычисляют состояние из внешних зависимостей (`route`, `locale`, параметры фильтра).
- Простейший флоу «запрос → ожидание → показ результата/ошибки» без ручных перезапусков.

---

## Когда **не** использовать

- Нужны ручные вызовы, отмена, повтор (`retry`) по клику — возьмите `useAsyncCallback`.
- Тонкая логика сравнения зависимостей — используйте вместе с `useEffectCompare` или управляйте зависимостями самостоятельно.
- Сложные сценарии конкурентных запросов — рассмотрите менеджеры запросов (React Query и т.п.).

---

## Частые ошибки

1. **Неполный список зависимостей**
   - Пропущенная зависимость приводит к «устаревшим» данным. Включайте все значения, используемые внутри `handler`.

2. **Создание нестабильных значений в `deps`**
   - Не помещайте в зависимости каждый рендер новую функцию/объект без мемоизации — это вызовет лишние перезапуски. Используйте `useMemo`/`useCallback`.

3. **Ожидание ручного управления**
   - В этом хуке нет `abort()`/`handler()`. Для ручного контроля используйте `useAsyncCallback`.

4. **Игнорирование ошибок**
   - Обрабатывайте `status.isError` и выводите `status.error?.message` в UI. В дев‑режиме ошибка дополнительно залогируется в консоль, но это не замена пользовательскому сообщению.

---

## Типизация

**Экспортируемые типы**

- `UseAsyncHandlerFunction`
   - Асинхронная функция без аргументов: `() => Promise<void>`.

- `UseAsyncHandlerReturn`
   - Гибрид: кортеж `[status]` **и** объект `{ status }`.
 
- `UseAsyncHandlerReturnObject`
   - Объектная форма: `{ status: StatusStateMapTuple & StatusStateMap }`.

- `UseAsyncHandlerReturnTuple`
   - Кортежная форма: `[status: StatusStateMapTuple & StatusStateMap]`.

---

## Смотрите также

- [useAsyncCallback](useAsyncCallback.md)
- [useStatus](useStatus.md)
