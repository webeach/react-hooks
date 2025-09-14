export type UseThrottleStateDispatch<State> = (
  action: UseThrottleStateSetAction<State>,
) => void;

export type UseThrottleStateReturn<State> = readonly [
  state: State,
  setThrottleState: UseThrottleStateDispatch<State>,
];

export type UseThrottleStateSetAction<State> =
  | State
  | ((state: State) => State);
