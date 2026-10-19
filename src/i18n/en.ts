import type { Dict } from './dict.ts';
import type { es } from './es.ts';

export const en = {
  skipLink: 'Skip to content',
  nav: {
    label: 'Main',
  },
  theme: {
    label: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  footer: {
    source: 'Source code',
  },
  langSwitch: {
    label: 'Language',
    name: 'English',
  },
  home: {
    toolsLink: 'See the tools',
    aboutLink: 'More about me',
  },
  tools: {
    title: 'Tools',
    heading: 'Tools',
    description: 'Tools that run entirely in the browser.',
    empty: 'No tools yet.',
    beta: 'beta',
  },
  about: {
    title: 'About',
    heading: 'About',
  },
  notFound: {
    title: 'Page not found',
    heading: 'Page not found',
    body: 'The address does not match any page on this site.',
    home: 'Go to the home page',
  },
} satisfies Dict<typeof es>;
