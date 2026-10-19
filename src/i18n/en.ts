import type { Dict } from './dict.ts';
import type { es } from './es.ts';

export const en = {
  site: {
    name: 'Portfolio',
    description: 'Personal toolbox that runs in the browser.',
  },
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
    title: 'Home',
    heading: 'Portfolio',
    body: 'Under construction.',
  },
  about: {
    title: 'About',
    heading: 'About',
    body: 'Under construction.',
  },
  notFound: {
    title: 'Page not found',
    heading: 'Page not found',
    body: 'The address does not match any page on this site.',
    home: 'Go to the home page',
  },
} satisfies Dict<typeof es>;
