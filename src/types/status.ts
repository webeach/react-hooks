import { ErrorLike } from './common';

/**
 * Represents a demand-structured accessor object for a specific status key.
 *
 * @template Key - One of the status keys (`isPending`, `isSuccess`, `isError`)
 * @template State - The corresponding `StatusStateMap` shape
 */
type StatusDemandStructureStatusItem<
  Key extends 'isPending' | 'isSuccess' | 'isError',
  State extends StatusStateTypeAny,
> = {
  accessor: () => State[Key];
  alias: Key;
};

/**
 * Ordered structure of status keys with corresponding accessors and aliases.
 * Used for building demand-evaluated data structures from status state.
 *
 * @template StatusType - The specific status type for which the structure is built
 */
type StatusDemandStructureStatusMap<StatusType extends Status> = readonly [
  isPending: StatusDemandStructureStatusItem<
    'isPending',
    StatusStateMap<StatusType>
  >,
  isSuccess: StatusDemandStructureStatusItem<
    'isSuccess',
    StatusStateMap<StatusType>
  >,
  isError: StatusDemandStructureStatusItem<
    'isError',
    StatusStateMap<StatusType>
  >,
  error: {
    accessor: () => StatusType extends 'error' ? ErrorLike | null : null;
    alias: 'error';
  },
];

/**
 * Union of all possible status states.
 */
export type Status = 'initial' | 'pending' | 'success' | 'error';

/**
 * Represents any of the possible object-based status states.
 */
export type StatusStateTypeAny =
  | StatusStateTypeError
  | StatusStateTypeInitial
  | StatusStateTypePending
  | StatusStateTypeSuccess;

/**
 * Represents any of the possible tuple-based status states.
 */
export type StatusStateTypeAnyTuple =
  | StatusStateTypeErrorTuple
  | StatusStateTypeInitialTuple
  | StatusStateTypePendingTuple
  | StatusStateTypeSuccessTuple;

/**
 * Status state when the status is `'error'`.
 */
export type StatusStateTypeError = {
  error: ErrorLike | null;
  isError: true;
  isPending: false;
  isSuccess: false;
};

/**
 * Tuple representation of the `'error'` status state.
 */
export type StatusStateTypeErrorTuple = readonly [
  isPending: false,
  isSuccess: false,
  isError: true,
  error: ErrorLike | null,
];

/**
 * Status state when the status is `'initial'`.
 */
export type StatusStateTypeInitial = {
  error: null;
  isError: false;
  isPending: false;
  isSuccess: false;
};

/**
 * Tuple representation of the `'initial'` status state.
 */
export type StatusStateTypeInitialTuple = readonly [
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
];

/**
 * Status state when the status is `'pending'`.
 */
export type StatusStateTypePending = {
  error: null;
  isError: false;
  isPending: true;
  isSuccess: false;
};

/**
 * Tuple representation of the `'pending'` status state.
 */
export type StatusStateTypePendingTuple = readonly [
  isPending: true,
  isSuccess: false,
  isError: false,
  error: null,
];

/**
 * Status state when the status is `'success'`.
 */
export type StatusStateTypeSuccess = {
  error: null;
  isError: false;
  isPending: false;
  isSuccess: true;
};

/**
 * Tuple representation of the `'success'` status state.
 */
export type StatusStateTypeSuccessTuple = readonly [
  isPending: false,
  isSuccess: true,
  isError: false,
  error: null,
];

/**
 * Object-based status state mapped from a given `Status` value.
 * If `StatusType` is not specified, returns a union of all possible object shapes.
 */
export type StatusStateMap<StatusType extends Status | unknown = unknown> =
  StatusType extends 'error'
    ? StatusStateTypeError
    : StatusType extends 'pending'
      ? StatusStateTypePending
      : StatusType extends 'success'
        ? StatusStateTypeSuccess
        : StatusType extends 'initial'
          ? StatusStateTypeInitial
          : StatusStateTypeAny;

/**
 * Demand-based structure for a specific status.
 * If no `StatusType` is provided, returns a union of all status-specific structures.
 */
export type StatusStateMapDemandStructure<
  StatusType extends Status | unknown = unknown,
> = StatusType extends Status
  ? StatusDemandStructureStatusMap<StatusType>
  :
      | StatusDemandStructureStatusMap<'error'>
      | StatusDemandStructureStatusMap<'initial'>
      | StatusDemandStructureStatusMap<'pending'>
      | StatusDemandStructureStatusMap<'success'>;

/**
 * Tuple-based status state mapped from a given `Status` value.
 * If `StatusType` is not specified, returns a union of all possible tuple shapes.
 */
export type StatusStateMapTuple<StatusType extends Status | unknown = unknown> =
  StatusType extends 'error'
    ? StatusStateTypeErrorTuple
    : StatusType extends 'pending'
      ? StatusStateTypePendingTuple
      : StatusType extends 'success'
        ? StatusStateTypeSuccessTuple
        : StatusType extends 'initial'
          ? StatusStateTypeInitialTuple
          : StatusStateTypeAnyTuple;
