# Cambios

Una entrada por fase (PLAN §15). La F0 se etiqueta `v0.0.0` al cerrar la F0b; la F0a solo registra su entrada.

## F0a — Sitio en producción (19/10/2026)

Sin etiqueta. Tareas 0.1 a 0.9; sitio en `https://portafolio.s-lesgmd.workers.dev`, con `noindex`.

### Añadido

- Repositorio con Astro 7, TypeScript estricto, pnpm 12 y Node 24 LTS, con edad mínima de 7 días para las dependencias y scripts de instalación bloqueados (ADR 0002).
- ESLint con fronteras entre capas y paquetes permitidos por capa, también en los `<script>` de los `.astro`; Prettier; hooks `pre-commit` y `commit-msg` (ADR 0005).
- CI con los pasos 1 a 5 (lockfile, tipos, lint con comprobación de procedencia, pruebas con cobertura y build), obligatorios para fusionar en `main`, y una prueba negativa por compuerta en `tests/gates/` (ADR 0010, propuesto).
- Renovate con actualizaciones agrupadas y edad mínima de 7 días.
- Despliegue en Cloudflare Workers solo con assets, desde `main` y en el entorno `production`, con wrangler en la versión del lockfile y sin código del proyecto en el job (ADR 0003, propuesto).
- CSP en tres capas, cabeceras de seguridad, `noindex` y redirección de `/` a `/es/` (ADR 0004).
- i18n en español e inglés con segmentos localizados, barra final, `hreflang`, sitemap y 404 por idioma (ADR 0006).
- Tokens de diseño en OKLCH con pares claro y oscuro, capas CSS, tema sin parpadeo con interruptor, layout, cabecera y pie (ADR 0008 y 0013). Paleta ámbar con grises cálidos y títulos en la monoespaciada del sistema, con pruebas de contraste AA (ADR 0015).
- `core/` con `Result`, puertos y persistencia versionada; `platform/` con almacenamiento local, Web Crypto y carga diferida de las herramientas (ADR 0005, decisión 6).
- Registro de herramientas validado en el build con Valibot, índice de herramientas y ruta dinámica (ADR 0011 y 0014).
- Páginas de inicio y "sobre mí" en los dos idiomas; el contenido editorial, con todos los derechos reservados, separado de los textos de interfaz (ADR 0009).
- ADR 0001 a 0011 y 0013 a 0015. El 0003, el 0007 y el 0010 quedan propuestos hasta las tareas 0.12 y 0.11 y la F1.
