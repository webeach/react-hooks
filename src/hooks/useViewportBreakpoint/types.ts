/**
 * Base type for breakpoint keys.
 * Can be a `string` or a `symbol`.
 */
export type BreakpointBaseKey = string | symbol;

/**
 * A map of breakpoints to their matching state.
 *
 * @example
 * {
 *   mobile: true,
 *   tablet: false,
 *   desktop: false
 * }
 */
export type UseViewportBreakpointMatches<
  BreakpointKey extends BreakpointBaseKey = BreakpointBaseKey,
> = Record<BreakpointKey, boolean>;

/**
 * Options for configuring `useViewportBreakpoint`.
 */
export type UseViewportBreakpointOptions<
  BreakpointKey extends BreakpointBaseKey = BreakpointBaseKey,
> = {
  /**
   * A fallback breakpoint key that is considered active
   * when none of the media queries currently match.
   */
  defaultBreakpoint?: BreakpointKey;
};

/**
 * Combined return type of `useViewportBreakpoint`, supporting both tuple and object access.
 *
 * You can use it either as:
 * - Tuple: `[matches, activeBreakpoint]`
 * - Object: `{ matches, activeBreakpoint }`
 */
export type UseViewportBreakpointReturn<
  BreakpointKey extends BreakpointBaseKey = BreakpointBaseKey,
> = UseViewportBreakpointReturnObject<BreakpointKey> &
  UseViewportBreakpointReturnTuple<BreakpointKey>;

/**
 * Object-style return from `useViewportBreakpoint`.
 */
export type UseViewportBreakpointReturnObject<
  BreakpointKey extends BreakpointBaseKey = BreakpointBaseKey,
> = {
  /**
   * The currently active breakpoint key, or `null` if none matches.
   */
  activeBreakpoint: BreakpointKey | null;

  /**
   * A record of all breakpoints with their current matching state.
   */
  matches: UseViewportBreakpointMatches;
};

/**
 * Tuple-style return from `useViewportBreakpoint`.
 */
export type UseViewportBreakpointReturnTuple<
  BreakpointKey extends BreakpointBaseKey = BreakpointBaseKey,
> = readonly [
  /**
   * A record of all breakpoints with their current matching state.
   */
  matches: UseViewportBreakpointMatches,

  /**
   * The currently active breakpoint key, or `null` if none matches.
   */
  activeBreakpoint: BreakpointKey | null,
];
