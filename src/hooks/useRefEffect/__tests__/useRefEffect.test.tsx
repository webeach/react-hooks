import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RefObject, useEffect, useRef, useState } from 'react';

import { useRefEffect } from '../useRefEffect';

describe('useRefEffect hook', () => {
  it('calls handler when ref becomes available', () => {
    const handler = vi.fn();

    function TestComponent() {
      const ref = useRef<HTMLDivElement | null>(null);
      useRefEffect(ref, handler);
      return <div ref={ref} />;
    }

    render(<TestComponent />);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenLastCalledWith(expect.any(HTMLDivElement));
  });

  it('calls cleanup when ref becomes null', async () => {
    const cleanup = vi.fn();
    const handler = vi.fn(() => cleanup);

    function TestComponent() {
      const [show, setShow] = useState(true);
      const ref = useRef<HTMLDivElement | null>(null);

      useRefEffect(ref, handler);

      useEffect(() => {
        setShow(false);
      }, []);

      return show ? <div ref={ref} /> : null;
    }

    render(<TestComponent />);

    await waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenLastCalledWith(expect.any(HTMLDivElement));
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  it('calls handler again when ref changes to a different element', async () => {
    const cleanup = vi.fn();
    const handler = vi.fn(() => cleanup);

    function TestComponent() {
      const [step, setStep] = useState(0);
      const ref = useRef<HTMLDivElement | HTMLSpanElement | null>(null);

      useEffect(() => {
        setStep(1);
      }, []);

      useRefEffect(ref, handler);

      return step === 1 ? (
        <span ref={ref as RefObject<HTMLSpanElement>} />
      ) : (
        <div ref={ref as RefObject<HTMLDivElement>} />
      );
    }

    render(<TestComponent />);

    await waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, expect.any(HTMLDivElement));
      expect(handler).toHaveBeenNthCalledWith(2, expect.any(HTMLSpanElement));
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call handler if ref stays null', () => {
    const handler = vi.fn();

    function TestComponent() {
      const ref = useRef<HTMLDivElement | null>(null);
      useRefEffect(ref, handler);
      return null;
    }

    render(<TestComponent />);
    expect(handler).not.toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const cleanup = vi.fn();
    const handler = vi.fn(() => cleanup);

    function TestComponent() {
      const ref = useRef<HTMLDivElement | null>(null);
      useRefEffect(ref, handler);
      return <div ref={ref} />;
    }

    const { unmount } = render(<TestComponent />);
    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('returns and calls a new cleanup if handler returns one again', async () => {
    const cleanup = vi.fn();
    const handler = vi.fn(() => cleanup);

    function TestComponent() {
      const [step, setStep] = useState(0);
      const ref = useRef<HTMLDivElement | HTMLSpanElement | null>(null);

      useRefEffect(ref, handler);

      return (
        <>
          <button onClick={() => setStep((value) => value + 1)} />
          {step === 1 ? (
            <span ref={ref as RefObject<HTMLSpanElement>} />
          ) : (
            <div ref={ref as RefObject<HTMLDivElement>} />
          )}
        </>
      );
    }

    render(<TestComponent />);

    const buttonElement = screen.getByRole('button');

    await userEvent.click(buttonElement);

    await new Promise((resolve) => requestAnimationFrame(resolve));

    await userEvent.click(buttonElement);

    await waitFor(() => {
      expect(cleanup).toHaveBeenCalledTimes(2);
    });
  });

  it('does not call handler multiple times for same element', () => {
    const handler = vi.fn();

    function TestComponent() {
      const ref = useRef<HTMLDivElement | null>(null);
      useRefEffect(ref, handler);
      return <div ref={ref} />;
    }

    const { rerender } = render(<TestComponent />);

    rerender(<TestComponent />);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls handler again when deps change', () => {
    const handler = vi.fn();

    function TestComponent({ deps }: { deps: unknown[] }) {
      const ref = useRef<HTMLDivElement | null>(null);
      useRefEffect(ref, handler, deps);
      return <div ref={ref} />;
    }

    const { rerender } = render(<TestComponent deps={[1]} />);
    expect(handler).toHaveBeenCalledTimes(1);

    rerender(<TestComponent deps={[2]} />);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('calls handler again if compare function returns false', () => {
    const handler = vi.fn();
    const compare = vi.fn(() => false);

    function TestComponent({ value }: { value: number }) {
      const ref = useRef<HTMLDivElement | null>(null);
      useRefEffect(ref, handler, compare, value);
      return <div ref={ref} />;
    }

    const { rerender } = render(<TestComponent value={1} />);
    expect(handler).toHaveBeenCalledTimes(1);

    rerender(<TestComponent value={2} />);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('does not call handler again if compare returns true', () => {
    const handler = vi.fn();
    const compare = () => true;

    function TestComponent({ value }: { value: number }) {
      const ref = useRef<HTMLDivElement | null>(null);
      useRefEffect(ref, handler, compare, value);
      return <div ref={ref} />;
    }

    const { rerender } = render(<TestComponent value={1} />);
    expect(handler).toHaveBeenCalledTimes(1);

    rerender(<TestComponent value={2} />);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
