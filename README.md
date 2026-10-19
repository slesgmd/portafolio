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
pnpm check        # tipos (astro check)
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

Pendiente: tareas 0.3 y 0.12 (Cloudflare Workers con assets estáticos, desplegado desde GitHub Actions).

## Arquitectura

Pendiente: se resume aquí al cerrar la tarea 0.7. Mientras tanto, ver PLAN §5.

## Agregar una herramienta

Pendiente: tarea 0.7. Mientras tanto, ver PLAN §5.3.

## Licencias

- Código: [MIT](LICENSE).
- Contenido (textos e imágenes del sitio): todos los derechos reservados ([`LICENSE-CONTENT`](LICENSE-CONTENT)).
