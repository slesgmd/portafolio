# Portafolio

Sitio personal, estático y bilingüe (español e inglés) que funciona como caja de herramientas propia y, en segundo plano, como portafolio. Cada herramienta se ejecuta por completo en el navegador: ningún dato sale de él.

**Estado:** en construcción (fase F0a). El plan está en [`docs/PLAN.md`](docs/PLAN.md) y las decisiones, en [`docs/adr/`](docs/adr/).

## Requisitos

- Node 24 LTS (ver `.nvmrc`).
- pnpm, en la versión fijada en `packageManager` de `package.json`.

## Instalar

```sh
pnpm install
pnpm hooks:install # activa los hooks de .githooks/ (core.hooksPath)
```

## Desarrollar

```sh
pnpm dev
```

La CSP no se aplica en `astro dev`; se comprueba sobre el build.

## Comprobar y construir

```sh
pnpm check        # tipos (astro check y tsc de las capas puras)
pnpm lint         # ESLint, con las fronteras entre capas (ADR 0005)
pnpm format       # aplica Prettier
pnpm format:check # comprueba el formato sin cambiar archivos
pnpm provenance   # comprobación de procedencia de commits y archivos (PLAN §12)
pnpm build        # genera dist/
pnpm preview      # sirve dist/ en local
```

Hooks de git:

- `pre-commit` pasa Prettier y ESLint sobre los archivos preparados, y las pruebas de core y domain.
- `commit-msg` valida el formato Conventional Commits y elimina las líneas de atribución.

La CI (`.github/workflows/ci.yml`) ejecuta en cada PR los pasos 1–5 de la §12 del plan y, en paralelo, sus pruebas negativas (`tests/gates/`).

## Dependencias

Renovate abre las PR de actualización según `renovate.json`: edad mínima de 7 días, versiones no mayores agrupadas en una PR, cada mayor por separado y los SHA de las acciones de GitHub al día (PLAN §7, ADR 0002).

## Probar

```sh
pnpm test          # Vitest
pnpm test:coverage # Vitest con cobertura (umbral en core y domain, ADR 0010)
pnpm gates         # pruebas negativas: cada caso de tests/gates/ debe hacer fallar su compuerta
```

Pendiente: Playwright y Lighthouse (F0b).

## Previsualizar y desplegar

El sitio es un Worker de Cloudflare solo con assets estáticos (`wrangler.jsonc`, ADR 0003).

```sh
pnpm build
pnpm exec wrangler telemetry disable # una vez por equipo
pnpm exec wrangler dev               # sirve dist/ con _headers, _redirects y la 404, como en producción
```

Al fusionar en `main`, `.github/workflows/deploy.yml` repite los pasos de la CI y ejecuta `wrangler deploy` en el entorno `production` de GitHub, el único que tiene el token de Cloudflare. No se despliega a mano.

Pendiente: vista previa por PR, prueba de humo y vuelta atrás (tarea 0.12).

## Arquitectura

Detalle en PLAN §5 y en los ADR 0005, 0011 y 0014.

| Capa | Carpeta | Contenido |
|---|---|---|
| core | `src/core/` | `Result`, puertos (almacenamiento, hash, reloj) y persistencia versionada. TypeScript puro |
| platform | `src/platform/` | Implementaciones de los puertos con APIs del navegador y la carga diferida de la interfaz |
| i18n | `src/i18n/` | Diccionarios `es`/`en`, rutas localizadas y `defineToolTexts` |
| registry | `src/registry/` | `defineTool`, validación de los `meta.ts` (Valibot) e índice de herramientas |
| herramientas | `src/tools/<slug>/` | `domain/` puro, `ui/` de navegador, `i18n.ts`, `meta.ts` y `e2e.spec.ts` |
| páginas | `src/pages/`, `src/layouts/`, `src/components/` | Sitio estático generado por Astro |
| diseño | `src/design/` | Tokens y capas CSS |

ESLint impone qué capa importa qué y qué paquetes externos puede usar cada una; `tsc -p tsconfig.domain.json` impide las APIs del navegador en `core` y `domain`. Una herramienta no importa de otra.

El registro descubre las herramientas con `import.meta.glob` y el build falla si una no es válida. Cada herramienta tiene una página por idioma (`/es/herramientas/<slug>/`, `/en/tools/<slug>/`), y su interfaz se carga con `import()` al cargar la página o al entrar en pantalla, según su `meta.ts`. No hay framework de UI: cada `Tool.astro` lleva un `<script>` de Astro.

## Agregar una herramienta

Se crea `src/tools/<slug>/`, con el slug en kebab-case y en inglés (PLAN §5.7), sin tocar ningún otro archivo:

1. `meta.ts`:

   ```ts
   import { defineTool } from '../../registry/define-tool.ts';

   export default defineTool({
     slug: '<slug>', // igual al nombre de la carpeta
     status: 'beta',
     hydration: 'visible', // o 'load'
     tags: [],
     persistence: null, // o { version: 1 }
   });
   ```

2. `i18n.ts`, con todos los textos de la herramienta; `name` y `description` son obligatorios:

   ```ts
   import { defineToolTexts } from '../../i18n/tool-texts.ts';

   export const texts = defineToolTexts({
     es: { name: '…', description: '…' },
     en: { name: '…', description: '…' },
   });
   ```

3. `domain/`, con la lógica pura y sus pruebas (`*.test.ts`). Solo puede importar `core` y el validador.
4. `ui/Tool.astro`, que recibe `locale` y no importa `astro`. Su `<script>` carga el resto de la interfaz con `hydrate` de `src/platform/hydration.ts`:

   ```astro
   ---
   import type { Locale } from '../../../i18n';
   import { texts } from '../i18n.ts';

   interface Props {
     locale: Locale;
   }

   const t = texts[Astro.props.locale];
   ---

   <section aria-label={t.name}>…</section>

   <script>
     import { hydrate } from '../../../platform/hydration.ts';

     const root = document.querySelector<HTMLElement>('[data-tool="<slug>"]');
     if (root) hydrate(root, () => import('./main.ts').then(({ start }) => start(root)));
   </script>
   ```

5. `e2e.spec.ts`, con sus pruebas E2E (desde la F0b).

`pnpm check`, `pnpm lint`, `pnpm test` y `pnpm build` deben pasar. Quitar una herramienta es borrar su carpeta.

## Licencias

- Código: [MIT](LICENSE).
- Contenido (textos e imágenes del sitio): todos los derechos reservados ([`LICENSE-CONTENT`](LICENSE-CONTENT)).
