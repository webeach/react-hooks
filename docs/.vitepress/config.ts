import { defineConfig } from 'vitepress';

const hooks = [
  'useAsyncCallback',
  'useAsyncHandler',
  'useBoolean',
  'useCallbackCompare',
  'useCollection',
  'useControlled',
  'useDebounceCallback',
  'useDebounceState',
  'useDemandStructure',
  'useDeps',
  'useDOMEvent',
  'useEffectCompare',
  'useForceUpdate',
  'useFrame',
  'useFrameExtended',
  'useImageLoader',
  'useIntersectionObserver',
  'useIsomorphicLayoutEffect',
  'useLayoutEffectCompare',
  'useLiveRef',
  'useLocalStorage',
  'useLoop',
  'useMap',
  'useMediaQuery',
  'useMemoCompare',
  'useNumber',
  'useOutsideEvent',
  'usePageTitle',
  'usePageVisibility',
  'usePatchDeepState',
  'usePatchState',
  'useRefEffect',
  'useRefState',
  'useResizeObserver',
  'useSessionStorage',
  'useSet',
  'useStatus',
  'useThrottleCallback',
  'useThrottleState',
  'useTimeout',
  'useTimeoutExtended',
  'useToggle',
  'useUnmount',
  'useViewportBreakpoint',
  'useWindowEvent',
];

const enSidebar = [
  {
    text: 'Guide',
    items: [{ text: 'Quick Start', link: '/guide/getting-started' }],
  },
  {
    text: 'Hooks',
    items: hooks.map((hook) => ({ text: hook, link: `/hooks/${hook}` })),
  },
];

const ruSidebar = [
  {
    text: 'Руководство',
    items: [{ text: 'Быстрый старт', link: '/ru/guide/getting-started' }],
  },
  {
    text: 'Хуки',
    items: hooks.map((hook) => ({ text: hook, link: `/ru/hooks/${hook}` })),
  },
];

const telegramIcon = {
  svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
};

export default defineConfig({
  title: '@webeach/react-hooks',
  description: 'A set of smart React hooks for performant UIs',
  srcDir: './content',
  rewrites: { 'en/:rest*': ':rest*' },

  head: [['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }]],

  locales: {
    root: {
      label: '🇬🇧 English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'Hooks', link: '/hooks/useBoolean' },
        ],
        sidebar: enSidebar,
      },
    },
    ru: {
      label: '🇷🇺 Русский',
      lang: 'ru',
      themeConfig: {
        nav: [
          { text: 'Руководство', link: '/ru/guide/getting-started' },
          { text: 'Хуки', link: '/ru/hooks/useBoolean' },
        ],
        sidebar: ruSidebar,
        outline: { label: 'На этой странице', level: [2, 3] },
        docFooter: { prev: 'Предыдущая страница', next: 'Следующая страница' },
        returnToTopLabel: 'Наверх',
        sidebarMenuLabel: 'Меню',
        darkModeSwitchLabel: 'Тема',
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: false,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/webeach/react-hooks' },
      { icon: telegramIcon, link: 'https://t.me/webeach_ru' },
    ],
    search: { provider: 'local' },
  },
});
