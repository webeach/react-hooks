/**
 * Callback function for `usePageVisibility`.
 *
 * Called whenever the document visibility changes.
 *
 * @param isVisible - `true` if the page is currently visible, `false` if hidden.
 */
export type UsePageVisibilityCallback = (isVisible: boolean) => void;

/**
 * Combined return type of `usePageVisibility`, supporting both tuple and object access.
 *
 * You can use it either as:
 * - Tuple: `[isVisible]`
 * - Object: `{ isVisible }`
 */
export type UsePageVisibilityReturn = UsePageVisibilityReturnTuple &
  UsePageVisibilityReturnObject;

/**
 * Object-style return from `usePageVisibility`.
 */
export type UsePageVisibilityReturnObject = {
  /**
   * Whether the page is currently visible.
   */
  isVisible: boolean;
};

/**
 * Tuple-style return from `usePageVisibility`.
 */
export type UsePageVisibilityReturnTuple = readonly [
  /**
   * Whether the page is currently visible.
   */
  isVisible: boolean,
];
