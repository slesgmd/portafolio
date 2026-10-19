# ADR 0005: Arquitectura por módulos, capas y su verificación

- **Estado:** propuesto. Recoge las fronteras (tarea 0.1); se acepta en la tarea 0.7a con la decisión 6 (interfaz de las herramientas).
- **Fecha:** 18/10/2026
- **Tarea:** 0.1 (fronteras); 0.7 (decisión 6)

## Contexto

Cada herramienta es un módulo con su dominio puro, su interfaz, sus textos y sus metadatos (PLAN §5.3). Las capas de la §5.2 separan lo puro (core, i18n, domain) de lo que depende del navegador (platform, ui) y del build (registry, páginas). La separación solo se mantiene si una compuerta la comprueba en cada PR (principio 4), también en los archivos `.astro`, cuyos bloques `<script>` son código de navegador con sus propios imports.

La §4 exige verificar en la tarea 0.1 que eslint-plugin-boundaries analiza los imports de los `.astro`, incluidos sus `<script>`, y que puede restringir los paquetes externos por capa. Si no puede, se sustituye por `no-restricted-imports` con alias de ruta.

Versiones verificadas el 18/10/2026 en npm; todas cumplen la edad mínima de 7 días (ADR 0002).

## Opciones consideradas

**Verificación de las fronteras**

1. **eslint-plugin-boundaries:** clasifica cada archivo en un elemento por su ruta, captura partes de la ruta (el nombre de la herramienta) y aplica políticas por elemento, también sobre paquetes externos (`module.origin` y `module.source`).
2. **`no-restricted-imports` con alias de ruta:** sin dependencias nuevas, pero no compara capturas: "solo el `domain` de la propia herramienta" exige una regla por herramienta, y los imports relativos escapan si no se fuerzan los alias.
3. **dependency-cruiser:** potente, pero corre fuera de ESLint y no entiende los `<script>` de los `.astro` sin preprocesarlos.

**Reglas de accesibilidad en los `.astro`**

1. **eslint-plugin-jsx-a11y 6.10.2:** su `peerDependencies` solo admite ESLint ≤ 9.
2. **eslint-plugin-jsx-a11y-x 0.2.0:** bifurcación mantenida por es-tooling con ESLint 9 y 10 en su `peerDependencies`; eslint-plugin-astro la carga si no encuentra la original.
3. **Sin reglas de accesibilidad en el lint:** quedaría solo axe en el E2E (F0b), más tarde y más caro.

## Decisión

**Herramientas (dependencias de desarrollo, versiones exactas):**

| Paquete | Versión | Papel |
|---|---|---|
| `eslint` | 10.12.0 | Linter. La 10.13.0 no cumplía la edad mínima |
| `@eslint/js` | 10.0.1 | Reglas recomendadas de ESLint |
| `typescript-eslint` | 8.71.1 | Parser y reglas de TypeScript (`strict`, sin información de tipos). La 8.71.2 no cumplía la edad mínima |
| `eslint-plugin-astro` | 3.2.1 | Parser de `.astro` (frontmatter, plantilla y `<script>` como archivos virtuales) y reglas |
| `eslint-plugin-jsx-a11y-x` | 0.2.0 | Reglas de accesibilidad que eslint-plugin-astro aplica a la plantilla (`jsx-a11y-strict`) |
| `eslint-plugin-boundaries` | 7.2.0 | Fronteras entre capas y paquetes por capa |
| `globals` | 17.13.0 | Globales de navegador y de Node por entorno |
| `prettier` | 3.9.10 | Formato |
| `prettier-plugin-astro` | 1.1.1 | Formato de `.astro` |

Ninguna necesita scripts de instalación: `allowBuilds` sigue vacío.

**Fronteras (`eslint.config.js`):**

- Cada capa de la §5.2 es un elemento de boundaries con su ruta completa desde la raíz (`partialMatch: false`). Las herramientas se dividen en `tool-domain` (`src/tools/*/domain`), `tool-ui` (`src/tools/*/ui`) y `tool` (los archivos sueltos: `meta.ts`, `i18n.ts`, `e2e.spec.ts`), y las tres capturan el nombre de la herramienta.
- `boundaries/dependencies` con `default: 'disallow'` y `checkAllOrigins: true`: todo import, local, externo o de Node, está prohibido salvo que una política lo permita. Las políticas reproducen la tabla de la §5.2. "Su propio domain" se expresa comparando la captura `tool` del origen y del destino.
- `no-unknown-files`, `no-unknown-dependencies` y `no-ignored-dependencies`: todo archivo de `src/` pertenece a una capa, y nadie importa archivos sin capa.
- Paquetes externos permitidos hoy: en páginas, layouts y componentes, `astro`, `astro:*` y `@astrojs/*` ("integraciones de Astro"); en los archivos de prueba (`*.test.ts`, `*.spec.ts`), `vitest`, `fast-check`, `@playwright/test` y `@axe-core/playwright`. Ninguno más: el validador (ADR 0011), unified (ADR 0007), el polyfill de Temporal (ADR 0012) y el framework de la decisión 6, si lo hay, se añaden a la política de su capa en la tarea de su ADR.
- Interpretaciones de la tabla de la §5.2:
  - **`src/design/`** es una capa propia que solo contiene CSS. Las páginas, layouts y componentes pueden importarla, porque el CSS global se importa desde el layout (tarea 0.6). La tabla no la nombra.
  - **`src/content/`** es una capa sin políticas hasta la sección de proyectos: ni importa ni se importa.
  - **Las pruebas** de una capa pueden importar lo mismo que su capa, más los paquetes de prueba. El `e2e.spec.ts` de una herramienta puede importar de su propia `ui/`.
- Configuración de ESLint, scripts y pruebas fuera de `src/` no tienen fronteras.

**Resultado de la verificación de la §4 (18/10/2026):**

Se verificó con fixtures temporales en `src/`, no versionados: 65 imports entre todas las capas (31 permitidos y 34 prohibidos) y un archivo fuera de toda capa. Cubren archivos `.ts`, frontmatter de `.astro` y bloques `<script>` (hasta dos por archivo), imports relativos con y sin extensión, `import type`, módulos `astro:*`, paquetes externos no instalados y módulos de Node. Todos dieron el resultado esperado. eslint-plugin-boundaries **cumple** los dos requisitos y no se sustituye. Hicieron falta dos ajustes:

1. **`checkAllOrigins: true`.** Por defecto, `boundaries/dependencies` solo evalúa imports locales, y los paquetes externos pasaban sin revisión.
2. **Override de `eslint-module-utils` a 2.14.0.** ESLint 10 eliminó `context.getPhysicalFilename()`. eslint-module-utils 2.12.1, fijada por eslint-plugin-boundaries 7.2.0, recurre entonces a la ruta virtual del bloque `<script>` (`Foo.astro/1_1.ts`) y resuelve sus imports relativos desde un directorio que no existe. Esos imports quedaban como "desconocidos" y escapaban a las políticas. La 2.14.0 (publicada el 03/07/2026) lee `context.physicalFilename`. El cambio respecto a la 2.12.1 es compatible: añade un parámetro opcional a `resolve` y esa lectura. El override va en `pnpm-workspace.yaml`, limitado a `eslint-plugin-boundaries>eslint-module-utils`, y se retira cuando boundaries dependa de la 2.14.0 o de una posterior.
3. **`node_modules/**` en `boundaries/include` (tarea 0.5).** `no-ignored-dependencies` trataba como ignorado todo archivo fuera de `src/**`, también un paquete externo que el resolvedor encuentra. `vitest` se resuelve a un archivo de `node_modules`, así que ninguna prueba dentro de `src/` pasaba el lint; `astro`, que el resolvedor no encuentra, pasaba como externo. Con `node_modules` incluido, el origen externo lo revisan las políticas (`core` sigue sin poder importar `vitest`), y un import a un archivo del proyecto fuera de `src/` sigue fallando.

Los casos permanentes de esta compuerta se añaden en `tests/gates/` en las tareas 0.2b y 0.7 (§12).

**Formato:** Prettier con comillas simples y 100 columnas. Markdown queda fuera (`.prettierignore`), porque Prettier realinearía las tablas del plan y de los ADR en cada edición.

**Hooks (`.githooks/`, activados con `pnpm hooks:install`):**

- `pre-commit`: Prettier (`--check`) sobre los archivos preparados, ESLint sobre los de código y las pruebas de core y domain (Vitest, desde la tarea 0.2a; ADR 0010). Revisa la copia de trabajo, no la versión preparada; la compuerta que bloquea es el paso 3 de la CI.
- `commit-msg`: elimina las líneas de coautoría (`Co-authored-by:`), las de "Generated with/by" y las que enlazan al dominio del asistente de código o de su proveedor, e informa de cada línea eliminada. Valida Conventional Commits (tipos `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`; ámbito opcional; `!` opcional; asunto de 100 caracteres como máximo) y acepta `fixup!`, `squash!`, `amend!` y `Merge`. Rechaza el mensaje si sigue nombrando al asistente o a su proveedor. Ignora los comentarios y lo que sigue a la línea de tijera de `git commit -v`, y normaliza CRLF a LF.
- Los términos prohibidos se escriben con clases de caracteres, como en `scripts/check-provenance.ts` (tarea 0.2a).
- Se escribieron desde cero según la §12, sin consultar los de Ontos. La comparación con su esquema queda pendiente.

**Decisión 6 (interfaz de las herramientas):** pendiente hasta la tarea 0.7a.

## Consecuencias

- Una capa nueva o un paquete nuevo en una capa exige tocar las políticas de `eslint.config.js` y el ADR que lo justifica. Sin eso, el lint falla.
- `ui/` no puede importar `astro` ni `astro:*`, porque la tabla no se lo permite. Si `Tool.astro` necesita sus tipos, se decide en la tarea 0.7.
- El override de eslint-module-utils hay que revisarlo con cada actualización de boundaries. Si boundaries cambia de resolución, la verificación de la §4 se repite: los casos de `tests/gates/` la harán automática.
- eslint-plugin-jsx-a11y-x es una bifurcación con un solo mantenedor visible. Si se abandona, o si la original admite ESLint 10, se vuelve a la original: eslint-plugin-astro prefiere esa cuando están las dos.
- Prettier no formatea Markdown, así que el estilo de los documentos depende de la revisión.
