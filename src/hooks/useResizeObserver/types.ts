export type UseResizeObserverCallback = (entry: ResizeObserverEntry) => void;

export type UseResizeObserverReturn = UseResizeObserverReturnTuple &
  UseResizeObserverReturnObject;

export type UseResizeObserverReturnObject = {
  currentEntry: ResizeObserverEntry | null;
};

export type UseResizeObserverReturnTuple = readonly [
  currentEntry: ResizeObserverEntry | null,
];
