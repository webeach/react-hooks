import { __DEVELOPMENT__ } from '../../../constants/common';
import { BreakpointBaseKey } from '../types';

/**
 * Validates a single breakpoint entry `[key, value]`.
 *
 * - A breakpoint value must be a **non-negative finite number**.
 * - If the value is invalid and `__DEVELOPMENT__` is enabled, a warning is logged.
 * - Returns `true` only for valid entries, otherwise `false`.
 *
 * @param entry - A tuple `[key, value]` where:
 *   - `key` is a breakpoint identifier (extends `BreakpointBaseKey`).
 *   - `value` is the numeric pixel value for the breakpoint.
 *
 * @returns `true` if the breakpoint value is valid, otherwise `false`.
 *
 * @example
 * validateBreakpointEntry(['mobile', 0]);       // true
 * validateBreakpointEntry(['tablet', 768]);    // true
 * validateBreakpointEntry(['desktop', -100]);  // false (negative)
 * validateBreakpointEntry(['wide', Infinity]); // false (non-finite)
 */
export function validateBreakpointEntry([key, value]: [
  BreakpointBaseKey,
  number,
]) {
  if (value < 0 || !Number.isFinite(value)) {
    if (__DEVELOPMENT__) {
      console.warn(`Invalid breakpoint value: ${key.toString()} = ${value}"`);
    }

    return false;
  }

  return true;
}
