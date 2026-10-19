# ADR 0010: Pruebas y auditoría

- **Estado:** propuesto. Recoge las pruebas unitarias y la comprobación de procedencia (tarea 0.2a); se acepta en la tarea 0.11, con Playwright, axe y Lighthouse CI.
- **Fecha:** 18/10/2026
- **Tarea:** 0.2a (Vitest, cobertura y procedencia); 0.11 (E2E y Lighthouse)

## Contexto

Cada compuerta del pipeline debe bloquear la fusión y tener su prueba negativa (principio 4, §12). En la F0a existen los pasos 1–5. El paso 4 exige pruebas unitarias con cobertura: al menos el 90 % de ramas en `src/core/` y `src/tools/*/domain/`, sin umbral en `ui/` (§11). Las pruebas de core y domain corren sin DOM (§5.2). El paso 3 incluye `scripts/check-provenance.ts`, que también necesita una prueba.

Hoy `core/` y `domain/` están vacíos, y Vitest falla si no encuentra pruebas: la tarea 0.2 deja al menos una prueba real (§12).

Versiones verificadas el 18/10/2026 en npm; todas cumplen la edad mínima de 7 días (ADR 0002).

## Opciones consideradas

**Ejecutor de pruebas unitarias**

1. **Vitest:** usa la configuración de Vite que Astro ya trae, ejecuta TypeScript sin compilarlo antes, tiene entorno `node` y cobertura integrada.
2. **`node:test`:** sin dependencias, pero sin umbrales de cobertura por carpeta ni filtros por ruta tan directos, y la cobertura nativa sigue siendo experimental.
3. **Jest:** necesita un transformador para TypeScript y ESM, y no comparte la configuración de Vite.

**Proveedor de cobertura**

1. **`@vitest/coverage-v8`:** usa la cobertura nativa de V8, sin instrumentar el código. Vitest la remapea a ramas por AST, con una precisión equivalente a la de Istanbul.
2. **`@vitest/coverage-istanbul`:** instrumenta el código; más lento y sin ventaja aquí.

**Ejecución de los scripts en TypeScript (`scripts/*.ts`)**

1. **Node 24, que elimina los tipos de forma nativa:** `node scripts/x.ts`, sin dependencias. Solo admite sintaxis borrable, que es la que permite el `tsconfig` estricto (`verbatimModuleSyntax`).
2. **`tsx`:** una dependencia más, sin necesidad.

## Decisión

- **Vitest 5.0.3** y **`@vitest/coverage-v8` 5.0.3**, como dependencias de desarrollo. La 5.0.4 (12/10/2026) y la 5.0.5 no cumplían la edad mínima. Vitest comparte Vite 8.3.4 con Astro: no hay una segunda copia.
- **`vitest.config.ts`:**
  - entorno `node`;
  - solo recoge `*.test.ts` (§5.1);
  - cobertura v8 limitada a `src/core/**/*.ts` y `src/tools/*/domain/**/*.ts`, con un umbral global del 90 % de ramas. Sin archivos en esas rutas, la cobertura es "desconocida" y el umbral no falla. Se comprobó con un archivo temporal en `core/` que una rama sin cubrir (50 %) hace fallar el paso.
- **`@types/node` 24.19.2**, como dependencia de desarrollo, para que `astro check` (paso 2) compruebe los tipos de los scripts y de sus pruebas. Coincide con la versión mayor de Node (ADR 0002).
- Los scripts de `scripts/` se ejecutan con Node directamente, sin `tsx`.
- **Comprobación de procedencia** (`scripts/check-provenance.ts`, paso 3):
  - Sin argumentos, revisa todos los commits alcanzables desde `HEAD`; con una base, los de `base..HEAD`. En la CI la base es `origin/<rama base>`, con `fetch-depth: 0`. Si el clon es superficial, falla.
  - Falla si un mensaje tiene un trailer `Co-authored-by` o nombra al asistente de código o a su proveedor, o si un archivo versionado los nombra en su nombre o en su contenido. Omite el contenido de los archivos binarios (los que contienen un byte NUL).
  - Usa los mismos términos que `.githooks/commit-msg`, escritos con clases de caracteres, sin distinguir mayúsculas.
  - Su prueba (`scripts/check-provenance.test.ts`) ejecuta el script en repositorios git temporales, aislados de la configuración global y del sistema (`GIT_CONFIG_NOSYSTEM`, `GIT_CONFIG_GLOBAL`) y con fechas fijas. Casos: un repositorio limpio, un trailer `Co-authored-by`, un mensaje que nombra los términos (con distintas mayúsculas), el contenido de un archivo, el nombre de un archivo, los límites del rango y un archivo binario. Es la "prueba real" que el paso 4 necesita mientras `core/` y `domain/` estén vacíos.
- Playwright, `@axe-core/playwright`, fast-check y Lighthouse CI se deciden en sus tareas (F1 para fast-check, 0.11 para el resto) y completan este ADR.

## Consecuencias

- `@types/node` declara sus globales para todo el programa de `tsconfig.json`, incluidas `ui/` y `platform/`: allí, `process` o `Buffer` no darían un error de tipos. Las capas puras no se ven afectadas, porque `tsconfig.domain.json` usa `types: []` (§5.2). En el código de navegador, el error aparecería en el build o en el E2E.
- El hook `pre-commit` ejecuta `vitest run --passWithNoTests src/core/ /domain/`. Se comprobó con archivos temporales que esos filtros seleccionan solo las pruebas de `src/core/` y de `src/tools/*/domain/`, no las de `ui/` ni las de `scripts/`. En Windows, el `sh` de Git convertía `/domain/` en una ruta absoluta (`C:/Program Files/Git/domain/`) y el filtro no seleccionaba nada; el hook lo evita con `MSYS_NO_PATHCONV=1`.
- La prueba de la comprobación de procedencia crea repositorios git, así que necesita `git` en el `PATH` y tarda unos segundos.
- Los casos de `tests/gates/` que verifican que el paso 4 falla (una prueba que falla, una cobertura bajo el umbral) llegan en la tarea 0.2b.
