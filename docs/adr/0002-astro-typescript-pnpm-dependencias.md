# ADR 0002: Astro, TypeScript estricto, pnpm y política de dependencias

- **Estado:** aceptado
- **Fecha:** 18/10/2026
- **Tarea:** 0.1

## Contexto

El sitio es estático (ADR 0001), bilingüe, con herramientas que se ejecutan en el navegador, y debe pasar una CSP sin `unsafe-inline` (§7). Se necesita un generador que produzca HTML estático, cargue JavaScript solo donde hace falta y genere los hashes de la CSP. Los builds deben ser reproducibles, y la cadena de suministro de npm es un riesgo explícito (§17, riesgo 8).

Versiones verificadas el 18/10/2026 en npm y en la documentación oficial.

## Opciones consideradas

**Generador**

1. **Astro:** HTML estático por defecto, islas, i18n y CSP con hashes integrada (`security.csp`).
2. **Eleventy:** estático y ligero, pero sin CSP con hashes ni empaquetado de scripts integrados.
3. **Next.js o SvelteKit en modo estático:** pensados para aplicaciones con servidor; arrastran un runtime de cliente que no aporta nada aquí.

**Gestor de paquetes**

1. **pnpm:** lockfile estricto, bloqueo por defecto de los scripts de instalación y edad mínima de publicación configurable.
2. **npm:** sin edad mínima ni bloqueo selectivo de scripts.
3. **Yarn:** viable, pero sin ventaja sobre pnpm para un único paquete.

## Decisión

- **Astro 7** (versión inicial 7.3.8) con **TypeScript en modo estricto**: `tsconfig.json` extiende `astro/tsconfigs/strictest`.
- **TypeScript 6.0.3**, fijado. TypeScript 7.0 es la versión `latest` en npm, pero `@astrojs/check` 0.9.10 declara `typescript` `^5 || ^6` y `typescript-eslint` 8.71 exige `<6.1.0`. Se pasa a TypeScript 7 cuando ambos lo admitan.
- **Node 24 LTS**, la LTS vigente al iniciar la F0a (§11): `.nvmrc` con `24` y `engines.node` `>=24 <25`. Se instaló la 24.21.0, porque la 24.22.0 no cumplía todavía la edad mínima.
- **pnpm 12**, fijado en `packageManager` (versión inicial 12.12.1). La configuración va en `pnpm-workspace.yaml`; `.npmrc` solo se usaría para autenticación y registro.
- **Política de dependencias:**
  - **Edad mínima de publicación de 7 días** (§11), en pnpm (`minimumReleaseAge: 10080`, en minutos) y en Renovate. La regla ya se aplicó a las versiones iniciales: Astro 7.4.0, pnpm 12.14.0 y Node 24.22.0 se descartaron por tener menos de 7 días.
  - **Scripts de instalación bloqueados:** pnpm los bloquea por defecto (`strictDepBuilds`), y solo se permiten los de la lista `allowBuilds` de `pnpm-workspace.yaml`. Hoy la lista está vacía, porque ninguna dependencia los necesita; cada entrada que se añada se justifica en este ADR o en uno nuevo.
  - **Versiones exactas** en `package.json` (`savePrefix: ''`). Renovate las actualiza en PR agrupadas.
  - **`engineStrict: true`:** la instalación falla con una versión de Node fuera de `engines`.
  - Toda dependencia de ejecución nueva requiere un ADR con alternativas, tamaño y estado de mantenimiento (principio 6).

## Consecuencias

- Astro genera la CSP con hashes, pero no la aplica en `astro dev`: la CSP se comprueba siempre sobre el build (§7).
- `ClientRouter` y Shiki quedan descartados, porque no son compatibles con la CSP de Astro (§2).
- `tsc` falla si un `tsconfig` no encuentra archivos. `tsconfig.domain.json` se conecta al paso 2 cuando `core/` o algún `domain/` tengan código; se comprobó con archivos temporales que rechaza `document`, `localStorage`, `TextEncoder` y `crypto`.
- La edad mínima retrasa 7 días los parches de seguridad. Como es un parámetro de la §11, una excepción para un parche urgente requiere un ADR (principio 5).
- El cambio a TypeScript 7 depende de terceros y se revisa con cada actualización de `@astrojs/check` y `typescript-eslint`.
