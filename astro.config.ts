import { defineConfig } from 'astro/config';

// `site`, `trailingSlash` y la i18n llegan en la tarea 0.5.
export default defineConfig({
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
    },
  },
});
