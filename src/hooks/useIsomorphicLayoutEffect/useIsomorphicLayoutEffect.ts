import { useEffect, useLayoutEffect } from 'react';

import { isBrowser } from '../../constants/common';

/**
 * A safe version of `useLayoutEffect` that falls back to `useEffect` on the server.
 *
 * - On the client (browser environment), it behaves like `useLayoutEffect`.
 * - On the server (e.g., during SSR), it uses `useEffect` to avoid React warnings.
 *
 * @remarks
 * This hook helps prevent the "useLayoutEffect does nothing on the server" warning
 * when rendering React components with server-side rendering.
 *
 * @example
 * ```tsx
 * import { useIsomorphicLayoutEffect } from '@webeach/react-hooks';
 *
 * function Component() {
 *   useIsomorphicLayoutEffect(() => {
 *     console.log('Runs layout effect only in the browser');
 *   }, []);
 *   return <div />;
 * }
 * ```
 *
 * @see https://github.com/webeach/react-hooks/blob/main/docs/en/useIsomorphicLayoutEffect.md
 */
export const useIsomorphicLayoutEffect = isBrowser
  ? useLayoutEffect
  : useEffect;
