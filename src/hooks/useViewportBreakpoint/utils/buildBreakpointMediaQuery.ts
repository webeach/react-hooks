/**
 * Builds a CSS media query string for a single breakpoint.
 *
 * - Always includes a `min-width` condition.
 * - Unlike range-based queries, this only checks for a minimum width.
 * - Used internally by `useViewportBreakpoint` for generating MediaQueryList instances.
 *
 * @param minWidth - The minimum viewport width in pixels (inclusive).
 *
 * @returns A CSS media query string in the form: `"(min-width: Xpx)"`.
 *
 * @example
 * buildBreakpointMediaQuery(0);
 * // → "(min-width: 0px)"
 *
 * buildBreakpointMediaQuery(1200);
 * // → "(min-width: 1200px)"
 */
export function buildBreakpointMediaQuery(minWidth: number) {
  return `(min-width: ${minWidth}px)`;
}
