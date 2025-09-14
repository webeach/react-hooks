import { MutableRefObject } from 'react';

/**
 * Control actions for toggling reactivity in `useRefState`.
 */
export interface UseRefStateActions {
  disableUpdate: () => void;
  enableUpdate: (forceUpdate?: boolean) => void;
}

/**
 * Function that receives the previous state and returns the next state.
 */
export type UseRefStateDispatch<ValueType = any> = (
  prevState: ValueType,
) => ValueType;

/**
 * Tuple returned by `useRefState`:
 * - `ref` – current value
 * - `set` – state updater function
 * - `actions` – reactivity controls
 */
export type UseRefStateReturn<ValueType = any> = readonly [
  stateRef: MutableRefObject<ValueType>,
  setRefState: (value: ValueType | UseRefStateDispatch<ValueType>) => void,
  actions: UseRefStateActions,
];
