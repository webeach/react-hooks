import { RefObject } from 'react';

import { isFunction } from '../../functions/isFunction';
import { useDeps } from '../useDeps';
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';
import { useLiveRef } from '../useLiveRef';

import { makeRefObservable } from './utils/makeRefObservable';

import {
  ObservableRefSubscriber,
  UseRefEffectCompareFunction,
  UseRefEffectHandler,
} from './types';

/**
 * Runs the handler when `ref.current` changes to a non-null value.
 *
 * The handler will be re-invoked only when the `ref.current` changes.
 *
 * @param ref - The ref to observe.
 * @param handler - A function that receives the element. Can return a cleanup function.
 *
 * @example
 * useRefEffect(ref, (el) => {
 *   el.focus();
 * });
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useRefEffect.md
 */
function useRefEffect<RefValue>(
  ref: RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
): void;

/**
 * Runs the handler when `ref.current` changes or when any of the dependencies change.
 *
 * Performs shallow comparison (`===`) per index on the dependency array.
 *
 * @param ref - The ref to observe.
 * @param handler - The handler to call when the ref is available.
 * @param deps - Dependency array to track.
 *
 * @example
 * useRefEffect(ref, handler, [theme, locale]);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useRefEffect.md
 */
function useRefEffect<RefValue>(
  ref: RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
  deps: unknown[],
): void;

/**
 * Runs the handler when `ref.current` changes or when the compared value changes based on a compare function.
 *
 * @param ref - The ref to observe.
 * @param handler - The handler to call when the ref is available.
 * @param compare - A function that compares the previous and next value.
 * @param comparedValue - The current value to track.
 *
 * @example
 * useRefEffect(ref, handler, (a, b) => a.id === b.id, user);
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useRefEffect.md
 */
function useRefEffect<RefValue, ComparedValue>(
  ref: RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
  compare: UseRefEffectCompareFunction<ComparedValue>,
  comparedValue: ComparedValue,
): void;

/**
 * Runs the handler when `ref.current` changes or when the comparison logic manually determines an update.
 *
 * @param ref - The ref to observe.
 * @param handler - The handler to call when the ref is available.
 * @param compare - A comparison function. You must handle state yourself.
 *
 * @example
 * useRefEffect(ref, handler, () => false); // always triggers
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useRefEffect.md
 */
function useRefEffect<RefValue>(
  ref: RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
  compare: UseRefEffectCompareFunction,
): void;

function useRefEffect<RefValue, ComparedValue>(
  ref: RefObject<RefValue | null | undefined>,
  handler: UseRefEffectHandler<RefValue>,
  ...compareArgs: unknown[]
) {
  const handlerLiveRef = useLiveRef(handler);

  const [depId] = useDeps<ComparedValue>(
    ...(compareArgs as Parameters<typeof useDeps<ComparedValue>>),
  );

  useIsomorphicLayoutEffect(() => {
    const subscribers = makeRefObservable(ref);

    let lastCleanUpHandler: (() => void) | null | void;
    let requestId = 0;

    const handleSubscribe: ObservableRefSubscriber<RefValue> = (current) => {
      if (isFunction(lastCleanUpHandler)) {
        lastCleanUpHandler();
      }

      if (current === null || current === undefined) {
        lastCleanUpHandler = null;
        return;
      }

      lastCleanUpHandler = handlerLiveRef.current(current);
    };

    const handleSubscribeWithRaf: ObservableRefSubscriber<RefValue> = (
      current,
    ) => {
      cancelAnimationFrame(requestId);

      requestId = requestAnimationFrame(() => {
        handleSubscribe(current);
      });
    };

    handleSubscribe(ref.current);

    subscribers.add(handleSubscribeWithRaf);

    return () => {
      subscribers.delete(handleSubscribeWithRaf);

      if (isFunction(lastCleanUpHandler)) {
        lastCleanUpHandler();
      }
    };
  }, [depId, ref]);
}

export { useRefEffect };
