/**
 * Possible values for the CSS `display-mode` media feature.
 *
 * - `'browser'` — default browser window/tab context.
 * - `'minimal-ui'` — minimal UI mode (reduced browser UI, if supported).
 * - `'standalone'` — standalone application context (e.g., PWA).
 * - `'fullscreen'` — fullscreen context without browser UI.
 * - `'picture-in-picture'` — floating PiP window mode.
 */
type DisplayModeValue =
  | 'browser'
  | 'minimal-ui'
  | 'standalone'
  | 'fullscreen'
  | 'picture-in-picture';

/**
 * Possible values for the CSS `hover` and `any-hover` media features.
 *
 * - `'hover'` — primary input can hover over elements.
 * - `'none'` — no hover capability (e.g., most touchscreens).
 */
type HoverValue = 'hover' | 'none';

/**
 * Possible values for the CSS `orientation` media feature.
 *
 * - `'portrait'` — viewport height > width.
 * - `'landscape'` — viewport width > height.
 */
type OrientationValue = 'portrait' | 'landscape';

/**
 * Possible values for the CSS `pointer` and `any-pointer` media features.
 *
 * - `'none'` — no pointing device available.
 * - `'coarse'` — imprecise pointer (e.g., finger).
 * - `'fine'` — precise pointer (e.g., mouse, stylus).
 */
type PointerValue = 'none' | 'coarse' | 'fine';

/**
 * Possible values for the CSS `prefers-color-scheme` media feature.
 *
 * - `'dark'` — user prefers dark theme.
 * - `'light'` — user prefers light theme.
 */
type PrefersColorSchemeValue = 'dark' | 'light';

/**
 * Possible values for the CSS `prefers-contrast` media feature.
 *
 * - `'more'` — user prefers higher contrast.
 * - `'less'` — user prefers lower contrast.
 * - `'no-preference'` — no explicit preference.
 * - `'custom'` — custom contrast setting chosen by user.
 */
type PrefersContrastValue = 'more' | 'less' | 'no-preference' | 'custom';

/**
 * Possible values for the CSS `prefers-reduced-motion` media feature.
 *
 * - `'reduce'` — user prefers reduced motion.
 * - `'no-preference'` — no explicit preference.
 */
type PrefersReducedMotionValue = 'reduce' | 'no-preference';

/**
 * Represents the full set of supported media query conditions.
 *
 * Each property corresponds to a CSS media feature.
 * Values are type-safe and match the spec where possible.
 */
export interface MediaQueryRule {
  /** Matches any available hover input devices. */
  anyHover?: HoverValue;

  /** Matches any available pointer input devices. */
  anyPointer?: PointerValue;

  /** Matches the `aspect-ratio` feature as `[width, height]`. */
  aspectRatio?: readonly [number, number];

  /** Matches the `display-mode` feature (browser, standalone, etc.). */
  displayMode?: DisplayModeValue;

  /** Matches whether the primary input device supports hover. */
  hover?: HoverValue;

  /** Maximum resolution in dots per pixel (`dppx`). */
  maxResolution?: number;

  /** Maximum viewport width in pixels. */
  maxWidth?: number;

  /** Minimum resolution in dots per pixel (`dppx`). */
  minResolution?: number;

  /** Minimum viewport width in pixels. */
  minWidth?: number;

  /** Matches the screen orientation (`portrait` or `landscape`). */
  orientation?: OrientationValue;

  /** Matches the primary input device’s pointing accuracy. */
  pointer?: PointerValue;

  /** Matches the user’s preferred color scheme. */
  prefersColorScheme?: PrefersColorSchemeValue;

  /** Matches the user’s contrast preference. */
  prefersContrast?: PrefersContrastValue;

  /** Matches the user’s motion preference. */
  prefersReducedMotion?: PrefersReducedMotionValue;
}

/**
 * Keys of {@link MediaQueryRule}.
 * Useful for building or validating dynamic query objects.
 */
export type MediaQueryRuleKey = keyof MediaQueryRule;

/**
 * The type of media query context.
 *
 * - `'all'` — all devices.
 * - `'screen'` — screen devices only.
 * - `'print'` — print and print-preview contexts.
 */
export type MediaQueryType = 'all' | 'screen' | 'print';
