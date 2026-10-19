# ADR 0011: Validador en tiempo de ejecución

- **Estado:** aceptado.
- **Fecha:** 18/10/2026
- **Tarea:** 0.7a

## Contexto

Hacen falta validaciones en tiempo de ejecución en dos sitios: los `meta.ts` de las herramientas, que valida el registro en el build (PLAN §5.4), y los datos persistidos, que cada herramienta valida al leerlos (§5.6). El validador de los datos persistidos va en el `domain/` de cada herramienta, así que llega al bundle del navegador y cuenta contra los límites de la §11: 50 KB de carga inicial por herramienta, comprimidos con gzip.

Requisitos: TypeScript estricto con el tipo de salida inferido, objetos estrictos (sin claves desconocidas), uniones, enteros con mínimo, expresiones regulares, ruta de cada error para el mensaje del build, sin dependencias, sin DOM (se ejecuta también en workers; §5.8) y compatible con la tabla de capas de la §5.2.

La §16 (decisión 4) pide comparar Zod 4, `zod/mini` y Valibot en tamaño dentro del bundle, API y mantenimiento. El usuario indicó elegir el de menor peso medido que cubra lo necesario.

## Opciones consideradas

Versiones más recientes que cumplían la edad mínima de 7 días el 18/10/2026: zod 4.6.6 (la 4.6.7 no la cumplía) y valibot 1.5.0. Las dos son MIT y sin dependencias.

**Medición.** El mismo esquema en las tres API: el `ToolMeta` de la §6 como objeto estricto, con el slug en kebab-case por expresión regular, dos enumeraciones, un array de cadenas y un objeto anulable con un entero ≥ 1, más `safeParse` y la conversión de los errores a `ruta: mensaje`. Empaquetado con esbuild 0.28.2 (la versión del lockfile), `--bundle --minify`, ESM, para navegador, y comprimido con gzip de nivel 9:

| Opción | Minificado | gzip |
|---|---|---|
| Valibot 1.5.0 | 5.588 B | 2.006 B |
| `zod/mini` 4.6.6 | 18.898 B | 6.483 B |
| Zod 4.6.6 | 90.082 B | 26.344 B |

**API.**

- **Valibot:** funciones sueltas (`v.strictObject`, `v.pipe`, `v.picklist`), así que el bundle solo lleva lo que se usa. `v.getDotPath` da la ruta de cada error. Los mensajes por defecto son cortos y en inglés.
- **`zod/mini`:** la misma idea con la API de Zod (`z.string().check(...)`). Arrastra el núcleo compartido de Zod 4, más grande.
- **Zod:** API encadenada; no se puede podar por partes y trae los mensajes en inglés.

**Mantenimiento (18/10/2026, GitHub).**

- **Zod:** unas 44.000 estrellas, 93 issues abiertos y último push el 18/10/2026. El autor principal hizo más de 1.000 commits; el siguiente, 63.
- **Valibot:** unas 9.000 estrellas, 223 issues abiertos y último push el 17/10/2026. Repositorio de la organización `open-circle`; el autor principal hizo más de 2.300 commits, y el siguiente, 278.

Los dos dependen sobre todo de una persona.

## Decisión

**Valibot 1.5.0**, como dependencia de ejecución con la versión exacta. Es el de menor peso medido (un tercio de `zod/mini` y menos de un décimo de Zod) y cubre todos los requisitos.

- `eslint.config.js` lo permite en `tool-domain` y en `registry` (§5.2), y en ninguna otra capa. Un caso de `tests/gates/` comprueba que `core` no puede importarlo.
- `src/registry/define-tool.ts` lo usa por primera vez: `defineTool` solo tipa el `meta.ts`, y `parseToolMeta` valida y devuelve los errores como `Result` con `ruta: mensaje`. El registro llama a `parseToolMeta` en el build y convierte sus errores en `invalid_meta` (§5.4). Así, un `meta.ts` inválido no lanza al importarse, y el build informa de todos los errores juntos.
- Los mensajes por defecto, en inglés, bastan para los errores del build. La interfaz no los muestra: `ui/` traduce cada código de error (§5.5).
- `src/core/result.ts` se adelanta de la tarea 0.7b a esta porque `parseToolMeta` lo devuelve. Con un archivo en `core/`, `tsc -p tsconfig.domain.json` pasa a formar parte de `pnpm check` (paso 2), y un caso de `tests/gates/` comprueba que una API del navegador en `core` hace fallar ese paso.

## Consecuencias

- El peso del validador depende de lo que use cada esquema. El esquema de `ToolMeta` solo corre en el build; el de los datos persistidos de cada herramienta se mide con su presupuesto (paso 7, F0b).
- Cambiar de validador afecta a `define-tool.ts` y a los esquemas de persistencia de cada herramienta, no a `core/`, que solo recibe la función `parse` (§6).
- Si Valibot se abandona, `zod/mini` es la alternativa medida más cercana.
