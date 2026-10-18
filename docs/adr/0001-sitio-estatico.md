# ADR 0001: Sitio estático sin servidor

- **Estado:** aceptado
- **Fecha:** 18/10/2026
- **Tarea:** 0.1

## Contexto

El sitio es una caja de herramientas personal y bilingüe que funciona también como portafolio (PLAN §1). Ninguna herramienta prevista necesita guardar datos fuera del navegador ni compartirlos entre usuarios (§2). El principio 1 exige que ningún dato salga del navegador, y el principio 9, que el sitio no le quite tiempo a Ontos, así que cada pieza de infraestructura cuenta como mantenimiento.

## Opciones consideradas

1. **Sitio estático:** HTML, CSS y JavaScript generados en el build y servidos como archivos; toda la lógica se ejecuta en el navegador.
2. **Estático con funciones en el servidor** (Workers con código, funciones serverless): permitiría APIs propias, pero abre una vía para que salgan datos del navegador y añade código que mantener, probar y proteger.
3. **Aplicación con servidor y base de datos:** permitiría cuentas y sincronización, que ninguna herramienta necesita.

## Decisión

Opción 1. El sitio se genera como archivos estáticos y se sirve sin código de servidor. La persistencia es local (`localStorage`, §5.6), y la exportación e importación en JSON sustituye a la sincronización.

## Consecuencias

- No hay servidor, base de datos ni cuentas que mantener ni proteger. La superficie de ataque se reduce a lo que se sirve y a sus cabeceras (§7).
- El principio 1 se puede verificar: las E2E fallan ante cualquier petición fuera del origen (paso 8).
- Las cabeceras de seguridad y las redirecciones se definen con `_headers` y `_redirects`, porque no hay código de servidor (ADR 0003 y 0004).
- La detección automática de idioma queda descartada, porque exige JavaScript o servidor (§5.7).
- Una herramienta que necesite servidor queda fuera del alcance hasta que un ADR nuevo sustituya a este.
