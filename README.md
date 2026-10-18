# Portafolio

Sitio personal, estático y bilingüe (español e inglés) que funciona como caja de herramientas propia y, en segundo plano, como portafolio. Cada herramienta se ejecuta por completo en el navegador: ningún dato sale de él.

**Estado:** en construcción (fase F0a). El plan está en [`docs/PLAN.md`](docs/PLAN.md) y las decisiones, en [`docs/adr/`](docs/adr/).

## Requisitos

- Node 24 LTS (ver `.nvmrc`).
- pnpm, en la versión fijada en `packageManager` de `package.json`.

## Instalar

```sh
pnpm install
```

## Desarrollar

```sh
pnpm dev
```

La CSP no se aplica en `astro dev`; se comprueba sobre el build.

## Comprobar y construir

```sh
pnpm check   # tipos (astro check)
pnpm build   # genera dist/
pnpm preview # sirve dist/ en local
```

## Probar

Pendiente: tarea 0.2 (Vitest) y F0b (Playwright y Lighthouse).

## Previsualizar y desplegar

Pendiente: tareas 0.3 y 0.12 (Cloudflare Workers con assets estáticos, desplegado desde GitHub Actions).

## Arquitectura

Pendiente: se resume aquí al cerrar la tarea 0.7. Mientras tanto, ver PLAN §5.

## Agregar una herramienta

Pendiente: tarea 0.7. Mientras tanto, ver PLAN §5.3.

## Licencias

- Código: [MIT](LICENSE).
- Contenido (textos e imágenes del sitio): todos los derechos reservados ([`LICENSE-CONTENT`](LICENSE-CONTENT)).
