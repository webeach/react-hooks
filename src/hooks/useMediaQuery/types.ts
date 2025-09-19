import { MediaQueryRule, MediaQueryType } from '../../types/mediaQuery';

/**
 * The return type of {@link useMediaQuery}.
 *
 * A readonly tuple with a single boolean value:
 * - `isMatches` — indicates whether the media query currently matches.
 */
export type UseMediaQueryReturn = readonly [isMatches: boolean];

/**
 * Alias of {@link MediaQueryRule}.
 *
 * Represents a single media query condition or a set of conditions
 * that can be passed into {@link useMediaQuery}.
 */
export type UseMediaQueryRule = MediaQueryRule;

/**
 * Alias of {@link MediaQueryType}.
 *
 * Represents the type of media query context.
 * - `'all'` — all devices
 * - `'screen'` — screen devices
 * - `'print'` — print devices
 */
export type UseMediaQueryType = MediaQueryType;
