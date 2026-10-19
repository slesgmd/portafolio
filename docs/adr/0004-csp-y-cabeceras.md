# ADR 0004: CSP en tres capas y cabeceras de seguridad

- **Estado:** aceptado
- **Fecha:** 18/10/2026
- **Tarea:** 0.4

## Contexto

El sitio ejecuta herramientas en el navegador y, desde la F1, renderiza Markdown arbitrario (§7). Una CSP sin `unsafe-inline` limita el daño de un XSS, pero tiene tres límites prácticos:

- Astro solo genera la CSP como `<meta http-equiv>` (`security.csp`), con los hashes de lo que empaqueta. No la aplica en `astro dev`.
- Una CSP en `<meta>` ignora `frame-ancestors`.
- Los workers dedicados y el service worker no heredan la CSP del documento: aplican la que llega en las cabeceras de la respuesta de su script.

Cloudflare suma las reglas de `_headers` que coinciden con una petición y une los valores de una cabecera repetida. Las redirecciones de `_redirects` se aplican antes que las cabeceras.

## Opciones consideradas

1. **Tres capas: `<meta>` de Astro, cabecera de las páginas y cabecera de los scripts.** Cada capa cubre lo que las otras no pueden.
2. **Toda la CSP en cabeceras de `_headers`:** exigiría copiar a mano los hashes de cada build, que cambian con cada script.
3. **Solo la `<meta>` de Astro:** sin `frame-ancestors` y sin CSP en los workers.

## Decisión

Se adopta la opción 1, tal como la describe la §7:

- **Capa 1** (`astro.config.ts`, `security.csp`): Astro emite `script-src` y `style-src` con hashes, y se añaden `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'none'` y `worker-src 'self'`. Algoritmo por defecto (SHA-256).
- **Capa 2** (`public/_headers`, `/*`): `Content-Security-Policy: frame-ancestors 'none'`. No lleva directivas de recursos: el navegador exige cumplir todas las políticas, y un `default-src` aquí bloquearía los scripts autorizados por hash en la `<meta>`.
- **Capa 3** (`public/_headers`, `/_astro/*`, la carpeta de `build.assets`): `Content-Security-Policy: default-src 'self'; connect-src 'none'`. En los scripts que no se ejecutan como worker no tiene efecto. El service worker de la F3 tendrá su propia regla en la raíz, con `connect-src 'self'`.
- **Cabeceras de `/*`:** `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`, `Cross-Origin-Opener-Policy: same-origin` y `X-Robots-Tag: noindex` (§16, decisión 3).
- **Sin `Strict-Transport-Security`** hasta que haya dominio propio.
- **Caché:** `public, max-age=31536000, immutable` en `/_astro/*`. El HTML usa la cabecera por defecto de Cloudflare (`public, max-age=0, must-revalidate`); no se define `Cache-Control` en `/*`, porque se uniría al de `/_astro/*`.
- **`public/_redirects`:** `/ /es/ 302` (§5.7). Hasta la tarea 0.5, la página provisional vive en `src/pages/es/index.astro` para que la redirección tenga destino.

## Comprobación

Con `wrangler dev` sirviendo el build (18/10/2026):

- `/` responde 302 con `Location: /es/`, y `/es/` responde 200 con todas las cabeceras de `/*`.
- Un script de prueba en `dist/_astro/` recibe las dos CSP, y su `Cache-Control` sustituye al de Cloudflare.
- `wrangler dev` envía las dos CSP como dos cabeceras separadas, no unidas con coma. Para el navegador es lo mismo, así que las pruebas de cabeceras (pasos 8 y 11) deben aceptar las dos formas.
- La `<meta>` generada contiene las directivas de la capa 1 y los hashes de los scripts de Astro.

## Consecuencias

- La CSP se comprueba siempre sobre el build: los pasos 6, 8 y 11 llegan en la F0b (tareas 0.10 a 0.12). Hasta entonces, se comprueba a mano en producción (criterio de aceptación de la F0a).
- Todo script inline necesita hash. Un `define:vars`, un `style=` o un manejador `on*=` romperían la página en producción, y `verify-dist.ts` (0.10) los rechazará.
- Si Astro cambia la carpeta de `build.assets`, la regla de la capa 3 deja de aplicarse sin aviso: el paso 6 comprueba la regla, y desde la F1 las E2E comprueban la URL real de cada worker (§17, riesgo 12).
- Al fijar el dominio, `X-Robots-Tag` pasa a la regla de host de `workers.dev` y se añade `Strict-Transport-Security` (§7).
