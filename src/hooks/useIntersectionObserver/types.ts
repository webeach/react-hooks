/**
 * Callback invoked whenever the observed element's intersection state changes.
 *
 * @param entry - The latest IntersectionObserverEntry.
 */
export type UseIntersectionObserverCallback = (
  entry: IntersectionObserverEntry,
) => void;

/**
 * The return type of `useIntersectionObserver`.
 * Can be used as both a tuple and an object.
 */
export type UseIntersectionObserverReturn = UseIntersectionObserverReturnTuple &
  UseIntersectionObserverReturnObject;

/**
 * Object form of the return value.
 */
export type UseIntersectionObserverReturnObject = {
  /** The latest IntersectionObserverEntry, or null if not yet observed. */
  currentEntry: IntersectionObserverEntry | null;
};

/**
 * Tuple form of the return value.
 */
export type UseIntersectionObserverReturnTuple = readonly [
  /** The latest IntersectionObserverEntry, or null if not yet observed. */
  currentEntry: IntersectionObserverEntry | null,
];
