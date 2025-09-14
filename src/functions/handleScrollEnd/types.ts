/**
 * Possible scroll directions to detect for end-of-scroll.
 */
export type HandleScrollEndSide = 'bottom' | 'left' | 'right' | 'top';

/**
 * Scroll state and thresholds used to determine if the scroll
 * has reached the end in any specified direction.
 */
export interface HandleScrollEndValues {
  /**
   * The maximum allowed scrollLeft value (e.g., scrollWidth - clientWidth).
   */
  maxAllowedScrollLeft: number;

  /**
   * The maximum allowed scrollTop value (e.g., scrollHeight - clientHeight).
   */
  maxAllowedScrollTop: number;

  /**
   * The previous scrollLeft value before the current event.
   */
  prevScrollLeft: number;

  /**
   * The previous scrollTop value before the current event.
   */
  prevScrollTop: number;

  /**
   * The current scrollLeft value.
   */
  scrollLeft: number;

  /**
   * The current scrollTop value.
   */
  scrollTop: number;
}

/**
 * Options for handling scroll-end detection.
 */
export interface HandleScrollEndOptions {
  /**
   * Specifies which directions to monitor.
   * Example: { bottom: true, right: true }
   */
  sides: Partial<Record<HandleScrollEndSide, boolean>>;

  /**
   * Thresholds for how close to the edge should be considered "at the end".
   * Example: { bottom: 100, right: 50 }
   */
  threshold: Record<HandleScrollEndSide, number>;

  /**
   * Current and previous scroll values and calculated max values.
   */
  values: HandleScrollEndValues;
}

/**
 * Result of evaluating scroll-end state for each enabled side.
 * A value of `true` means the scroll is at the end in that direction.
 */
export type HandleScrollEndResult = Record<HandleScrollEndSide, boolean>;
