import { RefObject } from 'react';

import { $RefObserverSubscribersSymbol } from '../constants';
import { ObservableRef, ObservableRefSubscriber } from '../types';

/**
 * Makes a React `ref` observable by intercepting access to its `.current` property.
 *
 * The function overrides the `current` property using `Object.defineProperty`,
 * so that any future assignment to `ref.current` will notify all subscribed observers.
 *
 * If the `ref` has already been made observable, it reuses the existing subscriber set.
 *
 * To avoid infinite loops caused by recursive mutations, internal updates during subscription
 * dispatch are tracked and ignored.
 *
 * @template RefValue - The type of the ref's `.current` value.
 *
 * @param ref - A React `RefObject` to be made observable.
 * @returns A `Set` of subscribers that will be notified whenever `ref.current` changes.
 *
 * @example
 * const ref = useRef<HTMLElement>(null);
 *
 * const subscribers = makeRefObservable(ref);
 * subscribers.add((node) => {
 *   console.log('ref changed to:', node);
 * });
 *
 * ref.current = document.createElement('div'); // triggers subscriber
 */
export function makeRefObservable<RefValue>(
  ref: RefObject<RefValue | null | undefined>,
) {
  const observableRef = ref as ObservableRef<RefValue>;

  if (observableRef[$RefObserverSubscribersSymbol]) {
    return observableRef[$RefObserverSubscribersSymbol];
  }

  let currentValue = ref.current;
  let isInternalUpdate = false;

  const subscribers = new Set<ObservableRefSubscriber<RefValue>>();

  Object.defineProperties(observableRef, {
    current: {
      get() {
        return currentValue;
      },
      set(newValue: RefValue | null | undefined) {
        if (newValue === currentValue || isInternalUpdate) {
          return;
        }

        isInternalUpdate = true;

        subscribers.forEach((handler) => {
          handler(newValue);
        });

        currentValue = newValue;
        isInternalUpdate = false;
      },
    },
    [$RefObserverSubscribersSymbol]: {
      get: () => subscribers,
      enumerable: false,
    },
  });

  return subscribers;
}
