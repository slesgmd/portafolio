// Contenido editorial: todos los derechos reservados (LICENSE-CONTENT), no MIT. Los textos de
// interfaz van en `es.ts` y `en.ts` (ADR 0009).
import { assertSameKeys, type Dict } from './dict.ts';
import type { Locale } from './routes.ts';

const es = {
  description:
    'Herramientas que funcionan en tu navegador sin enviar tus datos. Sin cuentas ni analítica.',
  home: {
    lead: 'Herramientas que funcionan por completo en tu navegador. Lo que escribes o abres no sale de tu equipo: sin cuentas ni analítica.',
    intro: 'Soy Sebastián Lescano, estudiante de Ciencia de la Computación en UTEC.',
  },
  about: {
    intro:
      'Soy Sebastián Lescano y estudio Ciencia de la Computación en UTEC, en Perú. Me interesan la ciberseguridad, el desarrollo web, la matemática aplicada y el aprendizaje automático, sobre todo las redes neuronales.',
    motivation:
      'Hice este sitio porque quería herramientas propias, que me ayuden a organizarme y que pueda modificar a mi gusto. También quería un proyecto mío que mostrar en GitHub.',
    stack:
      'Está hecho con TypeScript y Astro, y se despliega en Cloudflare Workers mediante GitHub Actions. En cada proyecto aprendo lo que haga falta.',
    code: 'Mi código está en GitHub:',
  },
};

const en = {
  description:
    'Tools that run in your browser without sending your data. No accounts, no analytics.',
  home: {
    lead: 'Tools that run entirely in your browser. Nothing you type or open leaves your device: no accounts, no analytics.',
    intro: "I'm Sebastián Lescano, a Computer Science student at UTEC.",
  },
  about: {
    intro:
      "I'm Sebastián Lescano, a Computer Science student at UTEC in Peru. I'm interested in cybersecurity, web development, applied mathematics and machine learning, especially neural networks.",
    motivation:
      'I built this site because I wanted my own tools, ones that help me stay organized and that I can adapt as I see fit. I also wanted a personal project to show on GitHub.',
    stack:
      "It's built with TypeScript and Astro and deployed to Cloudflare Workers through GitHub Actions. I pick up whatever each project requires.",
    code: 'My code is on GitHub:',
  },
} satisfies Dict<typeof es>;

assertSameKeys('Contenido editorial en', es, en);

export type Editorial = Dict<typeof es>;

const byLocale: Record<Locale, Editorial> = { es, en };

export const editorial = (locale: Locale): Editorial => byLocale[locale];
