# Progreso

Memoria entre sesiones. Al empezar, leer este archivo y las secciones del plan de las tareas del bloque actual. Se trabaja por bloques (protocolo en `AGENTS.md`).

Fuente de verdad: `docs/PLAN.md` (revisión 1.5). Las revisiones anteriores están en `C:\dev\Portafolio-historico\`.

## Estado actual

- **Fase:** F0a — Sitio en producción.
- **Sesión 1:** cerrada (18/10/2026). Revisiones 1.3 y 1.4 del plan, entorno y tarea **0.1a**.
- **Sesión 2:** cerrada (18/10/2026). Tarea **0.1b**, hecha de forma autónoma mientras el usuario estaba ausente. Las decisiones tomadas sin consultar (D1–D11) están más abajo; el usuario aprobó D1–D10.
- **Sesión 3:** cerrada (18/10/2026). Tarea **0.2a**: repositorio público en GitHub, `ci.yml` con los pasos 1–5, protección de `main` y ADR 0010 propuesto. Las decisiones (S1–S8) están más abajo.
- **Sesión 4:** cerrada (18/10/2026). **Bloque 1** (0.2b): pruebas negativas (PR #2), Renovate (PR #3 y su corrección, PR #5) y protocolo por bloques en `AGENTS.md`. Desde esta sesión se trabaja por bloques.
- **Sesión 5:** cerrada (18/10/2026). **Bloque 2** (0.3 y 0.4): ajuste de Renovate (PR #10), Cloudflare y `deploy.yml` (PR #11), CSP, cabeceras y `_redirects` (PR #12). Decisiones R1–R3, C1–C6 y G1–G3.
- **Sesión 6:** cerrada (18/10/2026). **Bloque 3** (0.5, 0.6a y 0.6b): i18n (PR #14), tokens, capas y tema (PR #15), layout y componentes (PR #16). Decisiones T1–T19, tomadas sin consultar, más abajo.
- **Sesión 7:** cerrada (18/10/2026). Regla de estilo de `AGENTS.md` (PR #18) y limpieza de comentarios (PR #19), pedidas por el usuario. **Bloque 4** (0.7a, 0.7b y 0.7c): validador y decisión 6 (PR #20), `core/` y `platform/` (PR #21), registro, índice y ruta dinámica (PR #22). Decisiones A1–A26, tomadas sin consultar, más abajo.
- **Sesión 8:** cerrada (19/10/2026). **Bloque 5** (0.8 y 0.9): textos y diseño con entrevista al usuario (PR #24), separación del contenido editorial (PR #25) y cierre de la F0a (PR #26). Decisiones E1–E14. Revisión 1.5 del plan con la recalibración del usuario y las correcciones pendientes. **F0a cerrada.**
- **Siguiente sesión:** 9 → **F0b**, bloque 6 (0.10). Effort recomendado: **high** (ver "Bloques de la F0b").
- **0.7c comprobada en producción (18/10/2026, tras la PR #22):** `/es/herramientas/` y `/en/tools/` → 200 con las cabeceras de `/*`; el índice indica que no hay herramientas; la cabecera enlaza a él y el sitemap lo incluye.
- **0.8 revisada y comprobada (19/10/2026):** el usuario revisó la PR #24 en navegador a 320 px, en los dos idiomas y los dos temas (sin desbordamiento horizontal; los títulos se parten bien) y aprobó los textos, los tokens y E1, E3 y E5. Tras la fusión, `/es/`, `/en/`, `/es/sobre-mi/` y `/en/about/` → 200 en producción, con sus títulos, `meta description`, textos, enlaces y cabeceras; la hoja de `/_astro/` lleva la paleta ámbar, `--color-focus`, `::selection` y Cascadia Mono.
- **Revisión manual en navegador (usuario, 19/10/2026):** el tema no parpadea al recargar con `Claro` u `Oscuro` elegido, el interruptor funciona con teclado y no hay desplazamiento horizontal a 320 px (§9, §10).
- **Producción (18/10/2026):** `https://portafolio.s-lesgmd.workers.dev`, desplegado por `deploy.yml` desde `main` (primer despliegue con la PR #11; versión `e6a65a86-704e-4c34-a499-526a7dd16425`). Entorno `production` de GitHub restringido a `main` (creado con `gh api`, autorizado por el usuario), con `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` cargados por el usuario.
- **Comprobado a mano en producción tras la PR #12:** `/` → 302 a `/es/`; `/es/` → 200 con todas las cabeceras de `/*` y la `<meta>` CSP; `/es` → 307 a `/es/`; rutas inexistentes → 404 con las cabeceras. Faltan las 404 por idioma (0.5) y la capa 3 en una URL real (no hay archivos en `/_astro/` todavía).
- **0.6b comprobada en producción (18/10/2026, tras la PR #16):** `/_astro/Base.*.css` recibe la CSP de la capa 3 (`default-src 'self'; connect-src 'none'`, además de la de `/*`) y `Cache-Control: public, max-age=31536000, immutable`; el `<style>` del orden de capas va en `<head>`; las páginas y las 404 por idioma responden como antes.
- **0.5 comprobada a mano en producción (18/10/2026, tras la PR #14):** `/es/`, `/en/`, `/es/sobre-mi/` y `/en/about/` → 200 sin redirección; `/es/sobre-mi` → 307 a la URL con barra; `/es/noexiste/` y `/en/noexiste/` → 404 en su idioma; `/noexiste/` → 404 bilingüe; `/sitemap.xml` → 200; todas con las cabeceras de `/*`. Con esto quedan comprobadas las 404 por idioma del criterio de aceptación de la F0a.
- **Protección de `main` comprobada (18/10/2026):** un push directo de prueba fue rechazado con GH006 ("Changes must be made through a pull request").
- **Checks requeridos en `main` (18/10/2026):** `Pasos 1-5` y `Compuertas` (app de GitHub Actions), con la rama actualizada.
- **Renovate instalado por el usuario (18/10/2026):** modo interactivo, solo en `portafolio`. Su primera ejecución abrió el issue #4 por un error de configuración, que corrige la PR #5.

## Bloques de la F0a (decisión del usuario, sesión 4)

| Bloque | Tareas | Estado |
|---|---|---|
| 1 | 0.2b (compuertas y Renovate) | cerrado |
| 2 | 0.3 y 0.4 (Cloudflare y seguridad) | cerrado |
| 3 | 0.5, 0.6a y 0.6b (i18n y diseño) | cerrado |
| 4 | 0.7a, 0.7b y 0.7c (arquitectura) | cerrado |
| 5 | 0.8 y 0.9 (contenido y cierre) | cerrado |

## Bloques de la F0b (propuesta, sesión 8; se confirman con el usuario al empezar)

| Bloque | Tareas | Effort recomendado | Estado |
|---|---|---|---|
| 6 | 0.10 (verificación de `dist/` y presupuesto, pasos 6–7) | high | pendiente |
| 7 | 0.11 (E2E y Lighthouse, pasos 8–9; acepta el ADR 0010) | high | pendiente |
| 8 | 0.12 (vista previa, producción y vuelta atrás, pasos 10–11; acepta el ADR 0003) | high | pendiente |

Effort del bloque 6: **high**. `scripts/verify-dist.ts` debe analizar el HTML generado (atributos `style=`, scripts y estilos en línea sin hash, `define:vars`, posición de la `<meta>` CSP respecto al resto de `<head>`; ver "Pendientes"), comprobar la regla de la capa 3 en `dist/_headers` y medir el JavaScript con gzip por página y por herramienta, incluida la carga diferida (§8, §11). Cada comprobación lleva su prueba negativa en `tests/gates/`, y un falso negativo dejaría pasar justo lo que la compuerta protege. No hace falta más: no hay cuentas de terceros ni decisiones irreversibles en el bloque.

Protocolo de trabajo por bloques (decisión del usuario, sesión 4): en `AGENTS.md`.

Indicaciones del usuario por bloque:

- **Bloque 1:** dos PR (pruebas negativas y Renovate). `tests/gates/` reutiliza `scripts/check-provenance.test.ts` en lugar de duplicarlo. Renovate no lleva ADR: ya lo deciden el ADR 0002 y la §7, y `renovate.json` solo lo implementa.
- **Bloque 4:** en la decisión 6 se aplica la recomendación del plan. Como validador se elige el de menor peso medido que cubra lo necesario.
- **Bloque 5 (entrevista, sesión 8):** estudiante de Computer Science en UTEC (Perú), textos en primera persona. Público: el propio usuario y otros desarrolladores que usen las herramientas; en segundo plano, reclutadores o empresas para prácticas. El inicio dice primero qué es el sitio (herramientas en el navegador que no envían datos) y luego, en una línea, quién es. Sin mencionar Ontos. Fuentes del sistema (prioridad a la velocidad). Si cambia la paleta, se escribe su ADR. Los textos y los tokens se enseñan antes de fusionar. Textos de "sobre mí" redactados por el usuario (en `es.ts` y `en.ts`). Diseño aprobado: técnico y sobrio, títulos en la monoespaciada del sistema (con Cascadia Mono), acento ámbar, grises cálidos, oscuro como tema principal (ADR 0015); pares nuevos de texto sobre el acento y de foco (≥ 3:1) en `contrast.test.ts`. Textos de inicio y `meta description` redactados por el usuario; el inicio no anuncia herramientas futuras: lista las publicadas y enlaza al índice. Verificado antes de publicar la frase de privacidad: sin analítica (ni script de terceros en la página de producción ni código de Worker; la CSP de documento es `default-src 'self'`) y el plan solo prevé Web Workers del navegador (§5.8), ninguna herramienta envía datos.

## Siguiente paso concreto

1. **F0b, bloque 6 (0.10):** confirmar con el usuario los bloques de la F0b (propuesta arriba) y empezar con `verify-dist.ts` y `check-budget.ts` (pasos 6–7, §12).
2. La capa 3 sobre un script real de `/_astro/` ya se comprobó con `wrangler dev` y una herramienta temporal (ADR 0014). En producción queda para la primera herramienta real (F1).

## Tareas cerradas

| Tarea | Commit | Horas |
|---|---|---|
| Sesión 0 (revisión, sin tarea del plan) | — (sin repo) | 0,5 |
| Revisiones 1.3 y 1.4 del plan | `docs: añade el plan (rev. 1.4) y el progreso` | 0,5 |
| 0.1a Repositorio base | `chore: inicializa el repositorio con Astro y TypeScript` | 0,5 |
| 0.1b ESLint, Prettier, hooks y ADR 0005 propuesto | `chore: configura ESLint, Prettier y los hooks de git` | 0,25 |
| 0.2a GitHub, `ci.yml` pasos 1–5, protección de `main` y ADR 0010 propuesto | `ci: añade el pipeline mínimo con los pasos 1 a 5 y la comprobación de procedencia` (PR #1) | 0,25 |
| 0.2b (1/2) Pruebas negativas de los pasos 1–5 y job `Compuertas` | `test: añade las pruebas negativas de las compuertas 1 a 5` (PR #2, `fd708c2`) | 0,1 |
| Protocolo por bloques y regla de los hooks en `AGENTS.md` | `docs: adopta el protocolo de trabajo por bloques` | — (incluido en la 0.2b) |
| 0.2b (2/2) Renovate | `chore: configura Renovate` (PR #3, `5481e3b`) | 0,15 |
| Ajuste de Renovate (`.nvmrc`, TypeScript < 7) | `chore: ajusta Renovate para .nvmrc y TypeScript` (PR #10, `b539f77`) | 0,05 |
| 0.3 Cloudflare, `deploy.yml` y ADR 0003 propuesto | `feat: despliega el sitio en Cloudflare Workers con assets estáticos` (PR #11, `ef5c28f`) | 0,3 |
| 0.4 CSP, cabeceras, `_redirects` y ADR 0004 | `feat: añade la CSP, las cabeceras de seguridad y la redirección de la raíz` (PR #12, `b59b902`) | 0,2 |
| 0.5 i18n, sitemap, 404 por idioma y ADR 0006 | `feat: añade la i18n con rutas localizadas, sitemap y 404 por idioma` (PR #14, `9f9f6a6`) | 0,3 |
| 0.6a Tokens, capas, tema sin parpadeo y ADR 0008 | `feat: añade los tokens de diseño, las capas CSS y el script de tema` (PR #15, `b063711`) | 0,25 |
| 0.6b Layout, cabecera, pie, interruptor de tema y ADR 0013 | `feat: añade el layout con cabecera, pie e interruptor de tema` (PR #16, `7a7c321`) | 0,25 |
| Regla de estilo en `AGENTS.md` (sin tarea del plan) | `docs: añade la regla de estilo de comentarios y documentación` (PR #18, `e92b03d`) | 0,05 |
| Limpieza de comentarios según la regla (sin tarea del plan) | `refactor: limpia los comentarios según la regla de estilo` (PR #19, `0cd1d17`) | 0,2 |
| 0.7a Validador (ADR 0011), decisión 6 y aceptación del ADR 0005 | `feat: elige Valibot como validador y fija la interfaz sin framework` (PR #20, `a010eec`) | 0,4 |
| 0.7b `core/` (puertos y persistencia versionada) y `platform/` | `feat: añade los puertos de core, la persistencia versionada y platform` (PR #21, `58cb6af`) | 0,4 |
| 0.7c Registro, índice de herramientas, ruta dinámica y ADR 0014 | `feat: añade el registro, el índice de herramientas y su ruta dinámica` (PR #22, `15a211e`) | 0,5 |
| 0.8 Textos de inicio y "sobre mí", paleta ámbar y ADR 0015 | `feat: añade los textos de inicio y sobre mí y la paleta ámbar` (PR #24, `903459e`) | 0,75 |
| 0.8 Separación del contenido editorial (ADR 0009) | `fix: separa el contenido editorial de los textos de interfaz` (PR #25, `062e561`) | 0,15 |
| 0.9 Revisión de los ADR, ADR 0007 propuesto, `CHANGELOG.md` y propuesta de recalibración | `docs: cierra la F0a con el changelog, el ADR 0007 y la recalibración` (PR #26, `6c69e95`) | 0,5 |
| Revisión 1.5 del plan (recalibración y correcciones) | `docs: aplica la revisión 1.5 del plan` | 0,1 |

## Decisiones tomadas

| Decisión | Resultado | Dónde queda |
|---|---|---|
| §16-1 Visibilidad | Repositorio **público** en GitHub | ADR 0009 (tarea 0.9) |
| §16-2 Licencias | **MIT** para el código (`LICENSE`); **todos los derechos reservados** para textos e imágenes (`LICENSE-CONTENT`). Titular: Sebastián Lescano | ADR 0009; archivos en la 0.1a |
| §16-3 Dominio | **Diferido**: `workers.dev` + `noindex` en `/*` + Lighthouse sin `is-crawlable` | §7, §11 |
| §11 Node | **Node 24 LTS** en `.nvmrc` y `engines` | ADR 0002 |
| `PLAN-rev-1.1.md` | Movido fuera del repo, a `C:\dev\Portafolio-historico\` | — |
| Cambios al plan | Se agrupan en una **revisión 1.3** al inicio de la sesión 1, con ok previo | `docs/PLAN.md` |
| Hooks | Se toma el esquema de los hooks de Ontos (solo lectura); archivos propios aquí, sin referencias a Ontos | 0.1b |
| §16-4, 5, 6 | Pendientes en su plazo (0.7, F2, 0.7) | — |
| Versiones iniciales | pnpm 12.12.1, Node 24.21.0, Astro 7.3.8 (cumplen los 7 días) | ADR 0002 |
| Textos de interfaz | Bajo MIT, como parte del código; el contenido editorial, con derechos reservados (aprobado) | ADR 0009, `LICENSE-CONTENT` |
| Excepciones a la edad mínima | Requieren un ADR (aprobado) | ADR 0002 |
| Telemetría de Astro | Desactivada en local y en CI (aprobado) | 0.2a |
| Neutralidad del repositorio | Ninguna mención al asistente de código ni a su proveedor en archivos, nombres, commits, PR ni contribuidores. Instrucciones en `AGENTS.md`; el archivo propio del asistente es local, con una importación de `AGENTS.md` | `AGENTS.md`, revisión 1.4 |

### Decidido sin consultar (sesión 2, 0.1b; D1–D10 aprobadas por el usuario)

El usuario autorizó hacer la 0.1b completa sin preguntar: elegir la opción más conservadora y coherente con el plan, y anotarla aquí. Todo queda detallado en el ADR 0005 (propuesto).

| # | Decisión | Motivo | Dónde queda |
|---|---|---|---|
| D1 | `eslint-plugin-jsx-a11y-x` 0.2.0 en lugar de `eslint-plugin-jsx-a11y` 6.10.2 (corrige V4) | La 6.10.2 solo admite ESLint ≤ 9. eslint-plugin-astro admite las dos; la bifurcación declara ESLint 10 | ADR 0005 |
| D2 | Override `eslint-plugin-boundaries>eslint-module-utils: 2.14.0` | Con ESLint 10, la 2.12.1 resolvía los imports de los `<script>` desde la ruta virtual, y escapaban a las fronteras. Cambio compatible, revisado con un diff. Alternativas descartadas: resolver propio (más código) y `no-restricted-imports` (sin capturas por herramienta) | `pnpm-workspace.yaml`, ADR 0005 |
| D3 | `checkAllOrigins: true` en `boundaries/dependencies` | Sin él, los paquetes externos no se revisaban (requisito de la §4) | `eslint.config.js` |
| D4 | Versiones: ESLint 10.12.0, typescript-eslint 8.71.1 | Las 10.13.0 y 8.71.2 no cumplían los 7 días | ADR 0005 |
| D5 | Reglas: `typescript-eslint` `strict` sin información de tipos; a11y `jsx-a11y-strict` | Lo más estricto que no exige tipado en el lint (más lento) | `eslint.config.js` |
| D6 | Interpretaciones de la §5.2: `src/design/` es una capa propia (solo CSS) importable por páginas, layouts y componentes; `src/content/` sin políticas; las pruebas añaden `vitest`, `fast-check`, `@playwright/test` y `@axe-core/playwright`; el `e2e.spec.ts` de una herramienta importa de su `ui/` | La tabla no nombra `design` ni `content` ni los paquetes de prueba | ADR 0005 |
| D7 | Prettier con comillas simples y 100 columnas; Markdown excluido | Coincide con el código existente. Prettier realinearía las tablas del plan y de los ADR | `.prettierrc`, `.prettierignore` |
| D8 | `pre-commit` comprueba (`--check`) y no reescribe; revisa la copia de trabajo; omite Vitest, avisándolo, hasta la 0.2a | Reescribir archivos preparados en parte mezcla cambios. La CI es la compuerta real | `.githooks/pre-commit` |
| D9 | `commit-msg`: 11 tipos de Conventional Commits, asunto ≤ 100 caracteres, acepta `fixup!`/`squash!`/`amend!`/`Merge`; elimina `Co-authored-by:`, "Generated with/by" y enlaces al dominio del asistente o del proveedor, e informa de cada línea eliminada; términos: nombre del asistente y del proveedor | §12; 100 es el límite habitual de commitlint | `.githooks/commit-msg` |
| D10 | Hooks activados con `pnpm hooks:install` (y ya activados en este clon), no con un script `prepare` automático | Sin efectos laterales al instalar; CI no los necesita | `package.json`, README |
| D11 | Hooks escritos desde cero sin mirar Ontos (instrucción del usuario; no se compararán) | — | I6 |

### Sesión 3 (0.2a)

| # | Decisión | Motivo | Dónde queda |
|---|---|---|---|
| S1 | Repositorio público `slesgmd/portafolio`, sin plantillas; wiki desactivada. Issues activos: la auditoría semanal de la §7 abre issues | Aprobado por el usuario | GitHub |
| S2 | Vitest y `@vitest/coverage-v8` 5.0.3; umbral del 90 % de ramas sobre `src/core/` y `src/tools/*/domain/` (corrección del usuario) | La 5.0.4 y la 5.0.5 no cumplían los 7 días. Sin archivos, el umbral no falla; con una rama sin cubrir, sí (comprobado) | `vitest.config.ts`, ADR 0010 |
| S3 | `@types/node` 24.19.2 | `astro check` comprueba los scripts. Sus globales llegan a `ui/` y `platform/`; las capas puras siguen protegidas por `tsconfig.domain.json` | ADR 0010 |
| S4 | Scripts en TypeScript ejecutados con Node 24 directamente, sin `tsx` | Sin dependencias nuevas | ADR 0010 |
| S5 | `check-provenance.ts`: sin base revisa todo el historial; en CI, `origin/<rama base>..HEAD`; falla con un clon superficial; omite el contenido binario | §12 | `scripts/check-provenance.ts` |
| S6 | `pre-commit`: Vitest obligatorio y `MSYS_NO_PATHCONV=1` | El sh de Git en Windows convertía `/domain/` en `C:/Program Files/Git/domain/` y el filtro no seleccionaba nada | `.githooks/pre-commit`, ADR 0010 |
| S7 | `ci.yml`: un solo job (`Pasos 1-5`) con los cinco pasos en orden; acciones fijadas por SHA (checkout 7.0.1, setup-node 7.1.0, pnpm/action-setup 6.1.0, todas con ≥ 7 días); `contents: read`; `persist-credentials: false` | Una instalación para todos los pasos; cualquier fallo bloquea la fusión | `.github/workflows/ci.yml` |
| S8 | Protección de `main`: solo por PR (0 aprobaciones), check `Pasos 1-5` requerido (app de GitHub Actions) con la rama actualizada, también para administradores, sin push forzado ni borrado. Solo squash, con borrado automático de la rama | Aprobado por el usuario | GitHub |

### Decidido sin consultar (sesión 4, bloque 1)

| # | Decisión | Motivo | Dónde queda |
|---|---|---|---|
| B1 | Ejecutor `tests/gates/run-gates.ts` (`pnpm gates`): copia los archivos versionados a un directorio temporal, enlaza `node_modules` (salvo en el paso 1), escribe los archivos del caso y ejecuta el comando de `ci.yml`. Pasa si falla **y** la salida contiene la firma esperada | Prueba la configuración real de cada compuerta; la firma evita contar como acierto un fallo por otro motivo | ADR 0010 |
| B2 | Casos en `tests/gates/cases.ts`, con el contenido de los archivos como texto | Sin fixtures sueltos que excluir de ESLint, Prettier, `astro check` y Vitest | ADR 0010 |
| B3 | Script y no `*.test.ts` | Como prueba, el paso 4 lo ejecutaría y su caso del paso 4 lo relanzaría de forma recursiva | ADR 0010 |
| B4 | El ejecutor comprueba que `ci.yml` contiene `pnpm <comando>` de cada caso | Los casos deben probar las mismas compuertas que la CI | `run-gates.ts` |
| B5 | Caso extra del paso 3: `core` importa `platform` (fronteras) | Es genérico y barato. El de `domain` → `platform` (pasos 2 y 3) sigue en la 0.7 | `cases.ts` |
| B6 | `verifyDepsBeforeRun` desactivado en los procesos del ejecutor, y comprobación de los enlaces de `node_modules` tras cada caso | La instalación previa de pnpm 12 reescribió los enlaces del `node_modules` real a través del enlace de la copia (pasó en local y se reparó con `pnpm install --offline`) | ADR 0010 |
| B7 | Job `Compuertas` aparte, en paralelo con `Pasos 1-5` | Plan §12 ("un job") | `ci.yml` |
| B8 | Una sola PR (la de las pruebas negativas) lleva también los cambios de este archivo de la sesión 4 | El commit con `AGENTS.md` quedó bloqueado (ver Pendientes) | — |
| B9 | `renovate.json`: `config:recommended`, `helpers:pinGitHubActionDigestsToSemver` (SHA con comentario `# vX.Y.Z`, como ya está en `ci.yml`), `schedule:weekly`, `minimumReleaseAge: 7 days` con `internalChecksFilter: strict` (la PR no se abre antes de tiempo) y `rangeStrategy: pin` | §7 y ADR 0002. Coincide con `minimumReleaseAge` y `savePrefix: ''` de pnpm | `renovate.json` |
| B10 | Versiones no mayores (incluidos pin y digest) agrupadas en una PR; cada mayor en la suya | "Actualizaciones agrupadas" (§4). Una mayor puede romper, así que se revisa sola | `renovate.json` |
| B11 | `node` y `@types/node` limitados a `<25`; `engines` sin actualizaciones automáticas | Node 24 LTS (ADR 0002) | `renovate.json` |
| B12 | `eslint-plugin-boundaries` fuera del grupo y con una nota en la PR para revisar el override de `eslint-module-utils` | Pendiente del ADR 0005 | `renovate.json` |
| B13 | Mensajes de commit `chore(deps): actualiza <dependencia> a <versión>` | Convención del repositorio: tipo en inglés y descripción en español | `renovate.json` |
| B14 | `renovate.json` no se valida en local con `renovate-config-validator`: lo valida la PR de bienvenida de Renovate | El validador exige descargar Renovate, sin revisar ni cumplir la edad mínima | — |
| B17 | Regla nueva en `AGENTS.md`: nunca `--no-verify` ni saltarse los hooks (decisión del usuario, tras el commit de prueba de la protección, que los saltó) | — | `AGENTS.md` |
| B16 | Corrección de `renovate.json` (issue #4 de Renovate): `matchPackageNames` no admite `*` junto con otros patrones; se deja solo `!eslint-plugin-boundaries`, que coincide con todos los paquetes salvo ese | Error de configuración que Renovate informó en su primera ejecución | `renovate.json` |
| B15 | Sin `lockFileMaintenance` | Opción conservadora. Las dependencias transitivas se renuevan con las directas; se reconsidera si quedan desfasadas | `renovate.json` |

### Sesión 5 (bloque 2)

| # | Decisión | Motivo | Dónde queda |
|---|---|---|---|
| R1 | PR #6 cerrada; regla `matchManagers: ["nvm"]` con `rangeStrategy: replace`: `.nvmrc` queda en `24` y solo cambiaría al salir del rango, que `node <25` impide (decisión del usuario) | Node 24 LTS sin fijar la versión exacta (ADR 0002). Además, la 24.22.0 no cumplía los 7 días | `renovate.json` |
| R2 | `typescript` limitado a `<7` (decisión del usuario); Renovate cerrará la PR #7 sola | TypeScript 7 es incompatible con `@astrojs/check` 0.9.10 y `typescript-eslint` 8.71 (V1, ADR 0002) | `renovate.json` |
| R3 | Acción de commit `fija` para `pin` y `pinDigest` (decidido sin consultar) | El título de la PR #6 decía "pin node.js": `commitMessageAction` de nivel superior no cubre esos tipos | `renovate.json` |
| C1 | wrangler 4.149.0 (dev); `compatibility_date` 2026-10-06; Worker `portafolio` en `workers.dev` | La 4.150.0 y posteriores no cumplían los 7 días; fecha de la versión de workerd que trae | `wrangler.jsonc`, ADR 0003 |
| C2 | `allowBuilds: false` para `esbuild` y `workerd` | Sus `postinstall` solo comprueban el binario del paquete de plataforma (ya en el lockfile) o lo descargan fuera de él. `wrangler deploy --dry-run` y `wrangler dev` funcionan sin ellos | `pnpm-workspace.yaml`, ADR 0003 |
| C3 | I4 resuelto: el job de despliegue hace un checkout parcial (`package.json`, lockfile, `pnpm-workspace.yaml`, `.nvmrc`, `wrangler.jsonc`), instala con `--frozen-lockfile --ignore-scripts`, sin caché, y recibe `dist/` como artefacto | wrangler y sus dependencias en la versión del lockfile, sin código del proyecto. Simulado en local | `deploy.yml`, ADR 0003 |
| C4 | `deploy.yml` reutiliza `ci.yml` (`workflow_call`); `ci.yml` sube `dist/` como artefacto (upload-artifact 7.0.2, download-artifact 8.0.2, fijadas por SHA, ≥ 7 días); en `main` la procedencia revisa todo el historial y la concurrencia no cancela | Repetir los pasos sin duplicar el workflow (§12) | `ci.yml`, `deploy.yml` |
| C5 | Secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` en el entorno `production` (no en el repositorio); token con `Workers Scripts: Edit` | Solo el job del entorno los recibe (§7) | ADR 0003 |
| C6 | Telemetría de wrangler desactivada (`WRANGLER_SEND_METRICS=false` en los workflows; `wrangler telemetry disable` en este equipo) | Igual que la de Astro | workflows, README |
| G1 | Página provisional movida a `src/pages/es/index.astro` hasta la 0.5 | Sin ella, la redirección `/ → /es/` de la 0.4 llevaría a un 404 | ADR 0004 |
| G2 | Comentarios dentro de `_headers` y `_redirects` explicando cada regla | Cloudflare ignora las líneas con `#`; comprobado con `wrangler dev` | `public/` |
| G3 | Las pruebas de cabeceras (pasos 8 y 11) aceptarán la CSP doble como dos cabeceras o unida con coma | `wrangler dev` las envía separadas; la §7 describe la forma unida | ADR 0004 |
| G4 | Renovate: la PR #7 (TypeScript 7) quedó cerrada sola y no volvió la de `.nvmrc` | Comprobación de R1 y R2 | — |
| G5 | Fusiones en `main` con permiso explícito del usuario en cada una; ramas apiladas actualizadas con `rebase` sobre `main` y `--force-with-lease` | El clasificador de permisos del asistente trata la fusión en `main` como despliegue a producción | — |

### Decidido sin consultar (sesión 6, bloque 3)

| # | Decisión | Motivo | Dónde queda |
|---|---|---|---|
| T1 | Rutas propias (`[lang]` con `getStaticPaths` y `src/i18n/routes.ts`), sin el enrutado `i18n` de Astro | El de Astro no traduce los segmentos de sección; la redirección de `/` ya está en `_redirects` | ADR 0006 |
| T2 | Sitemap con un endpoint propio (`src/pages/sitemap.xml.ts`), sin `@astrojs/sitemap` | Unas treinta líneas frente a una dependencia nueva (principio 6) | ADR 0006 |
| T3 | `build.format: 'preserve'` y páginas como `index.astro` en carpetas | Verificado: con `'directory'` el build emitía `es/404/index.html` (§5.7) | `astro.config.ts`, ADR 0006 |
| T4 | `x-default` apunta a la versión en español de la misma página (en el inicio, `/es/`) | Lectura de "x-default → /es/" (§5.7) que no manda a otra página desde "sobre mí" | ADR 0006 |
| T5 | `Dict` en `src/i18n/dict.ts` (fuera del árbol de la §5.1); `index.ts` compara las claves al cargarse y hace fallar el build | Evita un ciclo de imports; `astro build` no comprueba tipos y la §12 pide que el paso 5 falle con una traducción faltante | ADR 0006 |
| T6 | `Base.astro` y `LangSwitch.astro` se crean en la 0.5, sin estilos | La 0.5 necesita `lang`, `canonical`, `hreflang` y el selector; el diseño es de la 0.6 | ADR 0006 |
| T7 | `node_modules/**` en `boundaries/include` | Fallo latente de la 0.1b: ninguna prueba dentro de `src/` pasaba el lint (`vitest` contaba como archivo ignorado). Las políticas siguen revisando el origen externo | `eslint.config.js`, ADR 0005 |
| T8 | Sin `public/robots.txt` | Está en el árbol de la §5.1 pero ninguna tarea lo pide; se decide en la 0.11 o con el dominio | ADR 0006 |
| T9 | Las 404 no emiten `canonical` ni `hreflang` y no van al sitemap; la raíz es bilingüe con `lang="en"` en los textos en inglés | No son páginas indexables ni tienen equivalente | ADR 0006 |
| T10 | Pares claro y oscuro con `light-dark()` y `color-scheme`; `data-theme` solo cambia `color-scheme` | Cada color se escribe una vez y los controles nativos siguen el tema. Soportado en las dos últimas versiones de los navegadores de la §11 | ADR 0008 |
| T11 | Paleta neutra de tono 250 con acento azul; escala tipográfica de razón 1,2 (§11, se fijan en la 0.6) | La escala más contenida de las habituales, para interfaces con mucho texto de control; contrastes con margen (≥ 5,45:1 en texto, ≥ 4,31:1 en bordes) | ADR 0008 |
| T12 | Script de tema en `src/components/theme.ts`; su hash se calcula en `astro.config.ts` (`scriptDirective.hashes`) | Astro no calcula el hash de los scripts `is:inline` (comprobado en su código). Calcularlo desde la fuente evita que se desincronice | `astro.config.ts`, ADR 0008 |
| T13 | Prueba de contraste de los tokens (`tests/design/contrast.test.ts`, paso 4) y su caso negativo | Principio 4: el contraste de la §11 se verifica de forma automática desde ahora, no solo con axe en la F0b | ADR 0008 |
| T14 | Duraciones de animación a `0ms` salvo con `prefers-reduced-motion: no-preference` | Las animaciones que usan los tokens se desactivan solas (§10) | `tokens.css` |
| T15 | El orden de las capas va en un `<style is:inline>` al principio de `<head>`, con su hash calculado en `astro.config.ts`. ADR 0013 nuevo, porque el 0008 ya estaba aceptado | Comprobado en el build: Astro pone los estilos de los componentes antes que el CSS global, y `components` quedaba con la prioridad más baja | ADR 0013 |
| T16 | Interruptor de tema con tres botones `aria-pressed` (`Claro`, `Oscuro`, `Sistema`) en un `role="group"`; se muestra con `data-js`, que marca el script de tema antes del primer pintado; guarda también `system` | Texto en lugar de iconos (sin SVG ni traducciones de `title`); sin desplazamiento del contenido al aparecer; la §10 pide guardar los tres valores | `ThemeToggle.astro`, `theme-script.ts` |
| T17 | La cabecera enlaza solo a inicio y "sobre mí"; el enlace a las herramientas llega con su índice (0.7) | Un enlace a una página inexistente sería un enlace roto (paso 6) | `Header.astro` |
| T18 | Pie con autoría y enlace al repositorio, sin año | El año exigiría una fecha del build o actualizarlo a mano | `Footer.astro` |
| T19 | Enlace para saltar al contenido, `<main id="main">` en el layout y ancho máximo `--page-max: 60rem` como token | Accesibilidad con teclado (§9); el `<main>` sale de las páginas para que no se anide | `Base.astro`, `tokens.css` |

### Decidido sin consultar (sesión 7, bloque 4)

| # | Decisión | Motivo | Dónde queda |
|---|---|---|---|
| A1 | Limpieza de comentarios: se quitan los que describen el archivo o repiten el código, y los encabezados de sección; se conservan los que explican un porqué o una restricción, acortados, con su referencia (§ o ADR) y sin los identificadores de este archivo (D3, T7). Dos nombres sustituyen comentarios (`cspHash`, `copyTrackedFiles`) y una tupla con nombres el de `pairs` | Regla de estilo de `AGENTS.md` (PR #18) | PR #19 |
| A2 | La limpieza no toca `docs/PLAN.md`, los ADR ni este archivo, ni las etiquetas de sección de `.gitignore` ni las `description` de `renovate.json` | Los ADR aceptados no se editan (§15) y el plan cambia por revisiones con ok; las etiquetas y las descripciones son parte del formato de esos archivos | — |
| A3 | Validador: Valibot 1.5.0 (2,0 KB con gzip frente a 6,5 KB de `zod/mini` y 26,3 KB de Zod 4.6.6, con el mismo esquema y esbuild del lockfile) | Indicación del usuario: el de menor peso medido que cubra lo necesario. Zod 4.6.7 no cumplía la edad mínima | ADR 0011 |
| A4 | `defineTool` solo tipa; `parseToolMeta` valida y devuelve `Result` con `ruta: mensaje`, y el registro (0.7c) lo convierte en `invalid_meta` | Si `defineTool` lanzara al importarse, el build no podría informar de todos los errores juntos (§5.4) | ADR 0011 |
| A5 | `src/core/result.ts` se adelanta a la 0.7a, y con él `tsc -p tsconfig.domain.json` entra en `pnpm check` (paso 2) | `parseToolMeta` lo devuelve; con un archivo en `core/` el comando ya no falla con TS18003 | `package.json`, ADR 0011 |
| A6 | Casos nuevos de `tests/gates/`: una API del navegador en `core` (paso 2) y `core` importa el validador (paso 3) | El paso 2 ya incluye `tsc` de las capas puras, y ningún caso probaba aún un paquete externo prohibido por capa | `cases.ts` |
| A7 | Decisión 6: scripts de Astro sin framework. La página envuelve `Tool.astro` en un elemento con `data-hydration`; su `<script>` pasa un `import()` a una función de `platform/` (0.7b) que lo carga al instante o con `IntersectionObserver` | Recomendación del plan (indicación del usuario). `ui/` no importa `meta.ts`, así que la estrategia llega por el HTML. La `<meta>` CSP lleva `script-src 'self'` y admite los chunks del `import()` | ADR 0005 |
| A8 | `Tool.astro` no importa `astro`: declara `Props` y usa el global `Astro` | Cierra el pendiente de la 0.1b sin tocar la tabla de la §5.2 | ADR 0005 |
| A9 | `platform/files.ts` se aplaza a la F1 | La §6 no define su puerto y ninguna herramienta lo usa todavía; la F1 es la primera que abre y descarga archivos | — |
| A10 | Límite de persistencia: `maxStoredBytes = 1_000_000` (1 MB decimal) | Lectura más conservadora de "1 MB" (§11) | `versioned-store.ts` |
| A11 | El valor guardado es `{ version, data }`. `load` migra paso a paso con `migrations[n]` (n → n + 1); una versión futura o sin migración da `unsupported_version`; un valor inválido se borra y se devuelve el error | §5.6: "un valor inválido se descarta, se informa en la interfaz y la herramienta arranca vacía". Borrarlo evita repetir el aviso en cada visita | `versioned-store.ts` |
| A12 | `utf8ByteLength` propia en `core`, con 3 bytes por sustituto suelto | `core` no puede usar `TextEncoder` (§5.2); `JSON.stringify` escapa los sustitutos sueltos, así que el caso es teórico | `versioned-store.ts` |
| A13 | `createLocalStore` lee `localStorage` en cada operación; los errores de cuota (también el nombre antiguo de Firefox) dan `quota_exceeded` y cualquier otro, `unavailable` | Acceder a `localStorage` lanza si el navegador lo bloquea | `local-store.ts` |
| A14 | `createWebCryptoHasher` copia las vistas sobre `SharedArrayBuffer` | Web Crypto no las admite, y el tipo de TypeScript 6 lo refleja | `web-crypto.ts` |
| A15 | `platform/hydration.ts` (A7): sin `data-hydration` o sin `IntersectionObserver`, carga al instante | Cargar de más es preferible a no cargar la interfaz | `hydration.ts` |
| A16 | Las pruebas de `platform/` corren en el entorno `node` con dobles (`Storage`, `IntersectionObserver`) y el Web Crypto de Node; sin umbral de cobertura | §11 fija el umbral solo en `core` y `domain`; el comportamiento real en los navegadores lo cubren las E2E (F0b) | `src/platform/*.test.ts` |
| A17 | Casos nuevos de `tests/gates/`: `domain` importa `platform` (pasos 2 y 3) | Ejemplo de la §12 | `cases.ts` |
| A18 | El caso de cobertura de `tests/gates/` usa un archivo con 500 ramas sin cubrir y una firma sin porcentaje fijo | Con las ramas cubiertas de `versioned-store.ts`, el 50 % de un solo archivo ya no bajaba del 90 % el umbral global, y el caso dejó de fallar (CI de la PR #21). Se mantiene el umbral global de la §11 | `cases.ts` |
| A19 | El registro recibe solo las claves de un `import.meta.glob` perezoso de `ui/Tool.astro`; la página de la herramienta lo importa con su propio glob | I3: comprobar la ruta sin importar `ui/` (§5.2) | ADR 0014 |
| A20 | `i18n.ts` exporta `texts = defineToolTexts({ es, en })`, en `src/i18n/tool-texts.ts`, con `name` y `description` obligatorios; `en` se tipa con `NoInfer<Dict<T>>` y las claves se comparan al cargarse (`assertSameKeys`, compartida con el diccionario del sitio) | §5.7 para las herramientas, con el paso 2 y el 5. El registro no puede importar `i18n`, así que valida la forma con Valibot sin conocer los idiomas, y las páginas usan `textsFor` | ADR 0014 |
| A21 | `RegistryError` suma `missing_meta` e `invalid_i18n` | Sin ellos, una carpeta sin `meta.ts` se ignoraría y un `i18n.ts` mal formado fallaría más tarde sin contexto. Amplía la §6 sin cambiar los casos existentes | ADR 0014 |
| A22 | `meta.ts` con export por defecto; errores ordenados por carpeta y entradas por slug; el build falla con una línea por error | Mensajes deterministas para las firmas de `tests/gates/` | `build-registry.ts` |
| A23 | El índice de herramientas muestra "Todavía no hay herramientas" mientras no haya ninguna, y una etiqueta `beta` según `status`; la cabecera enlaza al índice antes que a "sobre mí" | T17 dejó el enlace para cuando existiera el índice | `[tools]/index.astro`, `Header.astro` |
| A24 | ADR 0014 nuevo, aceptado | El contrato de la §6 se amplía y aparece un patrón nuevo (textos por herramienta); el ADR 0005 ya está aceptado y no se edita | ADR 0014 |
| A25 | Casos nuevos de `tests/gates/`: `meta.ts` inválido, slug duplicado y falta `ui/Tool.astro` (paso 5); texto de herramienta que falta (pasos 2 y 5) | Ejemplos de la §12 para el registro y la i18n de las herramientas | `cases.ts` |
| A26 | README: secciones "Arquitectura" y "Agregar una herramienta" | §15 | `README.md` |

### Decidido sin consultar (sesión 8, bloque 5)

| # | Decisión | Motivo | Dónde queda |
|---|---|---|---|
| E1 | El nombre del sitio es una sola constante, `siteName` en `src/i18n/site.ts`, y no se traduce: la versión en inglés pasa de "Portfolio" a "Portafolio". Se eliminan `site.name`, `home.title` y `home.heading` de los diccionarios | Indicación del usuario: una sola constante. Es un nombre propio | `src/i18n/site.ts` |
| E2 | `ToolList.astro` compartido por el inicio y el índice de herramientas; sin herramientas no pinta nada | El registro ya da `tools` y `textsFor`; evita duplicar la lista | `src/components/ToolList.astro` |
| E3 | `::selection` con el acento de fondo y `--color-on-accent` | Sin esto, el navegador pinta la selección en su azul por defecto, que el usuario descartó. Es el único uso del acento como fondo | `base.css`, ADR 0015 |
| E4 | `--color-focus` como token propio, con el mismo valor que el acento | El par de 3:1 del foco se comprueba aunque el acento cambie | `tokens.css`, ADR 0015 |
| E5 | Botón activo del interruptor de tema: superficie y texto en el acento, como en la vista previa aprobada | Sustituye la inversión de texto y fondo | `ThemeToggle.astro` |
| E6 | Los nombres de herramienta de la lista van en `--font-heading` | Coherencia con los títulos | `ToolList.astro` |
| E7 | "Sobre mí" usa la `meta description` del sitio | El usuario no dio una propia | `[about]/index.astro` |
| E8 | La prueba de `messages` compara `tools.title` en lugar de `site.name` | `site.name` ya no existe | `i18n.test.ts` |
| E9 | El contenido editorial (descripción, textos de inicio y de "sobre mí") pasa de `es.ts`/`en.ts` a `src/i18n/editorial.ts`, con su licencia en la cabecera y sus claves comparadas al cargarse; `es.ts` y `en.ts` quedan solo con textos de interfaz (MIT) | El ADR 0009 pedía revisar en la 0.8 la frontera entre contenido y textos de interfaz, y separar los archivos que mezclaran ambos. Se detectó al revisar los ADR en la 0.9 | `editorial.ts`, README |
| E10 | ADR 0007 escrito como propuesto, con las opciones y la decisión de la §4 y la §7; las versiones, el peso y los riesgos 15 y 16 quedan para la F1 | §14, 0.9: "el 0007 queda propuesto hasta la F1" | ADR 0007 |
| E11 | En el ADR 0008 solo cambia la línea de estado, para indicar qué partes sustituyen el 0013 y el 0015 | La §15 prevé el estado "sustituido por NNNN"; el resto del 0008 sigue vigente | ADR 0008 |
| E12 | El ADR 0012 (Temporal) no se escribe en la F0a | Su decisión es de la F2, y el criterio de la F0a pide los ADR 0001–0011 | — |
| E13 | La recalibración se propone aquí y no se aplica a la §14 | Cambiar el plan exige una revisión con ok del usuario | "Recalibración" |
| E14 | Revisión de los ADR 0001–0015: sin más cambios. El 0002 y el 0005 dicen que `allowBuilds` está vacío (el 0003 añadió `esbuild` y `workerd` denegados) y el 0005 deja pendiente comparar los hooks con los de Ontos (cerrado por el usuario, I6). Son aceptados y no se editan; quedan anotados aquí | §15 | — |

## Recalibración de las estimaciones (sesión 8, aplicada en la revisión 1.5)

F0a: **6,55 h** registradas (tabla de tareas cerradas, incluidas la sesión 0, las revisiones del plan y la 0.9), frente a 36–52 h estimadas. No incluyen el tiempo del usuario en sus cuentas ni sus revisiones.

La propuesta inicial (mínimo × 0,15 y máximo × 0,35) no se aprobó: una sola fase de andamiaje no basta para reducir tanto. El usuario fijó mínimo × 0,2 y máximo × 0,5, y una nueva recalibración al cerrar la F0b con los datos de dos fases.

| Fase | Revisión 1.4 (h) | Revisión 1.5 (h) |
|---|---|---|
| F0b | 23–34 | 4,5–17 |
| F1 | 23–35 | 4,5–17,5 |
| F2 | 15–25 | 3–12,5 |
| F3 | 10–15 | 2–7,5 |
| F4 | 25–40 | 5–20 |

Límite de revisión de la F0b: 25,5 h (1,5 × 17). Total del proyecto: unas 25,5–81 h con la F0a medida.

## Textos provisionales

- Nombre del sitio: "Portafolio" (`siteName`, decisión del usuario en la sesión 8).

## División de la F0a en sesiones (aprobada)

**Regla de los ADR (ajuste del usuario):** cada ADR se escribe en la sesión donde se toma su decisión, no todos en la 0.9. Si un ADR reúne decisiones de varias sesiones, queda "propuesto" y se acepta en la última sesión que lo completa. La 0.9 queda para revisar y completar los ADR que falten, el `CHANGELOG.md` y la recalibración.

Reparto de los ADR (0009, 0006, 0011 y 0005 los fijó el usuario; el resto es propuesta derivada de la regla):

| ADR | Se escribe | Se acepta |
|---|---|---|
| 0001 Sitio estático | sesión 1 (0.1a) | sesión 1 |
| 0002 Astro, TS, pnpm, dependencias | sesión 1 (0.1a) | sesión 1 |
| 0009 Visibilidad y licencias | sesión 1 (0.1a) | sesión 1 |
| 0005 Arquitectura y decisión 6 | 0.1b (fronteras) | 0.7a (decisión 6) |
| 0010 Pruebas y auditoría | 0.2a (Vitest) | 0.11 (Playwright, Lighthouse) |
| 0003 Cloudflare | 0.3 | 0.12 (URL de versión o Previews) |
| 0004 CSP y cabeceras | 0.4 | 0.4 |
| 0006 i18n | 0.5 | 0.5 |
| 0008 CSS | 0.6a | 0.6a |
| 0011 Validador | 0.7a | 0.7a |
| 0007 unified/KaTeX | 0.9 (sin decisión en la F0a) | F1 (riesgos 15 y 16) |
| 0012 Temporal | F2 | F2 |

| Sesión | Contenido |
|---|---|
| 1 | Rev 1.3 + **0.1a**: `git init -b main`, estructura, plan → `docs/PLAN.md`, licencias, `.gitattributes`, `.editorconfig`, `package.json`, `pnpm-workspace.yaml`, Astro + TS estricto, `tsconfig.domain.json`, instrucciones para asistentes, `IDEAS_FUTURAS.md`, esqueleto del README |
| 2 | **0.1b**: ESLint (boundaries, `.astro` con `<script>`, paquetes por capa; verificación §4), Prettier, hooks |
| 3 | **0.2a**: repo en GitHub, `ci.yml` pasos 1–5, protección de `main` |
| 4 | **0.2b**: `tests/gates/` y job de pruebas negativas |
| 5 | **0.3**: Cloudflare, secretos, entorno `production`, `deploy.yml` |
| 6 | **0.4**: seguridad y `_redirects` |
| 7 | **0.5**: i18n |
| 8–9 | **0.6a** tokens, capas, tema · **0.6b** layout y componentes |
| 10–12 | **0.7a** validador (ADR 0011) y decisión 6 (ADR 0005) · **0.7b** `core/` y `platform/` · **0.7c** registro, índice, ruta dinámica |
| 13 | **0.8**: contenido (textos del usuario) |
| 14 | **0.9**: ADR restantes, `CHANGELOG.md`, recalibración |

## Revisión 1.3 (aplicada el 18/10/2026; se conserva por I3, I4 e I6)

El usuario aprobó V1, V2, V3, I1, I2 e I5. Además, el diff debe reflejar en la §14 (tarea 0.9 y tareas afectadas) la regla de los ADR por sesión, y se presenta para su ok.

Versiones verificadas el 18/10/2026 en npm y en la documentación oficial:

- **V1 TypeScript:** `latest` = 7.0.2, pero `@astrojs/check` 0.9.10 pide `^5 || ^6` y `typescript-eslint` 8.71 pide `<6.1.0`. Fijar **TypeScript 6.0.3** (ADR 0002).
- **V2 pnpm 12.14:** `.npmrc` solo lee auth/registry; la configuración va en **`pnpm-workspace.yaml`** (falta en el árbol de §5.1). `onlyBuiltDependencies` → `allowBuilds`; `strictDepBuilds` activo por defecto. Añadir `minimumReleaseAge: 10080` (minutos = 7 días) además de Renovate.
- **V3 Astro:** §4 dice "≥ 6"; actual 7.4.0 → "Astro 7". Confirmado: `security.csp` estable; `ClientRouter` y Shiki no soportados con CSP; CSP no funciona en `astro dev`; `scopedStyleStrategy: 'attribute'` por defecto; `build.assets` = `_astro`; Sätteri es el procesador de Markdown por defecto.
- **V4 ESLint 10:** `eslint-plugin-astro` 3.2.1 exige ESLint ≥ 10 y `eslint-plugin-jsx-a11y` como peer (dependencia de desarrollo).
- **V5 Cloudflare:** sin cambios. `404-page`, `auto-trailing-slash` (ya es el valor por defecto), `preview_urls` y Previews recomendado para PR coinciden con el plan.
- **I1 Orden 0.3/0.4:** la 0.3 despliega sin `noindex` ni cabeceras. Propuesta: la 0.3 despliega ya un `_headers` mínimo con `X-Robots-Tag: noindex`.
- **I2 Gates en la 0.2:** los casos de ejemplo de los pasos 2, 3 y 5 dependen de código de la 0.5 y la 0.7, y Vitest falla sin pruebas. Propuesta: la 0.2 usa casos genéricos con fixtures; la 0.5 y la 0.7 añaden los específicos.
- **I5 Archivos sin tarea:** `docs/IDEAS_FUTURAS.md` y esqueleto del README → 0.1; entrada de la F0a en `CHANGELOG.md` → 0.9; `docs/PROGRESO.md` → añadir a §5.1 y §15.

Se resuelven en su tarea, sin cambiar el plan ahora:

- **I3 (0.7):** el registro debe detectar si falta `ui/Tool.astro` sin importar `tools/*/ui/` (§5.2): comprobar solo la ruta.
- **I4 (0.3):** cómo ejecutar wrangler "en la versión del lockfile" en un job que no instala el proyecto (§7).
- **I6 (0.1b):** hooks según el esquema de Ontos. **Cambio del usuario (sesión 2):** se escribieron desde cero según la §12, sin mirar Ontos. El usuario decidió no compararlos con los de Ontos. Cerrado.

## Entorno (18/10/2026)

- Windows 11; Git 2.54. El `gitconfig` del sistema tiene `autocrlf=true` (lo neutraliza `.gitattributes`) y rama por defecto `master` (usar `git init -b main`).
- **Node 24.21.0** (MSI oficial, SHA-256 y firma de OpenJS verificados). No 24.22.0 ni pnpm 12.14.0: no cumplían los 7 días de edad mínima el 18/10/2026 (decisión del usuario).
- **pnpm 12.12.1** standalone en `%LOCALAPPDATA%\pnpm` (instalado con `get-pnpm` 0.0.5, revisado antes de ejecutar). `PNPM_HOME` añadido al `Path` de usuario: las terminales abiertas antes no lo ven.
- winget registra el Node instalado como `OpenJS.NodeJS.22`: no usar `winget upgrade` para Node.
- `gh` 2.97 con sesión como `slesgmd` (permisos `repo`, `workflow`). wrangler irá como dependencia de desarrollo.
- Repositorio git en `main` desde la sesión 1; historial rehecho el 18/10/2026 para dejarlo neutro (aún sin publicar). Los archivos locales del asistente se ignoran en `.git/info/exclude`, no en `.gitignore`. El script `pnpm` para sh falla con rutas de Windows: usar pnpm desde PowerShell.
- Los hooks invocan las herramientas con `node node_modules/<paquete>/...`, sin pnpm, por el punto anterior. `core.hooksPath=.githooks` ya está configurado en este clon.
- En terminales abiertas antes de instalar pnpm, `pnpm` no está en el `Path`. Se usa `%LOCALAPPDATA%\pnpm\bin`.

## Pendientes y bloqueos

- `eslint-plugin-jsx-a11y-x` tiene un solo mantenedor visible. Volver a `eslint-plugin-jsx-a11y` cuando admita ESLint 10 (ADR 0005).
- Retirar el override de `eslint-module-utils` cuando `eslint-plugin-boundaries` dependa de la 2.14.0 o de una posterior. Revisarlo en cada PR de Renovate que lo actualice.
- La verificación de la §4 se hizo con fixtures temporales, no versionados. Los casos permanentes van en `tests/gates/` (0.2b y 0.7).
- `deploy.yml` muestra un aviso `DEP0005` (`Buffer()`) de una dependencia de wrangler. No afecta; revisar si persiste al actualizar wrangler.
- Atribución desactivada en los ajustes de usuario del asistente (fuera del repositorio); el hook `commit-msg` de la 0.1b es la segunda barrera.
- La `<meta>` CSP que inserta Astro queda detrás de los elementos de `<head>` del layout, y una CSP en `<meta>` solo rige lo que viene después (ADR 0013). Hoy solo hay contenido estático propio delante. Tenerlo en cuenta en `verify-dist.ts` (0.10).
- `public/robots.txt` no existe (T8): decidir en la 0.11 o al fijar el dominio.
