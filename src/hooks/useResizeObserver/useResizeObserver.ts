import { RefObject } from 'react';

import { useDemandStructure } from '../useDemandStructure';
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';
import { useRefState } from '../useRefState';

import { UseResizeObserverCallback, UseResizeObserverReturn } from './types';

/**
 * A React hook that observes size changes of a DOM element using ResizeObserver.
 *
 * - Invokes the `callback` whenever the observed element's size changes.
 * - Also exposes the latest ResizeObserverEntry via demand-activated state (`currentEntry`).
 * - Automatically subscribes to the element referenced by `ref`.
 *
 * Note:
 * - The observer callback will be triggered when the element resizes or is removed from the DOM in a way that affects its size.
 * - If the element disappears without a size change, the observer is disconnected silently.
 *
 * @template ElementType - The type of element to observe (typically HTMLElement or SVGElement).
 *
 * @param ref - A RefObject pointing to the DOM element to observe.
 * @param callback - Optional callback invoked with the latest ResizeObserverEntry when size changes.
 *
 * @returns An object containing a lazily-tracked `currentEntry` field (ResizeObserverEntry | null).
 *
 * @example
 * const ref = useRef(null);
 * const { currentEntry } = useResizeObserver(ref);
 *
 * useEffect(() => {
 *   if (currentEntry) {
 *     console.log(currentEntry.contentRect.width);
 *   }
 * }, [currentEntry]);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useResizeObserver.md
 */
export function useResizeObserver<ElementType extends Element | null>(
  ref: RefObject<ElementType | null>,
  callback?: UseResizeObserverCallback,
): UseResizeObserverReturn {
  const [currentEntryRef, setCurrentEntry, { enableUpdate }] =
    useRefState<ResizeObserverEntry | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const element = ref.current;

    const observer = new ResizeObserver((entries) => {
      const actualEntry = entries[entries.length - 1]!;

      setCurrentEntry(actualEntry);
      callback?.(actualEntry);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref.current]);

  return useDemandStructure([
    {
      alias: 'currentEntry',
      accessor: (isInitialAccess) => {
        // Lazily enable reactivity on first external access to `currentEntry`.
        // This avoids unnecessary re-renders if the currentEntry is never used.
        if (isInitialAccess) {
          enableUpdate(true);
        }

        return currentEntryRef.current;
      },
    },
  ]);
}
