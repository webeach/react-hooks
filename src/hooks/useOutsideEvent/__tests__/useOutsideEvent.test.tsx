import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';

import { UseOutsideEventHandler, UseOutsideEventType } from '../types';
import { useOutsideEvent } from '../useOutsideEvent';

function Box({
  eventType = 'click',
  handler,
  label = 'Box',
}: {
  eventType?: UseOutsideEventType;
  handler: UseOutsideEventHandler;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useOutsideEvent(ref, eventType, handler);

  return (
    <div>
      {/* Make the tracked element accessible via role and name */}
      <div ref={ref} role="group" aria-label={label} tabIndex={0}>
        {label}
      </div>
      <button>Outside</button>
    </div>
  );
}

describe('useOutsideEvent hook', () => {
  it('calls handler on outside click', async () => {
    const handler = vi.fn();

    render(<Box handler={handler} />);

    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call handler on inside click', async () => {
    const handler = vi.fn();

    render(<Box handler={handler} />);

    await userEvent.click(screen.getByRole('group', { name: 'Box' }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('treats clicks on descendants as inside (no call)', async () => {
    const handler = vi.fn();

    function WithChild() {
      const ref = useRef<HTMLDivElement | null>(null);
      useOutsideEvent(ref, 'click', handler);
      return (
        <div>
          <div ref={ref} role="group" aria-label="Parent">
            <button>Child</button>
          </div>
          <button>Outside</button>
        </div>
      );
    }

    render(<WithChild />);

    await userEvent.click(screen.getByRole('button', { name: 'Child' }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('supports different event types (mousedown)', async () => {
    const handler = vi.fn();

    render(<Box eventType="mousedown" handler={handler} />);

    const outsideButton = screen.getByRole('button', { name: 'Outside' });
    // Some user-event versions may not emit mousedown alone; ensure via fireEvent.
    fireEvent.mouseDown(outsideButton);

    expect(handler).toHaveBeenCalled();
  });

  it('supports touchstart via fireEvent', () => {
    const handler = vi.fn();

    render(<Box eventType="touchstart" handler={handler} />);

    const outsideButton = screen.getByRole('button', { name: 'Outside' });
    fireEvent.touchStart(outsideButton);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes on unmount (no calls after)', async () => {
    const handler = vi.fn();

    const { unmount } = render(<Box handler={handler} />);

    const outsideButton = screen.getByRole('button', { name: 'Outside' });
    unmount();

    await userEvent.click(outsideButton);

    expect(handler).not.toHaveBeenCalled();
  });

  it('uses latest handler via live ref when handler changes', async () => {
    const firstHandler = vi.fn();
    const secondHandler = vi.fn();

    function Wrapper() {
      const [handler, setHandler] = useState<UseOutsideEventHandler>(
        () => firstHandler,
      );
      const ref = useRef<HTMLDivElement | null>(null);
      useOutsideEvent(ref, 'click', handler);
      return (
        <div>
          {/* Switch INSIDE the tracked element so its click does NOT count as outside */}
          <div ref={ref} role="group" aria-label="Box" tabIndex={0}>
            Box
            <button onClick={() => setHandler(() => secondHandler)}>
              Switch
            </button>
          </div>
          <button>Outside</button>
        </div>
      );
    }

    render(<Wrapper />);

    // 1) Outside click -> calls firstHandler
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));

    // 2) Click Switch (inside Box) -> updates handler but does NOT trigger outside
    await userEvent.click(screen.getByRole('button', { name: 'Switch' }));

    // 3) Outside click again -> should call secondHandler
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(1);
  });

  it('rebinds listeners when event type changes', async () => {
    const firstHandler = vi.fn();
    const secondHandler = vi.fn();

    function Switchable({
      type,
      handler,
    }: {
      type: UseOutsideEventType;
      handler: UseOutsideEventHandler;
    }) {
      const ref = useRef<HTMLDivElement | null>(null);
      useOutsideEvent(ref, type, handler);
      return (
        <div>
          <div ref={ref} role="group" aria-label="Box">
            Box
          </div>
          <button>Outside</button>
        </div>
      );
    }

    const { rerender } = render(
      <Switchable type="click" handler={firstHandler} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));

    rerender(<Switchable type="mousedown" handler={secondHandler} />);

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(1);
  });

  it('isolates multiple instances (each only reacts to outside of its own box)', async () => {
    const handlerBoxA = vi.fn();
    const handlerBoxB = vi.fn();

    function DualCustom() {
      const refBoxA = useRef<HTMLDivElement | null>(null);
      const refBoxB = useRef<HTMLDivElement | null>(null);
      useOutsideEvent(refBoxA, 'click', handlerBoxA);
      useOutsideEvent(refBoxB, 'click', handlerBoxB);
      return (
        <div>
          <div ref={refBoxA} role="group" aria-label="Box A">
            A <button>Inner A</button>
          </div>
          <div ref={refBoxB} role="group" aria-label="Box B">
            B <button>Inner B</button>
          </div>
          <button>Stage</button>
        </div>
      );
    }

    render(<DualCustom />);

    // NOTE: Each hook fires when the event happens OUTSIDE of its own element.
    // So clicking inside "Box A" is an OUTSIDE click for "Box B", and vice versa.

    // 1) Click inside Box A -> handlerBoxB called, handlerBoxA not called
    await userEvent.click(screen.getByRole('button', { name: 'Inner A' }));
    expect(handlerBoxA).toHaveBeenCalledTimes(0);
    expect(handlerBoxB).toHaveBeenCalledTimes(1);

    // 2) Click inside Box B -> handlerBoxA called; handlerBoxB unchanged
    await userEvent.click(screen.getByRole('button', { name: 'Inner B' }));
    expect(handlerBoxA).toHaveBeenCalledTimes(1);
    expect(handlerBoxB).toHaveBeenCalledTimes(1);

    // 3) Click inside Box A again -> handlerBoxB called again; handlerBoxA unchanged
    await userEvent.click(screen.getByRole('button', { name: 'Inner A' }));
    expect(handlerBoxA).toHaveBeenCalledTimes(1);
    expect(handlerBoxB).toHaveBeenCalledTimes(2);

    // 4) Click on shared Stage -> triggers both (outside of both boxes)
    await userEvent.click(screen.getByRole('button', { name: 'Stage' }));
    expect(handlerBoxA).toHaveBeenCalledTimes(2);
    expect(handlerBoxB).toHaveBeenCalledTimes(3);
  });

  it('receives proper MouseEvent object', async () => {
    const handler = vi.fn<UseOutsideEventHandler>((event) => {
      expect(event).toBeInstanceOf(MouseEvent);
      expect(event.type).toBe('click');
      expect(event.target).toBeInstanceOf(HTMLElement);
    });

    render(<Box handler={handler} />);

    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));

    expect(handler).toHaveBeenCalled();
  });

  it('does nothing when clicking inside followed by outside (only outside triggers)', async () => {
    const handler = vi.fn();

    render(<Box handler={handler} />);

    await userEvent.click(screen.getByRole('group', { name: 'Box' }));
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
