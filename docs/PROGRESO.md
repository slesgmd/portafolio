# Progreso

Memoria entre sesiones. Al empezar, leer este archivo y la sección del plan de la tarea actual.

Fuente de verdad: `docs/PLAN.md` (revisión 1.4). Las revisiones anteriores están en `C:\dev\Portafolio-historico\`.

## Estado actual

- **Fase:** F0a — Sitio en producción.
- **Sesión 1:** cerrada (18/10/2026). Revisiones 1.3 y 1.4 del plan, entorno y tarea **0.1a**.
- **Siguiente sesión:** 2 → tarea **0.1b** (ESLint, Prettier, hooks).

## Siguiente paso concreto

1. Pedir al usuario la ruta local de Ontos para leer el esquema de sus hooks (I6).
2. Plan breve de la 0.1b y esperar el ok. Incluye:
   - ESLint 10 con eslint-plugin-astro (exige `eslint-plugin-jsx-a11y` como peer, V4) y eslint-plugin-boundaries; verificación de la §4 sobre `.astro` con `<script>` y paquetes por capa.
   - Prettier con prettier-plugin-astro.
   - Hooks `pre-commit` y `commit-msg` en `.githooks/`.
   - ADR 0005 propuesto, con las fronteras.
3. Todas las versiones deben cumplir los 7 días de edad mínima.
4. El hook `commit-msg` también rechaza los mensajes que nombran al asistente de código o a su proveedor (rev. 1.4). Los términos se escriben con clases de caracteres.

**Para la 0.2a** (rev. 1.4): `scripts/check-provenance.ts` en el paso 3, con `fetch-depth: 0`, y su prueba negativa en un repositorio git temporal (trailer `Co-authored-by`, mensaje, contenido y nombre de archivo; más un caso limpio). `ASTRO_TELEMETRY_DISABLED=1` en los workflows.

## Tareas cerradas

| Tarea | Commit | Horas |
|---|---|---|
| Sesión 0 (revisión, sin tarea del plan) | — (sin repo) | 0,5 |
| Revisiones 1.3 y 1.4 del plan | `docs: añade el plan (rev. 1.4) y el progreso` | 0,5 |
| 0.1a Repositorio base | `chore: inicializa el repositorio con Astro y TypeScript` | 0,5 |

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
- **I6 (0.1b):** hooks según el esquema de Ontos; el usuario dará la ruta local en la 0.1b.

## Entorno (18/10/2026)

- Windows 11; Git 2.54. El `gitconfig` del sistema tiene `autocrlf=true` (lo neutraliza `.gitattributes`) y rama por defecto `master` (usar `git init -b main`).
- **Node 24.21.0** (MSI oficial, SHA-256 y firma de OpenJS verificados). No 24.22.0 ni pnpm 12.14.0: no cumplían los 7 días de edad mínima el 18/10/2026 (decisión del usuario).
- **pnpm 12.12.1** standalone en `%LOCALAPPDATA%\pnpm` (instalado con `get-pnpm` 0.0.5, revisado antes de ejecutar). `PNPM_HOME` añadido al `Path` de usuario: las terminales abiertas antes no lo ven.
- winget registra el Node instalado como `OpenJS.NodeJS.22`: no usar `winget upgrade` para Node.
- `gh` 2.97 con sesión como `slesgmd` (permisos `repo`, `workflow`). wrangler irá como dependencia de desarrollo.
- Repositorio git en `main` desde la sesión 1; historial rehecho el 18/10/2026 para dejarlo neutro (aún sin publicar). Los archivos locales del asistente se ignoran en `.git/info/exclude`, no en `.gitignore`. El script `pnpm` para sh falla con rutas de Windows: usar pnpm desde PowerShell.

## Pendientes y bloqueos

- Ruta local de Ontos para leer sus hooks: la dará el usuario en la 0.1b.
- `tsconfig.domain.json` falla con TS18003 mientras `core/` y `domain/` estén vacíos: conectarlo al paso 2 cuando tengan código (ADR 0002).
- Telemetría de Astro: desactivada en local (18/10/2026). En CI, `ASTRO_TELEMETRY_DISABLED=1` en los workflows de la 0.2a.
- Atribución desactivada en los ajustes de usuario del asistente (fuera del repositorio); el hook `commit-msg` de la 0.1b es la segunda barrera.
