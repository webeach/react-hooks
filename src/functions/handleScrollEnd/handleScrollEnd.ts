import { HandleScrollEndOptions, HandleScrollEndResult } from './types';

/**
 * Detects which scroll directions have reached the defined threshold.
 *
 * @param options - Configuration containing current/previous scroll values,
 * thresholds, and enabled directions.
 * @returns A map of directions that have reached the scroll end.
 */
export function handleScrollEnd(
  options: HandleScrollEndOptions,
): HandleScrollEndResult {
  const {
    sides,
    threshold,
    values: {
      maxAllowedScrollLeft,
      maxAllowedScrollTop,
      prevScrollLeft,
      prevScrollTop,
      scrollLeft,
      scrollTop,
    },
  } = options;

  return {
    bottom: sides.bottom
      ? prevScrollTop < scrollTop &&
        scrollTop >= maxAllowedScrollTop - threshold.bottom
      : false,
    left: sides.left
      ? prevScrollLeft > scrollLeft && scrollLeft <= threshold.left
      : false,
    right: sides.right
      ? prevScrollLeft < scrollLeft &&
        scrollLeft >= maxAllowedScrollLeft - threshold.right
      : false,
    top: sides.top
      ? prevScrollTop > scrollTop && scrollTop <= threshold.top
      : false,
  };
}
