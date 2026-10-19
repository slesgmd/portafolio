import type { Dict } from './dict.ts';
import type { es } from './es.ts';

export const en = {
  site: {
    description:
      'Tools that run in your browser without sending your data. No accounts, no analytics.',
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
    lead: 'Tools that run entirely in your browser. Nothing you type or open leaves your device: no accounts, no analytics.',
    toolsLink: 'See the tools',
    intro: "I'm Sebastián Lescano, a Computer Science student at UTEC.",
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
    intro:
      "I'm Sebastián Lescano, a Computer Science student at UTEC in Peru. I'm interested in cybersecurity, web development, applied mathematics and machine learning, especially neural networks.",
    motivation:
      'I built this site because I wanted my own tools, ones that help me stay organized and that I can adapt as I see fit. I also wanted a personal project to show on GitHub.',
    stack:
      "It's built with TypeScript and Astro and deployed to Cloudflare Workers through GitHub Actions. I pick up whatever each project requires.",
    code: 'My code is on GitHub:',
  },
  notFound: {
    title: 'Page not found',
    heading: 'Page not found',
    body: 'The address does not match any page on this site.',
    home: 'Go to the home page',
  },
} satisfies Dict<typeof es>;
