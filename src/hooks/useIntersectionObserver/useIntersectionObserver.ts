import { RefObject } from 'react';

import { useDemandStructure } from '../useDemandStructure';
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';
import { useRefState } from '../useRefState';

import {
  UseIntersectionObserverCallback,
  UseIntersectionObserverReturn,
} from './types';

/**
 * A React hook that observes visibility changes of a DOM element using IntersectionObserver.
 *
 * - Invokes the `callback` whenever the observed element's intersection state changes.
 * - Also exposes the latest IntersectionObserverEntry via demand-activated state (`currentEntry`).
 * - Automatically subscribes to the element referenced by `ref`.
 *
 * Note:
 * - The observer callback will be triggered whenever the target element enters or leaves the viewport,
 *   or when its intersection ratio changes.
 * - If the element is removed from the DOM, the observer is disconnected silently.
 *
 * @template ElementType - The type of element to observe (typically HTMLElement or SVGElement).
 *
 * @param ref - A RefObject pointing to the DOM element to observe.
 * @param callback - Optional callback invoked with the latest IntersectionObserverEntry
 *   whenever the intersection state changes.
 *
 * @returns An object containing a lazily-tracked `currentEntry` field (IntersectionObserverEntry | null).
 *
 * @example
 * const ref = useRef(null);
 * const { currentEntry } = useIntersectionObserver(ref);
 *
 * useEffect(() => {
 *   if (currentEntry?.isIntersecting) {
 *     console.log('Element is visible');
 *   }
 * }, [currentEntry]);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useIntersectionObserver.md
 */
export function useIntersectionObserver<ElementType extends Element | null>(
  ref: RefObject<ElementType | null>,
  callback?: UseIntersectionObserverCallback,
): UseIntersectionObserverReturn {
  const [currentEntryRef, setCurrentEntry, { enableUpdate }] =
    useRefState<IntersectionObserverEntry | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const element = ref.current;

    const observer = new IntersectionObserver((entries) => {
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
