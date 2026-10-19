import { createHash } from 'node:crypto';
import { defineConfig } from 'astro/config';
import { themeScript } from './src/components/theme.ts';

// Hash de un script inline para la CSP, en el formato de `security.csp`.
const sha256 = (source: string): `sha256-${string}` =>
  `sha256-${createHash('sha256').update(source).digest('base64')}`;

export default defineConfig({
  // Sin dominio propio, el sitio se sirve en `workers.dev` (§16, decisión 3). Cambia
  // `canonical`, `hreflang` y el sitemap.
  site: 'https://portafolio.s-lesgmd.workers.dev',
  // Todas las URL terminan en `/` (§5.7, ADR 0006).
  trailingSlash: 'always',
  build: {
    // Cada archivo de `src/pages/` se emite con su nombre: `[lang]/404.astro` da
    // `es/404.html`, que Cloudflare sirve como 404 del idioma (§5.7). Con 'directory'
    // daría `es/404/index.html`. Las demás páginas son `index.astro` dentro de su
    // carpeta, así que sus URL siguen terminando en `/` (ADR 0006).
    format: 'preserve',
  },
  security: {
    // Capa 1 de la CSP (PLAN §7, ADR 0004): `<meta http-equiv>` con los hashes de los
    // scripts y estilos que Astro empaqueta. `frame-ancestors` no vale en `<meta>` y va
    // en la cabecera de las páginas (capa 2, `public/_headers`).
    csp: {
      directives: [
        "default-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
        "worker-src 'self'",
      ],
      // Astro no calcula el hash de los scripts `is:inline`. El del tema se calcula
      // aquí a partir de su fuente, así que no se desincroniza (§7, ADR 0008).
      scriptDirective: { hashes: [sha256(themeScript)] },
    },
  },
});
