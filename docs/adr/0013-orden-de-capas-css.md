# ADR 0013: Orden de las capas CSS en un estilo inline

- **Estado:** aceptado. Complementa al ADR 0008: sustituye el lugar donde se declara el orden de las capas.
- **Fecha:** 18/10/2026
- **Tarea:** 0.6b

## Contexto

El ADR 0008 declara el orden de las capas (`@layer reset, tokens, base, layout, components, utilities`) al principio de `src/design/reset.css`, y supone que ese orden se mantiene porque el layout importa el CSS global antes que cualquier componente. Dejó pendiente comprobarlo en el build de la tarea 0.6b.

El orden de las capas lo fija la primera aparición de cada una en el documento. En el build de la 0.6b, Astro empaqueta todo el CSS en una hoja de `/_astro/`, y en ella los estilos de los componentes (`@layer components`) van **antes** que el CSS global del layout. Además, el minificador reparte la declaración de orden entre los bloques `@layer`. El orden efectivo quedaba `components, reset, tokens, base, layout, utilities`: los componentes tenían la prioridad más baja.

## Opciones consideradas

1. **Declarar el orden en un `<style>` inline al principio de `<head>`**, antes de cualquier hoja. Astro no calcula el hash de los estilos `is:inline`, así que se calcula en `astro.config.ts` desde la fuente, como el del script de tema.
2. **Forzar el orden de empaquetado de Astro** (importar el CSS global desde otro sitio o ajustar Vite): depende de un detalle interno que puede cambiar entre versiones sin aviso.
3. **Estilos de componentes sin capa:** ganarían a todas las capas, incluidas `utilities`, y se perdería el sentido de las capas de la §10.

## Decisión

Se adopta la opción 1:

- `src/layouts/layer-order.ts` exporta la declaración, y `Base.astro` la emite con `<style is:inline>` justo después de las `<meta>` de `charset`, `viewport` y `color-scheme`.
- `astro.config.ts` añade su hash a `security.csp.styleDirective.hashes`.
- `reset.css` ya no declara el orden.

El script inline de tema pasa a `src/components/theme-script.ts`, aparte de `theme.ts` (clave y valores del tema), para que el script del interruptor no arrastre su texto al importar las constantes.

## Comprobación

En el build (18/10/2026), en todas las páginas: el `<style>` del orden es el primer estilo de `<head>`, antes de la hoja de `/_astro/`, y su hash está en la `<meta>` CSP, igual que el del script de tema y el del script del interruptor. Con `wrangler dev`, la hoja de `/_astro/` recibe las cabeceras de la capa 3 y `Cache-Control: public, max-age=31536000, immutable`.

## Consecuencias

- El orden de las capas ya no depende de cómo empaquete Astro el CSS.
- Una capa nueva se añade en `layer-order.ts`; el hash se recalcula solo.
- La `<meta>` CSP que inserta Astro queda detrás de los elementos de `<head>` escritos en el layout, y una CSP en `<meta>` solo se aplica a lo que viene después. Hoy, lo anterior es contenido estático propio (las `<meta>`, el estilo del orden y el script de tema). `scripts/verify-dist.ts` (tarea 0.10) debe tenerlo en cuenta.
