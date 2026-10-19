import { createHash } from 'node:crypto';
import { defineConfig } from 'astro/config';
import { themeScript } from './src/components/theme-script.ts';
import { layerOrder } from './src/layouts/layer-order.ts';

const cspHash = (source: string): `sha256-${string}` =>
  `sha256-${createHash('sha256').update(source).digest('base64')}`;

export default defineConfig({
  // Sin dominio propio (§16, decisión 3). Cambiarlo cambia `canonical`, `hreflang` y el
  // sitemap.
  site: 'https://portafolio.s-lesgmd.workers.dev',
  trailingSlash: 'always',
  build: {
    // `[lang]/404.astro` debe emitirse como `es/404.html`, la 404 del idioma para
    // Cloudflare; con 'directory' sería `es/404/index.html` (§5.7, ADR 0006).
    format: 'preserve',
  },
  security: {
    // Capa 1 (§7, ADR 0004). `frame-ancestors` no vale en `<meta>`: va en `_headers`.
    csp: {
      directives: [
        "default-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
        "worker-src 'self'",
      ],
      // Astro no calcula el hash de los `is:inline`. Calcularlo desde la fuente evita que
      // se desincronice (ADR 0008, ADR 0013).
      scriptDirective: { hashes: [cspHash(themeScript)] },
      styleDirective: { hashes: [cspHash(layerOrder)] },
    },
  },
});
