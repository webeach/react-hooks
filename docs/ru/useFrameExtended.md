# `useFrameExtended`

## Описание

`useFrameExtended` — хук, который организует **расширенный кадровый цикл** на базе `requestAnimationFrame` и предоставляет методы управления: `start`, `stop`, `restart`. Колбэк вызывается на **каждом кадре** и получает тайминги:
- `frame` — номер кадра, начиная с `1` после `start()`/`restart()`;
- `deltaTime` — миллисекунды с предыдущего кадра;
- `timeSinceLastStart` — миллисекунды с момента последнего `start()`/`restart()`;
- `timeSinceStart` — миллисекунды с самого первого запуска хука (сбрасывается `restart()`).

---

## Сигнатура

```ts
function useFrameExtended(callback: UseFrameExtendedCallback): UseFrameExtendedReturn;
```

- **Параметры**
   - `callback` — функция, вызываемая на каждом кадре с объектом таймингов.

- **Возвращает**: `UseFrameExtendedReturn` — объект управления циклом:
   - `start(): void` — запуск цикла (если вызван до маунта, запуск отложится до маунта);
   - `stop(): void` — остановка текущего цикла;
   - `restart(): void` — остановка, сброс счётчиков и новый запуск.

---

## Примеры

### 1) Автозапуск в layout‑фазе

```tsx
import { useLayoutEffect } from 'react';
import { useFrameExtended } from '@webeach/react-hooks/useFrameExtended';

export function Logger() {
  const { start } = useFrameExtended(({ frame, deltaTime, timeSinceStart }) => {
    if (frame % 60 === 0) {
      console.log('frame', frame, 'Δ', deltaTime.toFixed(2), 'ms', 'total', timeSinceStart.toFixed(1), 'ms');
    }
  });

  useLayoutEffect(() => {
    start();
  }, []);

  return null;
}
```

### 2) Кнопки «Старт/Стоп»

```tsx
import { useFrameExtended } from '@webeach/react-hooks/useFrameExtended';

export function Controls() {
  const loop = useFrameExtended(({ deltaTime }) => {
    // ваша логика кадра
  });

  return (
    <div>
      <button onClick={() => loop.start()}>Start</button>
      <button onClick={() => loop.stop()}>Stop</button>
    </div>
  );
}
```

### 3) Перезапуск с обнулением счётчиков

```tsx
import { useFrameExtended } from '@webeach/react-hooks/useFrameExtended';

export function Restartable() {
  const { start, stop, restart } = useFrameExtended(({ frame, timeSinceLastStart }) => {
    // frame снова начнётся с 1 после restart
  });

  return (
    <div>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={restart}>Restart</button>
    </div>
  );
}
```

---

## Поведение

1. **Запуск/остановка**
   - `start()` запускает цикл. Если вызван до маунта, запуск будет **отложен** и выполнится сразу после маунта.

2. **Повторный запуск `start()`**
   - При повторном вызове `start()` активный цикл сначала останавливается, затем запускается заново. Счётчик `frame` **не сбрасывается** (для сброса используйте `restart()`).

3. **`restart()`**
   - Сбрасывает `frame` (снова с `1`) и «глобальный» таймер; `timeSinceStart` и `timeSinceLastStart` начинают отсчёт заново.

4. **Тайминги кадра**
   - `deltaTime` отражает реальную длительность предыдущего кадра; используйте его для кадрово‑независимых анимаций.

5. **Актуальность колбэка**
   - Используется актуальная версия `callback`; обновления пропсов/состояния подхватываются **без** ручной переподписки.

6. **Layout‑семантика**
   - Подписка выполняется в layout‑фазе: удобно для измерений DOM и синхронной подготовки к пейнту.

7. **Стабильность методов**
   - `start`, `stop`, `restart` — стабильны между рендерами; их безопасно указывать в зависимостях эффектов/колбэков.

---

## Когда использовать

- Анимации и последовательные вычисления, требующие **пауз/перезапусков**.
- Интеграции с Canvas/WebGL/SVG, когда нужен контроль над жизненным циклом кадров.
- Сценарии, где требуется различать «время с запуска» и «время с последнего старта».

---

## Когда **не** использовать

- Для редких/разовых действий (`setTimeout`, обычные эффекты).
- Если не нужен контроль цикла — подойдёт простой `useFrame`.
- Для тяжёлых вычислений в каждом кадре — распределяйте работу или снижайте частоту.

---

## Частые ошибки

1. **Ожидание, что `start()` обнуляет счётчики**
   - `start()` не сбрасывает `frame` и общий таймер. Используйте `restart()`.

2. **Вызов `start()` в теле рендера**
   - Побочные действия инициируйте в эффекте (`useEffect`/`useLayoutEffect`), а не во время рендера.

3. **Перегрузка кадра тяжёлой логикой**
   - Длительный код внутри колбэка создаёт рывки. Выносите тяжёлые операции или используйте воркеры.

4. **Забытая остановка при управлении вручную**
   - Хук сам очищается при размонтировании, но если в логике компонент/страница переключаются, корректно вызывайте `stop()`.

---

## Типизация

**Экспортируемые типы**

- `UseFrameExtendedReturn`
   - Объект управления циклом: `{ start(): void; stop(): void; restart(): void }`.

- `UseFrameExtendedCallback`
   - `(info: UseFrameExtendedCallbackOptions) => void` — вызывается на каждом кадре.

- `UseFrameExtendedCallbackOptions`
   - `frame: number` — номер кадра, начиная с `1` после `start()`/`restart()`;
   - `deltaTime: number` — миллисекунды с предыдущего кадра;
   - `timeSinceLastStart: number` — миллисекунды с последнего `start()`/`restart()`;
   - `timeSinceStart: number` — миллисекунды с первого запуска (сбрасывается `restart()`).

---

## Смотрите также

- [useFrame](useFrame.md)
- [useLoop](useLoop.md)
- [useTimeout](useTimeout.md)
- [useTimeoutExtended](useTimeoutExtended.md)
