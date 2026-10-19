# ADR 0014: Registro de herramientas y textos por herramienta

- **Estado:** aceptado.
- **Fecha:** 18/10/2026
- **Tarea:** 0.7c

## Contexto

La §5.4 define el registro como una función pura que recibe los módulos descubiertos con `import.meta.glob` y devuelve el índice o una lista de errores tipados, y la §6 da su contrato mínimo. Al implementarlo en la tarea 0.7c quedaron tres cuestiones abiertas:

1. Cómo saber si falta `ui/Tool.astro` sin que el registro importe `tools/*/ui/`, que la §5.2 no le permite (revisión 1.3, I3).
2. Qué forma tiene el `i18n.ts` de una herramienta, cómo se comprueba en el build que `en` tiene las claves de `es` (§5.7) y cómo obtiene el índice el nombre y la descripción de cada herramienta, si el registro no puede importar la capa `i18n`.
3. Qué hacer con los fallos que la lista de errores de la §6 no nombra: una carpeta sin `meta.ts` y un `i18n.ts` sin los textos esperados.

## Decisión

**Rutas de `ui/Tool.astro`.** `registry/index.ts` pasa a `buildRegistry` solo las claves de un `import.meta.glob` perezoso de `../tools/*/ui/Tool.astro`. Las funciones de importación que genera Vite no se llaman nunca, así que el registro no ejecuta código de `ui/`. La página de cada herramienta, que sí puede importar `ui/` (§5.2), carga `Tool.astro` con su propio `import.meta.glob`.

**Textos de cada herramienta.**

- El `i18n.ts` exporta `texts = defineToolTexts({ es, en })`. `defineToolTexts` vive en `src/i18n/tool-texts.ts`, exige `name` y `description` (los que necesita el índice) y tipa `en` como `Dict<typeof es>` sin inferir de él (`NoInfer`): una clave que falta o sobra es un error de tipos (paso 2).
- Al cargarse, `defineToolTexts` compara las claves con la misma función que el diccionario del sitio (`assertSameKeys`), así que el build también falla (paso 5), como pide la §12.
- El registro valida con Valibot que `texts` tenga, por cada idioma, `name` no vacío y `description`, sin conocer la lista de idiomas. Las páginas obtienen los textos con `textsFor(entry, locale)`, que falla si falta un idioma.

**Errores.** La unión `RegistryError` de la §6 se amplía con dos casos:

- `missing_meta`: una carpeta de `tools/` con `i18n.ts` o `ui/Tool.astro` pero sin `meta.ts`. Agregar una herramienta exige los cinco elementos (§5.3), y sin esto la carpeta se ignoraría sin aviso.
- `invalid_i18n`: un `i18n.ts` sin `texts` o con textos de otra forma. `astro build` no comprueba tipos, así que sin él el error aparecería más tarde y sin contexto.

**Forma de los módulos.** `meta.ts` exporta el meta por defecto (`export default defineTool({...})`), e `i18n.ts`, el export con nombre `texts`. `buildRegistry` devuelve todos los errores juntos, con un orden estable (por carpeta), y las entradas ordenadas por slug. `registry/index.ts` lanza con `formatRegistryErrors`, una línea por error, y con eso falla el build.

**Páginas.** `[lang]/[tools]/index.astro` lista las herramientas (o indica que no hay ninguna) y `[lang]/[tools]/[slug]/index.astro` genera una página por herramienta e idioma. Esta envuelve `Tool.astro` en un elemento con `data-tool` y `data-hydration`, como fija la decisión 6 (ADR 0005). La cabecera enlaza al índice, y el sitemap incluye el índice y cada herramienta.

## Comprobación

En el build del 18/10/2026, con una herramienta temporal sin versionar (`hydration: 'visible'`, con un `<script>` que llama a `hydrate` y un `import()` de su módulo principal):

- Se generaron `/es/herramientas/demo/` y `/en/tools/demo/`, con su `hreflang`, en el sitemap y en el índice.
- El script de `Tool.astro` se emitió en `/_astro/` y el módulo principal en un chunk aparte. La `<meta>` CSP lleva `script-src 'self'`.
- Con `wrangler dev`, el script de `/_astro/` recibe las dos CSP (capas 2 y 3) y la caché inmutable.

## Consecuencias

- Los casos de `tests/gates/` del paso 5 cubren un `meta.ts` inválido, un slug repetido, un `ui/Tool.astro` que falta y un texto de herramienta que falta; el del paso 2, el mismo texto como error de tipos.
- Añadir un idioma exige cambiar la firma de `defineToolTexts` y los `i18n.ts` de las herramientas, además del diccionario del sitio.
- Vite procesa los `Tool.astro` del glob perezoso del registro aunque no se ejecuten. Como el registro solo corre en el build, eso no llega al navegador.
