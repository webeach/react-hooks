export type UseDebounceStateDispatch<State> = (
  action: UseDebounceStateSetAction<State>,
) => void;

export type UseDebounceStateReturn<State> = readonly [
  state: State,
  setDebounceState: UseDebounceStateDispatch<State>,
];

export type UseDebounceStateSetAction<State> =
  | State
  | ((state: State) => State);
