import { RefObject } from 'react';

import type { $RefObserverSubscribersSymbol } from './constants';

export type ObservableRef<RefValue> = RefObject<RefValue> & {
  [$RefObserverSubscribersSymbol]: Set<ObservableRefSubscriber<RefValue>>;
};

export type ObservableRefSubscriber<RefValue> = (
  newValue: RefValue | null | undefined,
) => void;

export type UseRefEffectHandler<RefValue> = (
  current: RefValue,
) => (() => void) | void;
