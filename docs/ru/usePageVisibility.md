# `usePageVisibility`

## Описание

`usePageVisibility` — хук, который отслеживает **видимость страницы** (`visible`/`hidden`) через событие `visibilitychange`. Возвращает _гибридную_ структуру с текущим флагом `isVisible` и (опционально) вызывает колбэк при каждом изменении видимости.

- Кортеж: `[isVisible]`
- Объект: `{ isVisible }`

---

## Сигнатура

```ts
function usePageVisibility(
  callback?: UsePageVisibilityCallback,
): UsePageVisibilityReturn;
```

- **Параметры**
  - `callback?` — функция, вызываемая при каждом изменении видимости: `(isVisible: boolean) => void`.

- **Возвращает**: `UsePageVisibilityReturn` — гибридная структура со свойством/элементом `isVisible: boolean`.

---

## Примеры

### 1) Показ индикатора активности вкладки

```tsx
import { usePageVisibility } from '@webeach/react-hooks/usePageVisibility';

export function PageActivityBadge() {
  const { isVisible } = usePageVisibility();

  return <div>{isVisible ? '🟢 Вкладка активна' : '⚪️ Вкладка неактивна'}</div>;
}
```

### 2) Пауза/резюм анимации (через класс)

```tsx
import { usePageVisibility } from '@webeach/react-hooks/usePageVisibility';

export function Spinner() {
  const { isVisible } = usePageVisibility();

  return <div className={isVisible ? 'spinner' : 'spinner spinner--paused'} />;
}
```

---

## Поведение

1. **Семантика `isVisible`**
   - Значение отражает `document.visibilityState === 'visible'` и обновляется на событие `visibilitychange`.

2. **Опциональный колбэк**
   - При каждом изменении видимости вызывается `callback?.(isVisible)`. Колбэк всегда вызывается, даже если компонент не читает `isVisible` в UI.

3. **Обновления только при использовании**
   - Если `isVisible` не читался (например, вы используете только колбэк), лишний ререндер **не** инициируется.

4. **SSR/ISR‑безопасность**
   - На сервере `isVisible` считается `true`; подписка на события происходит только после маунта. После первого клиента может прийти реальное значение и произойти обновление.

5. **Стабильность интерфейса**
   - Возвращаемая структура стабильно содержит лишь `isVisible`; удобна для кортежной и объектной деструктуризации.

---

## Когда использовать

- Приостановка поллинга/таймеров/анимаций на скрытой вкладке.
- Отключение тяжёлых вычислений и сетевых запросов, пока пользователь неактивен.
- Изменение UI‑индикаторов «онлайн/неактивен», отображение бейджей.

---

## Когда **не** использовать

- Если логика не зависит от видимости вкладки.
- Если требуется более детальная телеметрия активности (фокус окна, `pointermove`, `visibilitychange` документа и т.п.) — используйте соответствующие хуки/события совместно.

---

## Частые ошибки

1. **Ожидание ререндера без чтения `isVisible`**
   - Если вы не используете `isVisible` в разметке/логике, компонент не будет перерисован — используйте колбэк для побочных действий.

2. **Тяжёлая работа внутри колбэка**
   - Избегайте тяжёлых операций в обработчике видимости; выносите их в отложенные задачи/воркеры.

3. **Опора на начальное значение при SSR**

- Помните, что на сервере `isVisible = true`; сразу после маунта значение может измениться.

---

## Типизация

**Экспортируемые типы**

- `UsePageVisibilityCallback`
  - Колбэк, вызываемый при изменении видимости документа: `(isVisible: boolean) => void`.

- `UsePageVisibilityReturn`
  - Гибридный тип: кортеж `[isVisible]` **и** объект `{ isVisible }`.

- `UsePageVisibilityReturnObject`
  - Объектная форма: `{ isVisible: boolean }`.

- `UsePageVisibilityReturnTuple`
  - Кортежная форма: `[isVisible: boolean]`.

---

## Смотрите также

- [usePageTitle](usePageTitle.md)
