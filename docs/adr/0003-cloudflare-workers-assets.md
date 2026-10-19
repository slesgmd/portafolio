# ADR 0003: Cloudflare Workers con assets estáticos y despliegue desde Actions

- **Estado:** propuesto (se acepta en la tarea 0.12, al elegir entre URL de versión y Previews)
- **Fecha:** 18/10/2026
- **Tarea:** 0.3

## Contexto

El sitio es un `dist/` estático (ADR 0001) que necesita cabeceras propias (`_headers`), una redirección de `/` (`_redirects`), una 404 por idioma y una URL por versión para probar los cambios antes de producción (§7, §12). Solo debe llegar a producción lo que pasó todas las compuertas, y el token de despliegue no debe quedar al alcance de una dependencia comprometida (§17, riesgo 8).

Versiones verificadas el 18/10/2026 en npm y en GitHub.

## Opciones consideradas

**Hosting**

1. **Cloudflare Workers solo con assets:** recomendación actual de Cloudflare para proyectos nuevos; admite `_headers`, `_redirects`, `not_found_handling: "404-page"` y URL de versión. `wrangler dev` reproduce el mismo enrutado en local.
2. **Cloudflare Pages:** mismas capacidades, pero Cloudflare ya orienta los proyectos nuevos a Workers (§17, riesgo 6).
3. **GitHub Pages:** no permite cabeceras propias, así que la CSP de las capas 2 y 3 (§7) sería imposible.

**Despliegue**

1. **`wrangler` desde GitHub Actions:** el despliegue depende de las compuertas de la CI.
2. **Integración Git de Cloudflare:** construye por su cuenta, sin pasar por las compuertas.

**wrangler en el job de despliegue (I4)**

1. **Checkout parcial de los manifiestos e instalación sin scripts:** el job solo descarga `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.nvmrc` y `wrangler.jsonc`, y ejecuta `pnpm install --frozen-lockfile --ignore-scripts`. wrangler y todas sus dependencias quedan en la versión del lockfile, y no hay código del proyecto que ejecutar.
2. **`pnpm dlx wrangler@<versión>`:** fija wrangler, pero resuelve sus dependencias transitivas fuera del lockfile.
3. **Un `package.json` aparte solo con wrangler:** un segundo lockfile que mantener.

## Decisión

- **Worker solo con assets**, sin código de Worker. `wrangler.jsonc` fija `assets.directory: "./dist"`, `not_found_handling: "404-page"`, `html_handling: "auto-trailing-slash"`, `workers_dev: true` y `preview_urls: true`. El nombre del Worker es `portafolio`.
- **wrangler 4.149.0** como dependencia de desarrollo. La 4.150.0 y posteriores no cumplían la edad mínima de 7 días. La `compatibility_date` es la de la versión de workerd que trae (2026-10-06).
- **Scripts de instalación de `esbuild` y `workerd` denegados** (`allowBuilds: false` en `pnpm-workspace.yaml`). Los dos comprueban el binario del paquete de plataforma, que ya instala el lockfile, y si falta lo descargan fuera de él. Se deniegan de forma explícita para que `strictDepBuilds` no haga fallar la instalación. Se comprobó que `wrangler deploy --dry-run` y `wrangler dev` funcionan sin ellos.
- **`deploy.yml`**, al fusionar en `main`:
  - reutiliza `ci.yml` (`workflow_call`) para repetir los pasos 1–5, y `ci.yml` publica `dist/` como artefacto;
  - el job `wrangler deploy` usa el entorno `production`, restringido a `main`, que guarda `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`;
  - ese job recibe `dist/` como artefacto, hace el checkout parcial de la opción 1 y no usa la caché de pnpm, para no reutilizar nada escrito por un job que ejecutó código del proyecto;
  - los despliegues no se cancelan entre sí (`cancel-in-progress: false`).
- **Token de API** de Cloudflare con el permiso mínimo para desplegar el Worker (`Workers Scripts: Edit` en la cuenta). Si `wrangler deploy` exige otro, se añade solo ese y se anota aquí.
- **`public/_headers` mínimo** con `X-Robots-Tag: noindex` en `/*`: ningún despliegue queda indexable antes de la 0.4 (§16, decisión 3).
- **Telemetría de wrangler desactivada** en los workflows (`WRANGLER_SEND_METRICS=false`) y en local (`wrangler telemetry disable`), como la de Astro.

## Consecuencias

- La prueba de humo, la anotación de la versión y la vuelta atrás (`wrangler rollback`) llegan en la tarea 0.12. Hasta entonces, un despliegue roto se corrige con otra fusión o con un rollback manual.
- El job de despliegue instala todas las dependencias de desarrollo, no solo wrangler: es más lento, pero ninguna ejecuta scripts ni código del proyecto.
- La tarea 0.12 comprueba si el permiso del token también permite desplegar desde un job de `ci.yml` (paso 10), y compara las URL de versión con Previews. La elección acepta este ADR.
- Si Cloudflare vuelve a reorientar sus productos, migrar exige cambiar `deploy.yml`, `wrangler.jsonc`, `_headers`, `_redirects` y los pasos 10 y 11 (§17, riesgo 6).
