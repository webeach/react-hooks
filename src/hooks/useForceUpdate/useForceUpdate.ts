import { useCallback, useState } from 'react';

/**
 * React hook that forces a component re-render.
 *
 * Useful when you need to trigger a re-render manually
 * (e.g., after external mutation or imperative API interaction).
 *
 * Optionally, you can pass a callback to be executed
 * right before the re-render occurs.
 *
 * @example
 * ```tsx
 * const forceUpdate = useForceUpdate();
 *
 * const handleClick = () => {
 *   mutateSomething();
 *   forceUpdate(); // triggers re-render
 * };
 *
 * const handleWithCallback = () => {
 *   forceUpdate(() => {
 *     console.log('Before re-render');
 *   });
 * };
 * ```
 *
 * @returns A function that triggers a re-render when called.
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useForceUpdate.md
 */
export function useForceUpdate() {
  const [, setState] = useState<object>();

  return useCallback((onBeforeUpdate?: () => void) => {
    if (onBeforeUpdate) {
      return setState(() => {
        onBeforeUpdate();
        return {};
      });
    }

    return setState({});
  }, []);
}
