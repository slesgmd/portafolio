# Portafolio — Plan de la v1 (revisión 1.4)

**Fecha:** 18/10/2026

**Nombre provisional del repositorio:** `portafolio`

**Estado del repositorio:** público (§16, decisión 1; ADR 0009)

**Relación con Ontos:** proyecto independiente. Ontos tiene prioridad de tiempo, y el sitio no publica nada de Ontos que no sea ya público (§3, principios 8 y 9).

---

## Cambios respecto a la revisión 1.3

1. **Repositorio neutro.** Ningún archivo versionado, nombre de archivo, commit, etiqueta, pull request ni contribuidor nombra al asistente de código ni a su proveedor. Las instrucciones para asistentes pasan a `AGENTS.md`, un formato que leen varios asistentes; el archivo propio de cada uno, si lo necesita, es local y solo importa `AGENTS.md` (§5.1, §12, §14, §15).
2. **Comprobación de procedencia en el paso 3.** Falla si algún commit de la PR tiene un trailer `Co-authored-by` o nombra al asistente o a su proveedor, o si algún archivo versionado o nombre de archivo los nombra. Tiene su prueba negativa y se crea en la tarea 0.2 (§12, §14).
3. **Telemetría de Astro desactivada** en local y en los workflows (§12).

---

## 1. Objetivo

Construir un sitio personal, estático y bilingüe que funcione como caja de herramientas propia y, en segundo plano, como portafolio. Cada herramienta resuelve un problema frecuente, se ejecuta por completo en el navegador y se puede agregar o quitar sin tocar el resto del sitio.

## 2. Alcance

**Incluye:**

- Páginas de inicio y "sobre mí", en español e inglés.
- Índice de herramientas generado a partir de un registro.
- Herramientas: visor de Markdown, calculadora de horas, formateador de JSON, hash SHA-256, conversor de bases y conversor de unidades.
- Uso sin conexión (PWA).
- Pipeline de CI/CD con compuertas bloqueantes y vistas previas por pull request.

**Excluye** (documentado en `docs/IDEAS_FUTURAS.md`):

- Servidor, base de datos y cuentas: ninguna herramienta los necesita, y solo añadirían superficie de ataque y mantenimiento.
- Página de Ontos, sección de proyectos, bitácora y CV, hasta que tengan contenido (§14).
- Analítica: contradice el principio 1.
- Transiciones de vista con `ClientRouter` y resaltado de código con Shiki: son incompatibles con la CSP de Astro (§7).
- Monorepo: las fronteras se imponen con ESLint y TypeScript; si algún día se comparte `domain/`, se extrae sin cambios.
- Tailwind, Storybook, regresión visual, CMS y librerías de manejo de estado: su costo de mantenimiento supera lo que aportan en un sitio de este tamaño.
- Actualización incremental del DOM en la vista previa del Markdown: solo se aborda si el umbral de la F1 resulta insuficiente, y con un ADR (§17, riesgo 14).

## 3. Principios

1. Ningún dato sale del navegador. No hay servidor, analítica ni peticiones a terceros, y todo recurso se sirve desde el propio origen.

2. El dominio no usa APIs del navegador. La lógica de cada herramienta es TypeScript puro, y las APIs del entorno entran por puertos (§5.5).

3. Cada herramienta es un módulo autocontenido. Agregarla es crear una carpeta; quitarla, borrarla.

4. Toda regla importante se verifica de forma automática, y cada compuerta del pipeline tiene una prueba negativa que demuestra que falla cuando debe (§12).

5. Toda decisión técnica queda en un ADR (`docs/adr/`). Cambiar un parámetro de la §11 requiere un ADR nuevo.

6. Toda dependencia de ejecución nueva requiere un ADR con alternativas, tamaño y estado de mantenimiento.

7. La calidad se define antes de construir (§13) y no se relaja para cerrar una fase.

8. El sitio no publica parámetros, umbrales ni diseño experimental de Ontos antes de su registro en OSF (PLAN de Ontos, §11.3). El código de Ontos nunca entra en este repositorio. El tooling genérico que usen ambos proyectos, como el hook `commit-msg`, se mantiene aquí como archivo propio, sin lógica ni referencias a Ontos.

9. Ontos tiene prioridad. El sitio no consume las horas semanales previstas para Ontos.

## 4. Stack

| Área | Elección | Motivo | ADR |
|---|---|---|---|
| Hosting | Cloudflare Workers solo con assets estáticos, sin código de Worker | Recomendación actual de Cloudflare para proyectos nuevos; admite `_headers`, `_redirects` y una URL por versión para las vistas previas | 0003 |
| Despliegue | `wrangler` desde GitHub Actions, sin la integración Git de Cloudflare | Solo se despliega lo que pasó todas las compuertas | 0003 |
| Framework | Astro 7 con TypeScript 6 `strict` | HTML estático, islas, i18n y CSP con hashes (`security.csp`) integrados. TypeScript 7 aún no es compatible con `@astrojs/check` ni con `typescript-eslint` | 0002 |
| Interfaz de herramientas | Por decidir: scripts de Astro sin framework, o un framework de islas (§16, decisión 6) | Las directivas `client:*` solo funcionan con componentes de frameworks de UI | 0005 |
| Paquetes | pnpm, versión fijada en `packageManager` y configuración en `pnpm-workspace.yaml`; Node LTS en `.nvmrc` y `engines` | Builds reproducibles; los scripts de instalación de dependencias se bloquean salvo lista blanca (`allowBuilds`) | 0002 |
| Estilos | CSS propio: tokens, `@layer`, OKLCH; fuentes del sistema | Cero dependencias y cero peticiones de fuentes | 0008 |
| Markdown | unified: remark-gfm, remark-math, rehype-sanitize y rehype-katex con salida MathML | Ecosistema maduro que funciona en el navegador, con plugins de GFM, fórmulas y saneamiento. Astro ya no lo usa por defecto (su procesador actual es Sätteri), pero el visor no depende de él. MathML evita casi todos los atributos `style`, incompatibles con la CSP (§7) | 0007 |
| Fechas y horas | Temporal nativo; polyfill empaquetado que se carga solo si falta | `Date` maneja mal zonas y duraciones; Chrome, Edge y Firefox ya traen Temporal, Safari aún no | 0012 |
| Validación | Por decidir entre Zod 4, `zod/mini` y Valibot | Metadatos de herramientas y datos persistidos. Va en el bundle del navegador y cuenta contra los límites de la §11 | 0011 |
| Pruebas unitarias | Vitest (entorno `node`) y fast-check | Equivalente a pytest con Hypothesis | 0010 |
| Pruebas E2E | Playwright (Chromium, Firefox, WebKit) con @axe-core/playwright, contra `wrangler dev` | Flujos reales, accesibilidad, red, cabeceras y redirecciones | 0010 |
| Calidad | ESLint con eslint-plugin-astro y eslint-plugin-boundaries; Prettier con prettier-plugin-astro | Fronteras y paquetes por capa verificados también en archivos `.astro` | 0005 |
| Auditoría | Lighthouse CI | Rendimiento y accesibilidad medidos | 0010 |
| Dependencias | Renovate | Edad mínima de publicación y actualizaciones agrupadas | 0002 |

En la tarea 0.1 se verifica que eslint-plugin-boundaries analiza los imports de los archivos `.astro`, incluidos sus bloques `<script>`, y que puede restringir los paquetes externos por capa. Si no lo hace, se sustituye por `no-restricted-imports` con alias de ruta, y se registra en el ADR 0005.

## 5. Arquitectura

### 5.1 Estructura del repositorio

```
portafolio/
├── README.md LICENSE LICENSE-CONTENT CHANGELOG.md AGENTS.md
├── package.json pnpm-lock.yaml pnpm-workspace.yaml .nvmrc .editorconfig .gitattributes .gitignore renovate.json
├── astro.config.ts wrangler.jsonc tsconfig.json tsconfig.domain.json
├── eslint.config.js .prettierrc vitest.config.ts playwright.config.ts lighthouserc.json
├── .github/workflows/   ci.yml deploy.yml weekly.yml
├── .githooks/           pre-commit commit-msg
├── docs/                PLAN.md PROGRESO.md IDEAS_FUTURAS.md adr/
├── public/              _headers _redirects robots.txt favicon.svg
├── scripts/             verify-dist.ts check-budget.ts check-provenance.ts
├── tests/gates/         casos que deben hacer fallar cada compuerta
├── e2e/                 site.spec.ts headers.spec.ts
└── src/
    ├── core/            result.ts ports/ persistence/
    ├── platform/        local-store.ts web-crypto.ts clock.ts files.ts
    ├── i18n/            es.ts en.ts routes.ts index.ts
    ├── registry/        define-tool.ts build-registry.ts build-registry.test.ts index.ts
    ├── tools/<slug>/
    │   ├── domain/      *.ts *.test.ts
    │   ├── ui/          Tool.astro *.ts worker.ts
    │   ├── e2e.spec.ts
    │   ├── i18n.ts
    │   └── meta.ts
    ├── design/          reset.css tokens.css base.css
    ├── components/      Header.astro Footer.astro LangSwitch.astro ThemeToggle.astro
    ├── layouts/         Base.astro
    ├── content/         vacío hasta la sección de proyectos
    └── pages/
        ├── 404.astro    rutas sin prefijo de idioma; bilingüe
        └── [lang]/      index.astro 404.astro [about].astro [tools]/index.astro [tools]/[slug].astro
```

La disposición exacta de `pages/` puede cambiar en la tarea 0.5 según el formato de salida del build (§5.7). Vitest solo recoge `*.test.ts`; Playwright recoge `e2e/*.spec.ts` y `src/tools/*/e2e.spec.ts`.

### 5.2 Capas y fronteras

| Capa | Ubicación | Puede importar | Paquetes externos | Entorno |
|---|---|---|---|---|
| core | `src/core/` | solo `core` | ninguno | puro |
| i18n | `src/i18n/` | ninguna capa | ninguno | puro |
| domain | `src/tools/*/domain/` | `core` | puros y declarados en un ADR: validador, unified, tipos de Temporal | puro, sin DOM |
| platform | `src/platform/` | `core` | ninguno | navegador |
| meta de herramienta | `src/tools/*/meta.ts` | `registry/define-tool.ts` | ninguno | build |
| i18n de herramienta | `src/tools/*/i18n.ts` | `i18n` | ninguno | puro |
| ui | `src/tools/*/ui/` | su propio `domain` e `i18n.ts`, `core`, `platform`, `components`, `i18n` | solo con ADR, como el polyfill de Temporal o el framework de la decisión 6 | navegador |
| registry | `src/registry/` | `core`, `tools/*/meta.ts`, `tools/*/i18n.ts` | validador | build |
| páginas | `src/pages/`, `layouts/`, `components/` | `registry`, `i18n`, `components`, `tools/*/ui/` | integraciones de Astro | build y navegador |

**Prohibido:**

- Que una herramienta importe de otra. Lo compartido sube a `core`.
- Que `domain` importe de `platform` o de `ui`.
- Que `core` importe de cualquier otra capa.
- Que una capa importe un paquete externo que no tenga permitido en la tabla.

**Mecanismos de verificación:**

1. eslint-plugin-boundaries, sobre archivos `.ts` y `.astro` (incluidos sus bloques `<script>`), con las reglas de paquetes externos por capa.
2. `tsconfig.domain.json` cubre `core/` y `tools/*/domain/` con `lib: ["ES2023"]` y `types: []`. Usar `document`, `window`, `localStorage`, `crypto` o `TextEncoder` en esas capas es un error de tipos.
3. Las pruebas de `domain` y `core` corren en el entorno `node` de Vitest, sin jsdom.

### 5.3 Anatomía de una herramienta

- `meta.ts`: contrato validado con el validador del ADR 0011 (§6).
- `i18n.ts`: todos los textos de la herramienta en `es` y `en`.
- `domain/`: lógica pura con sus pruebas.
- `ui/Tool.astro`: punto de entrada visual. La interfaz y los Web Workers viven en `ui/`.
- `e2e.spec.ts`: pruebas E2E de la herramienta (§12).

Agregar una herramienta consiste en crear la carpeta con estos cinco elementos, sin modificar ningún otro archivo del sitio.

### 5.4 Registro

- `build-registry.ts` es una función pura: recibe los módulos descubiertos con `import.meta.glob` y devuelve el índice o una lista de errores tipados.
- El build falla si:
  - un `meta.ts` no pasa la validación;
  - el `slug` no coincide con el nombre de la carpeta;
  - hay dos `slug` iguales;
  - falta `ui/Tool.astro` o `i18n.ts`.
- Se prueba con módulos ficticios, sin depender de las herramientas reales.
- `[tools]/[slug].astro` genera una página por herramienta e idioma a partir del índice.

### 5.5 Puertos y errores

- Las APIs del entorno (almacenamiento, Web Crypto, reloj) se definen como interfaces en `core/ports/`, se implementan en `platform/` y se inyectan desde `ui/`.
- El dominio recibe datos ya convertidos (por ejemplo, `Uint8Array` en lugar de texto), nunca objetos del navegador.
- Los errores esperables, como una entrada inválida o el almacenamiento lleno, se devuelven como `Result<T, E>` con `E` como unión discriminada. El dominio no lanza excepciones para ellos.
- `ui/` traduce cada código de error a un mensaje en el idioma activo.

### 5.6 Persistencia

- Claves con espacio de nombres: `tool:<slug>`. El valor guardado incluye su versión de esquema.
- Al leer, se valida con el validador del ADR 0011. Un valor inválido se descarta, se informa en la interfaz y la herramienta arranca vacía.
- Un cambio de esquema exige una migración explícita de `vN` a `vN+1`, con prueba.
- Toda herramienta con persistencia ofrece exportar e importar sus datos en JSON (§17, riesgo 7).
- Los errores de cuota (`QuotaExceededError`) se devuelven como `Result`.
- El límite de la §11 se mide en bytes UTF-8 del valor serializado. Un valor que lo supera no se guarda, y la interfaz lo indica.
- `localStorage` es síncrono: la duración de cada escritura cuenta en la medición del hilo principal (§8).

### 5.7 Internacionalización

- Idiomas: `es` (por defecto) y `en`. Todas las rutas llevan prefijo: `/es/...` y `/en/...`.
- `/` redirige a `/es/` con `_redirects` (302). No hay detección automática de idioma, porque en un sitio estático exige JavaScript o servidor.
- Los segmentos de sección se localizan con un mapa estático: `herramientas`/`tools` y `sobre-mi`/`about`.
- Los slugs de herramienta son identificadores compartidos en inglés: `markdown`, `time`, `json`, `sha256`, `base`, `units`.
- El selector de idioma enlaza a la página equivalente y no usa JavaScript.
- `es.ts` es la fuente de verdad. `en.ts` se declara con `satisfies Dict<typeof es>`, de modo que una clave faltante o sobrante es un error de compilación. La regla se aplica también al `i18n.ts` de cada herramienta.
- **Barra final:** todas las URL terminan en `/`. Astro usa `trailingSlash: 'always'`, y `wrangler.jsonc` fija `html_handling: "auto-trailing-slash"` de forma explícita. `canonical`, `hreflang` y el sitemap usan esa forma, y las E2E comprueban que esas URL responden 200 sin redirección intermedia.
- **404 por idioma:**
  - Cada idioma tiene su propia 404, `/es/404.html` y `/en/404.html`, que Cloudflare sirve con `not_found_handling: "404-page"`. Ese modo busca el `404.html` más cercano subiendo por la ruta.
  - La 404 raíz cubre las rutas sin prefijo de idioma y es bilingüe.
  - En la tarea 0.5 se verifica que el build emite esos nombres de archivo. Si `build.format: 'directory'` los emite como `404/index.html`, se usa `build.format: 'preserve'` con páginas `index.astro` dentro de carpetas, y se registra en el ADR 0006.
- Cada página emite:
  - `<html lang>` y `canonical`;
  - `hreflang` para ambos idiomas, con `x-default` → `/es/`;
  - su entrada en el sitemap, con alternativas por idioma.
- Números y fechas se formatean con `Intl`, según el idioma de la ruta.

### 5.8 Hidratación y trabajo pesado

- Las páginas sin herramienta no cargan interfaz de herramientas. Solo cargan el script de tema (§10).
- Cada herramienta carga su interfaz con la estrategia indicada en su `meta.ts`: `load`, al cargar la página, o `visible`, al entrar en pantalla. Las directivas `client:*` de Astro solo funcionan con componentes de un framework de UI. Si la decisión 6 elige scripts de Astro sin framework, `visible` se implementa con `IntersectionObserver` e `import()`.
- Las librerías pesadas, como el pipeline de Markdown y KaTeX, se cargan con `import()` dinámico, solo en la página que las usa.
- El polyfill de Temporal también se carga con `import()`, y solo si `globalThis.Temporal` no existe.
- Todo trabajo que pueda superar 50 ms por interacción se ejecuta en un Web Worker. Esto incluye el procesado de Markdown, el contador de palabras y el hash de archivos.
- Los workers se crean desde archivos del propio origen, nunca desde URL `blob:` ni `data:`. `worker-src 'self'` lo impone, y así reciben la CSP de cabecera de la capa 3 (§7).
- Los workers no tienen DOM. Ninguna dependencia que se ejecute en ellos puede usarlo, aunque funcione en las pruebas de Node (§17, riesgo 15).

## 6. Contratos mínimos

```ts
// src/core/result.ts
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// src/core/ports/store.ts
export type StoreError =
  | { readonly kind: 'quota_exceeded' }
  | { readonly kind: 'unavailable' };

export interface KeyValueStore {
  get(key: string): Result<string | null, StoreError>;
  set(key: string, value: string): Result<void, StoreError>;
  remove(key: string): Result<void, StoreError>;
}

// src/core/ports/hasher.ts
export interface Hasher {
  sha256(data: Uint8Array): Promise<Uint8Array>;
}

// src/core/ports/clock.ts
export interface Clock {
  nowEpochMs(): number;
}

// src/core/persistence/versioned-store.ts
export type ParseError =
  | { readonly kind: 'invalid'; readonly issues: readonly string[] }
  | { readonly kind: 'unsupported_version'; readonly version: number };

export interface VersionedStoreSpec<T> {
  key: `tool:${string}`;
  version: number;
  parse(raw: unknown): Result<T, ParseError>;                  // la aporta la herramienta, con el validador (ADR 0011)
  migrations: Readonly<Record<number, (prev: unknown) => unknown>>; // vN → vN+1
}

// src/registry/define-tool.ts
export interface ToolMeta {
  slug: string;                         // kebab-case, igual al nombre de la carpeta
  status: 'stable' | 'beta';
  hydration: 'load' | 'visible';        // estrategia de carga de la interfaz (§5.8)
  tags: readonly string[];
  persistence: { version: number } | null;
}
export declare function defineTool(meta: ToolMeta): ToolMeta; // valida en el build (ADR 0011)

// src/registry/build-registry.ts
export type RegistryError =
  | { kind: 'invalid_meta'; folder: string; issues: string[] }
  | { kind: 'slug_mismatch'; folder: string; slug: string }
  | { kind: 'duplicate_slug'; slug: string }
  | { kind: 'missing_ui' | 'missing_i18n'; folder: string };

export declare function buildRegistry(
  modules: ToolModules,
): Result<readonly ToolEntry[], readonly RegistryError[]>;
```

## 7. Seguridad

**CSP en tres capas:**

Astro no aplica `security.csp` en `astro dev`. La CSP se comprueba siempre sobre el resultado del build (pasos 6, 8 y 11).

- **Capa 1, `<meta http-equiv>` generada por Astro (`security.csp`).**
  - `script-src` y `style-src` llevan los hashes de todo lo que Astro empaqueta.
  - Por `security.csp.directives` se añaden: `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'none'` y `worker-src 'self'`.
- **Capa 2, cabecera de las páginas (`public/_headers`, ruta `/*`).** Contiene `Content-Security-Policy: frame-ancestors 'none'`, porque una CSP en `<meta>` ignora `frame-ancestors`.
- **Capa 3, cabecera de los workers (`public/_headers`, ruta donde Astro emite los scripts; por defecto `/_astro/*`).**
  - Los workers dedicados y el service worker no heredan la CSP del documento: aplican la que llega en las cabeceras de la respuesta de su script.
  - La regla es `Content-Security-Policy: default-src 'self'; connect-src 'none'`.
  - En los scripts que no se ejecutan como worker, esta cabecera no tiene efecto, así que no afecta a las páginas.
  - El service worker de la F3 se sirve desde la raíz y tiene su propia regla, con `connect-src 'self'` para poder precachear.
- **Combinación de reglas:**
  - Cloudflare suma las reglas de `_headers` que coinciden con una petición, y une con coma los valores de una cabecera repetida.
  - Los scripts de `/_astro/*` reciben así dos políticas: la de la capa 2 y la de la capa 3. El navegador aplica las dos, y las pruebas deben aceptar esa forma.
  - Las redirecciones se aplican antes que las cabeceras. Por eso las pruebas de cabeceras se hacen sobre las páginas, no sobre la redirección de `/`.
- **Regla:** la CSP de cabecera de las páginas (capa 2) no lleva directivas de recursos (`default-src`, `script-src`, `style-src`, etc.). Cuando hay varias políticas, el navegador exige cumplirlas todas, y un `default-src` en esa cabecera bloquearía los scripts autorizados por hash en la `<meta>`.
- **Prohibido en el HTML generado:** atributos `style=`, manejadores `on*=`, scripts inline sin hash y recursos de otro origen. `scripts/verify-dist.ts` recorre `dist/` y falla si encuentra cualquiera de ellos. Tampoco se usa `define:vars`: en `<style>` genera atributos `style`, y en `<script>` convierte el script en inline.
- **Script de tema:** se autoriza por hash. Si Astro no lo incluye automáticamente, se añade a `security.csp.scriptDirective.hashes`, y `verify-dist.ts` comprueba que esté.
- **Verificación de las capas 2 y 3:**
  - Los pasos 8 y 11 comprueban las cabeceras.
  - Hasta la F1 no hay workers, y puede no haber ningún script en `/_astro/`. Por eso el paso 6 comprueba que `dist/_headers` contiene la regla de la capa 3 para la carpeta de `build.assets`.
  - Desde la F1, se comprueba además la URL real de cada worker, obtenida de la página, no una ruta fija (§17, riesgo 12).
  - Prueba negativa: un `_headers` sin la regla de la capa 3 debe hacer fallar el paso 6 y, desde la F1, también los pasos 8 y 11.

**Cabeceras** (`public/_headers`, ruta `/*`):

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
- `Cross-Origin-Opener-Policy: same-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains`, solo cuando haya dominio propio.
- `X-Robots-Tag: noindex`:
  - Mientras no haya dominio propio, se aplica a `/*`, porque todo el tráfico llega por `workers.dev` o por URL de versión.
  - Al fijar el dominio, pasa a la regla de host `https://:version.:subdomain.workers.dev/*`, que cubre la URL `workers.dev` del sitio y las URL de versión.
  - Si en su lugar se desactiva la ruta `workers.dev`, se mantiene `preview_urls: true`, porque las URL de versión se desactivan con ella.
  - El paso 11 lo verifica (§16, decisión 3).
- Caché:
  - assets con hash (`/_astro/*`): `public, max-age=31536000, immutable`;
  - HTML: la cabecera por defecto de Cloudflare, `public, max-age=0, must-revalidate`. No se define `Cache-Control` en `/*`, porque se uniría con coma a la de `/_astro/*`.

**Markdown:**

- Orden del pipeline: remark-parse → remark-gfm → remark-math → remark-rehype → plugin propio que sustituye cada imagen por su texto alternativo → rehype-sanitize (esquema por defecto más las clases de math) → rehype-katex (`output: 'mathml'`) → plugin propio que elimina los atributos `style` → rehype-stringify.
- El HTML incrustado en el Markdown no se renderiza en la v1, porque remark-rehype se usa sin `allowDangerousHtml`.
- rehype-sanitize se mantiene igualmente como defensa en profundidad; cubre, por ejemplo, los enlaces `javascript:`.
- rehype-katex corre después de rehype-sanitize, así que su salida no se sanea. Por eso se configura con `trust: false` explícito, que desactiva comandos como `\href` o `\htmlStyle`.
- Cuando una fórmula es inválida, KaTeX y rehype-katex generan un `span` con la clase `katex-error` y un atributo `style` con el color. La CSP bloquea ese atributo y registra una violación. Por eso el último plugin elimina los atributos `style`, y el color de error se aplica con CSS sobre `katex-error`.
- La v1 no renderiza imágenes. Las externas contradicen el principio 1 y la CSP las bloquearía, y las relativas apuntarían a rutas inexistentes del sitio.
- Prueba con un corpus de cargas XSS basado en OWASP, que incluye cargas dentro de fórmulas: ninguna produce `<script>`, `on*=`, `javascript:`, `style=` ni `<img>`. Una fórmula inválida tampoco produce `style=`.

**Cadena de suministro:**

- `pnpm install --frozen-lockfile` en CI.
- Scripts de instalación de dependencias bloqueados, salvo la lista blanca `allowBuilds` de `pnpm-workspace.yaml`. pnpm los bloquea por defecto (`strictDepBuilds`).
- Edad mínima de publicación de 7 días (§11), en pnpm (`minimumReleaseAge: 10080`, en minutos) y en Renovate.
- Las acciones de GitHub de terceros se fijan por SHA de commit, y Renovate las actualiza.
- Auditoría semanal de vulnerabilidades, no bloqueante. Las altas y críticas abren un issue.

**Secretos:**

- Token de API de Cloudflare con el permiso mínimo necesario para desplegar el Worker, guardado en los secretos de GitHub.
- El token solo llega a los jobs que suben versiones o despliegan. Esos jobs no ejecutan código del proyecto: reciben `dist/` como artefacto y ejecutan `wrangler`, en la versión fijada en el lockfile.
- Si el permiso que permite subir versiones también permite desplegar, ese aislamiento es la defensa principal frente a una dependencia comprometida. Se comprueba en la tarea 0.12.
- El despliegue a producción solo se ejecuta desde `main`, en un entorno de GitHub (`production`) restringido a esa rama.
- `GITHUB_TOKEN` con los permisos mínimos que necesita cada workflow.

## 8. Rendimiento

Los límites están en la §11. Se verifican en cuatro puntos:

- `scripts/check-budget.ts` mide el JavaScript de cada página en `dist/`:
  - carga inicial: los scripts que referencia el HTML y sus importaciones estáticas;
  - total: la carga inicial más las importaciones dinámicas y los workers alcanzables desde ella.
- Una prueba E2E en Chromium (paso 8) registra los Long Animation Frames con `PerformanceObserver` durante interacciones guionizadas sobre un corpus fijo, y falla si alguno supera 50 ms.
- Lighthouse CI audita cada PR.
- Una ejecución semanal de Lighthouse audita producción.

La duración de las tareas del hilo principal se mide en Chromium, porque las APIs de tareas largas (Long Tasks y Long Animation Frames) solo existen ahí. En Firefox y WebKit se verifica el comportamiento funcional.

## 9. Accesibilidad

**Objetivo:** WCAG 2.2 AA, con los umbrales de la §11.

**Verificación automática:** axe en cada página de las pruebas E2E. Esto cubre solo una parte de los criterios.

**Verificación manual por módulo:**

- Uso completo con teclado y orden de foco lógico.
- Lector de pantalla: NVDA en Windows, o VoiceOver en macOS o iOS.
- Zoom al 200 % y reflujo a 320 px.
- Respeto de `prefers-reduced-motion` y `forced-colors`.
- Los resultados y errores que cambian se anuncian con `aria-live`.

## 10. Diseño

- **Tokens** en `design/tokens.css`:
  - color en OKLCH, en pares claro y oscuro;
  - escala tipográfica modular;
  - espaciado, radios y duraciones de animación.
- **Capas CSS:** `@layer reset, tokens, base, layout, components, utilities`.
- **Fuentes:** pila del sistema para el texto y pila monoespaciada para el código.
- **Tema:**
  - Por defecto sigue `prefers-color-scheme`.
  - El interruptor guarda `light`, `dark` o `system` en `localStorage`.
  - Un script inline mínimo en `<head>` aplica `data-theme` antes del primer pintado, para evitar el parpadeo.
  - Sin JavaScript, el interruptor no se muestra y el sitio sigue el tema del sistema.
- **Estilos de componentes:** con el alcance de Astro (`<style>` dentro del componente). La estrategia por defecto (`scopedStyleStrategy: 'attribute'`) añade atributos `data-` a los elementos, no atributos `style`. No se usa `define:vars`, porque sí genera atributos `style` (§7).
- **Animaciones:** solo bajo `prefers-reduced-motion: no-preference`.

## 11. Parámetros

**Se fijan en la F0 y solo cambian con un ADR:**

- **Navegadores:** las dos últimas versiones estables de Chrome, Edge, Firefox y Safari (macOS e iOS).
- **Contraste:** ≥ 4,5:1 en texto normal y ≥ 3:1 en texto grande y componentes de interfaz.
- **Objetivos táctiles:** ≥ 24 × 24 px CSS.
- **Reflujo:** sin desplazamiento horizontal a 320 px de ancho.
- **Lighthouse:**
  - ≥ 95 en rendimiento, accesibilidad, buenas prácticas y SEO, con perfil móvil y mediana de 3 ejecuciones. En Lighthouse CI, la mediana exige `aggregationMethod: 'median'`, porque el valor por defecto (`optimistic`) toma la mejor ejecución.
  - Mientras rija el `noindex` (§16, decisión 3), todas las ejecuciones omiten la auditoría `is-crawlable` con `settings.skipAudits`. El resto de la categoría SEO se exige igual.
  - La excepción se retira al fijar el dominio, y el paso 6 falla si sigue activa con dominio propio (§17, riesgo 13).
- **JavaScript, comprimido con gzip** (carga inicial y total según la §8):
  - páginas sin herramienta: ≤ 2 KB;
  - carga inicial de una herramienta: ≤ 50 KB;
  - total de una herramienta, incluida la carga diferida: ≤ 300 KB.
- **Hilo principal:** ninguna tarea supera 50 ms por interacción, medido en Chromium con el procedimiento de la §8. La medición incluye el guardado automático. La única excepción es la vista previa del Markdown con documentos de más de 200 KB (F1).
- **Cobertura:** ≥ 90 % de ramas en `core/` y `domain/`; sin umbral en `ui/`.
- **Persistencia:** ≤ 1 MB por herramienta, en bytes UTF-8 del valor serializado (§5.6).
- **Dependencias:** edad mínima de publicación de 7 días, en pnpm y en Renovate.
- **Entorno:** Node, la versión LTS vigente al iniciar la F0a; pnpm, la versión fijada en `packageManager`.

**Se fijan en la tarea 0.6:**

- La razón de la escala tipográfica y la paleta.

## 12. Calidad, CI/CD y flujo de trabajo

**Flujo de trabajo:**

- Desarrollo basado en tronco.
- `main` está protegida: solo se integra por PR, con todas las compuertas en verde y la rama actualizada.
- Las ramas se nombran `tipo/descripcion-corta`.
- Los commits siguen Conventional Commits y se fusionan con squash.
- Hooks en `.githooks/`, con el mismo esquema que en Ontos, activados con `git config core.hooksPath .githooks`:
  - `pre-commit`: Prettier y ESLint sobre los archivos preparados, y las pruebas de `core` y `domain`.
  - `commit-msg`: valida el formato Conventional Commits, elimina las líneas de atribución, coautoría y enlaces de sesión, y rechaza los mensajes que nombran al asistente de código o a su proveedor. Es tooling genérico y vive en este repositorio como archivo propio (principio 8).
- La telemetría de Astro se desactiva en local (`astro telemetry disable`) y en los workflows (`ASTRO_TELEMETRY_DISABLED=1`).
- Al cerrar cada fase: entrada en `CHANGELOG.md` y etiqueta `v0.<fase>.0`.
  - La F0 se etiqueta `v0.0.0` al cerrar la F0b. La F0a solo registra su entrada en el `CHANGELOG.md`.
  - La `v1.0.0` se etiqueta al cerrar la F4.

**Pipeline por PR** (`ci.yml`). Cada paso bloquea la fusión:

| # | Paso | Herramienta | Falla si |
|---|---|---|---|
| 1 | Instalación | `pnpm install --frozen-lockfile` | el lockfile no coincide con `package.json` |
| 2 | Tipos | `astro check` y `tsc -p tsconfig.domain.json` | hay errores de tipos, o `core`/`domain` usan APIs del navegador |
| 3 | Estilo, fronteras y procedencia | ESLint, `prettier --check` y `scripts/check-provenance.ts` | hay violaciones, incluidas las de capas y paquetes por capa; un commit de la PR tiene un trailer `Co-authored-by` o nombra al asistente de código o a su proveedor; o un archivo versionado o un nombre de archivo los nombra |
| 4 | Pruebas unitarias | Vitest con cobertura | una prueba falla o la cobertura queda bajo el umbral |
| 5 | Build | `astro build` | falla el build, un `meta.ts` es inválido o falta una traducción |
| 6 | Verificación de `dist/` | `scripts/verify-dist.ts` | hay un script inline sin hash, `style=`, `on*=`, un recurso externo o un enlace interno roto; falta la 404 de un idioma o la regla de la capa 3 en `_headers`; o la excepción `is-crawlable` sigue activa con dominio propio |
| 7 | Presupuesto | `scripts/check-budget.ts` | se supera un límite de JavaScript (§8) |
| 8 | E2E local | Playwright en los 3 motores, contra `wrangler dev` sirviendo `dist/` | falla un flujo, axe reporta una violación, hay una petición fuera del origen o un error en consola, falta una cabecera, una redirección o la 404 de un idioma, o una tarea del hilo principal supera 50 ms (solo en Chromium, §8) |
| 9 | Lighthouse CI | mediana de 3 ejecuciones (`aggregationMethod: 'median'`) contra `wrangler dev` | alguna categoría queda bajo 95 |
| 10 | Vista previa | `wrangler versions upload`, que genera una URL de versión | falla la subida |
| 11 | E2E de entorno | Playwright contra la URL de versión | falta una cabecera (incluida la CSP de los workers) o hay una violación de CSP |

**Comprobación de procedencia (paso 3):**

- `scripts/check-provenance.ts` recorre los mensajes de los commits de la PR (`git log` entre la base y la cabeza, con el historial completo), los archivos versionados y sus nombres.
- Los términos prohibidos se escriben con clases de caracteres, de modo que el propio script no los contiene y no se detecta a sí mismo.
- La comparación no distingue mayúsculas de minúsculas.

`wrangler dev` aplica `_headers` y `_redirects` con Workers Assets, así que los fallos de cabeceras y redirecciones aparecen en el paso 8. El paso 11 confirma que el entorno real se comporta igual. El paso 10 corre en un job aparte, el único de `ci.yml` con el token de Cloudflare (§7).

**Al fusionar en `main`** (`deploy.yml`):

1. Se repiten los pasos 1–9.
2. Se anota el ID de la versión desplegada en ese momento.
3. `wrangler deploy`, en un job con el entorno `production` que recibe `dist/` como artefacto (§7).
4. Prueba de humo del paso 11 contra producción.
5. Si la prueba de humo falla, se vuelve a la versión anotada con `wrangler rollback <ID> --yes --message "…"`, para que no quede esperando una respuesta interactiva.

Durante la F0a solo existen los pasos 1–5, así que "todas las compuertas" significa las activas en ese momento. `deploy.yml` ejecuta esos pasos y `wrangler deploy`; la prueba de humo y la vuelta atrás llegan en la F0b.

**Tareas semanales programadas** (`weekly.yml`), no bloqueantes:

- Auditoría de vulnerabilidades.
- Comprobación de enlaces externos.
- Lighthouse sobre producción, con la misma excepción de la §11.

**Pruebas negativas de las compuertas** (`tests/gates/`):

- Cada compuerta (pasos 1 a 11) tiene casos que deben hacerla fallar, como exige el principio 4.
- Por ejemplo:
  - un lockfile desactualizado (1);
  - un import de `platform` desde `domain` (2 y 3);
  - un commit con un trailer `Co-authored-by`, un commit o un archivo que nombra al asistente de código o a su proveedor (3);
  - una prueba que falla o una cobertura bajo el umbral (4);
  - una traducción faltante o un `slug` duplicado (5);
  - un script inline sin hash, un `_headers` sin la regla de la capa 3 o la excepción `is-crawlable` activa con dominio propio (6);
  - una página que supera el presupuesto (7);
  - una petición a otro origen (8);
  - una página de prueba con un puntaje bajo 95 (9);
  - una configuración de `wrangler` inválida (10);
  - una cabecera ausente en la URL de versión (11).
- Un job verifica que cada caso falla en su compuerta.
- Se crea en la tarea 0.2 con casos genéricos de los pasos 1 a 5 sobre fixtures propios de `tests/gates/`. Los casos de ejemplo de los pasos 2, 3 y 5 dependen de código que aún no existe: las tareas 0.5 y 0.7 los añaden, y cada tarea posterior, los suyos.
- Vitest falla si no encuentra pruebas, así que la tarea 0.2 deja al menos una prueba real en el paso 4.

## 13. Definición de terminado (por módulo)

- [ ] La lógica está en `domain/` y tiene pruebas. Las transformaciones invertibles y la aritmética tienen además pruebas de propiedades.
- [ ] Los errores esperables se devuelven como `Result`, con mensaje traducido.
- [ ] Todos los textos están en `es` y `en`.
- [ ] Cumple la verificación manual de accesibilidad (§9) y no tiene violaciones de axe.
- [ ] No hace peticiones fuera del origen, verificado en E2E.
- [ ] Cumple los límites de la §11.
- [ ] Su persistencia, si la tiene, está versionada, validada y es exportable.
- [ ] Si usa workers, la URL real de cada uno recibe la CSP de la capa 3 (§7).
- [ ] Funciona en los tres motores de Playwright y se revisó en un Safari real. Si no hay un dispositivo disponible, se declara como limitación en el PR.
- [ ] Todo el pipeline está en verde.
- [ ] Si introdujo una dependencia o un patrón nuevo, tiene su ADR.

## 14. Fases

Las estimaciones son horas de trabajo, no semanas, porque el sitio comparte tiempo con Ontos. Se recalibran al cerrar la F0a con la velocidad medida. Los límites de revisión son:

- Si la F0a supera 1,5 veces su estimación superior (78 h), se revisa el alcance con un ADR antes de empezar la F0b.
- La misma regla vale para la F0b, con un límite de 51 h.

| Fase | Contenido | Criterio de aceptación | Esfuerzo (h) |
|---|---|---|---|
| F0a | Sitio en producción (tareas 0.1–0.9) | Ver abajo | 36–52 |
| F0b | Compuertas completas (tareas 0.10–0.12) | Ver abajo | 23–34 |
| F1 | Visor de Markdown | §13 y criterios de la F1 | 23–35 |
| F2 | Calculadora de horas | §13 y criterios de la F2 | 15–25 |
| F3 | Uso sin conexión (PWA) | Criterios de la F3 | 10–15 |
| F4 | JSON (4a), SHA-256 (4b), bases (4c), unidades (4d) | §13 para cada una | 25–40 en total |
| — | Ontos, proyectos, bitácora, CV | Se planifican cuando tengan contenido | — |

**Total estimado:** de 132 a 201 horas.

### F0a. Sitio en producción

**Tareas:**

- **0.1 Repositorio:** estructura, `LICENSE` y `LICENSE-CONTENT`, `.gitattributes` con saltos LF, `.editorconfig`, `pnpm-workspace.yaml`, TypeScript estricto, ESLint (incluidas las verificaciones de `.astro`, con sus bloques `<script>`, y de paquetes por capa de la §4), Prettier, hooks, `AGENTS.md`, `docs/IDEAS_FUTURAS.md` y el esqueleto del `README.md`. ADR 0001, 0002 y 0009; ADR 0005 propuesto, con las fronteras.
- **0.2 Pipeline mínimo:** pasos 1–5, incluida la comprobación de procedencia del paso 3, y el job de `tests/gates/` con casos genéricos de los pasos 1 a 5 (§12). ADR 0010 propuesto, con Vitest.
- **0.3 Cloudflare:** Worker solo con assets; `wrangler.jsonc` con `not_found_handling: "404-page"`, `html_handling: "auto-trailing-slash"` y `preview_urls: true`; secretos; entorno `production`; `deploy.yml` con los pasos 1–5 y `wrangler deploy` en un job aislado (§7); y un `public/_headers` mínimo con `X-Robots-Tag: noindex` en `/*`, para que ningún despliegue quede indexable. ADR 0003 propuesto.
- **0.4 Seguridad:** `security.csp` y `_headers` completo, con las capas 2 y 3 y las cabeceras de la §7. También `_redirects`. ADR 0004.
- **0.5 i18n:** diccionarios tipados, rutas, mapa de segmentos, barra final, `hreflang`, sitemap y 404 por idioma, con la verificación del formato de salida de la §5.7, y los casos de `tests/gates/` que dependen de la i18n. ADR 0006.
- **0.6 Diseño:** tokens, capas, tema sin parpadeo, layout y componentes base. ADR 0008.
- **0.7 Arquitectura:** `core/`, `platform/`, registro puro con pruebas sobre módulos ficticios, índice de herramientas, ruta dinámica y los casos de `tests/gates/` que dependen de ellos. Elección del validador (ADR 0011) y decisión 6 sobre la interfaz de las herramientas, con la que se acepta el ADR 0005.
- **0.8 Contenido:** inicio y "sobre mí" en ambos idiomas.
- **0.9 Cierre:** revisión de los ADR 0001–0011 y redacción de los que falten (el 0007 queda propuesto hasta la F1), entrada de la F0a en `CHANGELOG.md` y recalibración de las estimaciones.

**Criterio de aceptación:**

- El sitio está en producción en `/es/` y `/en/`, en `workers.dev` con `noindex`.
- Los pasos 1–5 bloquean la fusión, y cada uno tiene su prueba negativa.
- Solo se despliega desde `main`, tras los pasos 1–5 y en el entorno `production`.
- Las cabeceras, la redirección de `/` y las 404 por idioma están comprobadas a mano en producción.
- Los ADR 0001–0011 están escritos. Están aceptados todos salvo el 0003, el 0007 y el 0010, que siguen propuestos hasta las tareas 0.12 y 0.11 y la F1.
- Las estimaciones de las fases siguientes están recalibradas con la velocidad medida.

### F0b. Compuertas completas

**Tareas:**

- **0.10 Verificación de `dist/` y presupuesto:** pasos 6–7, incluida la comprobación de la regla de la capa 3 en `dist/_headers`, con sus pruebas negativas.
- **0.11 E2E local y Lighthouse:** pasos 8–9 contra `wrangler dev`, con sus pruebas negativas, la excepción `is-crawlable` de la §11 y `aggregationMethod: 'median'`. Se acepta el ADR 0010.
- **0.12 Vista previa y producción:** pasos 10–11, prueba de humo en producción y vuelta atrás, con sus pruebas negativas. Incluye comprobar si el permiso del token permite desplegar (§7) y comparar las URL de versión con Previews, que Cloudflare recomienda ahora para las PR. La elección se registra en el ADR 0003, que queda aceptado.

**Criterio de aceptación:**

- Las 11 compuertas están activas, y cada una tiene su prueba negativa.
- Cada PR genera una vista previa.
- Las cabeceras y la CSP se verifican automáticamente en la vista previa y en producción, sin violaciones. La regla de la capa 3 se comprueba en `dist/_headers` hasta que la F1 aporte workers.
- Lighthouse da ≥ 95 en las cuatro categorías, con la excepción de la §11.
- La vuelta atrás se ensayó al menos una vez.

### F1. Visor de Markdown

**Entrada:**

- Editor de texto.
- Abrir un archivo `.md` o `.txt` local con la File API, o arrastrarlo y soltarlo.
- Pegar texto.
- Tamaño máximo: 1 MB en UTF-8. Un archivo o un texto pegado que lo supere se rechaza con un mensaje.

**Salida:**

- Vista previa en paralelo; en móvil, en pestañas.
- GFM: tablas, listas de tareas, tachado y enlaces automáticos.
- Fórmulas en línea (`$…$`) y en bloque (`$$…$$`).
- Las imágenes no se renderizan; se muestra su texto alternativo (§7).

**Funciones adicionales:**

- **Contador:** palabras (con `Intl.Segmenter`), caracteres con y sin espacios, y líneas. Se calcula en el Web Worker.
- **Descarga `.md`:** UTF-8 sin BOM, saltos LF y nombre derivado del primer encabezado, o `documento.md` si no hay encabezado.
- **Borrador:** se guarda automáticamente, con persistencia versionada, si cabe en el límite de la §11. Si no cabe, la interfaz lo indica.
- **Procesado:**
  - Se hace en un Web Worker, con *debounce*.
  - Por encima de 200 KB, el *debounce* aumenta y la interfaz lo indica.
  - La primera tarea de la F1 comprueba, con una prueba E2E, que el pipeline completo, incluido rehype-katex, funciona dentro del Worker (§17, riesgo 15).

**Criterio de aceptación:**

- Cumple la §13.
- El corpus XSS, incluidas las cargas dentro de fórmulas, no produce ninguna ejecución.
- Una fórmula inválida se muestra con la clase `katex-error`, sin `style=` y sin violaciones de CSP.
- Hasta 200 KB, la edición no genera tareas mayores de 50 ms en el hilo principal, incluido el guardado del borrador.
- Entre 200 KB y 1 MB:
  - escribir no genera tareas mayores de 50 ms;
  - la actualización de la vista previa puede superar ese límite, y su duración se mide y se documenta en el PR.
- Las duraciones se miden en Chromium con el procedimiento de la §8.
- Hay casos de prueba con salida esperada para tablas, listas de tareas y fórmulas, incluidas `\mathbb`, `\mathcal` y `\mathfrak`, revisadas en Chromium (§17, riesgo 16).

### F2. Calculadora de horas

**Operaciones:**

- Sumar y restar duraciones en formato `HH:MM` o `HH:MM:SS`, con resultados mayores de 24 h y negativos.
- Diferencia entre dos fechas-hora con zona.
- Conversión de una fecha-hora entre zonas IANA, usando la lista de `Intl.supportedValuesOf('timeZone')`.
- Historial local versionado, exportable a JSON.

**Temporal:**

- El dominio recibe el espacio de nombres `Temporal` como parámetro. Se tipa con los tipos del polyfill, importados solo como tipos.
- `ui/` le pasa el `Temporal` nativo si existe, o el polyfill cargado con `import()` si no (§5.8).

**Criterio de aceptación:**

- Cumple la §13.
- Propiedades verificadas: `(a + b) − b = a` y conmutatividad de la suma.
- Cambios de horario con salida conocida: por ejemplo, en `America/New_York` el 08/03/2026 dura 23 h y el 01/11/2026, 25 h.
- Toda entrada inválida devuelve un error tipado y nunca una excepción.
- Las pruebas de dominio se ejecutan con el polyfill inyectado. Si el Node del proyecto trae Temporal nativo, también se ejecutan con él.
- Una prueba E2E fuerza el camino del polyfill, eliminando `globalThis.Temporal` antes de cargar la página, para no depender de qué motor lo trae.

### F3. Uso sin conexión

**Contenido:**

- Manifiesto de la app, con `start_url` en `/es/`, porque la redirección de `/` no se puede precachear.
- Service worker con precaché de todo lo empaquetado. Tiene su propia CSP de cabecera (§7) y su ruta no lleva caché larga.
- Actualización controlada: se avisa al usuario y nunca se mezclan versiones.
- La forma de generar la lista de precaché y la estrategia de actualización se registran en un ADR (§15).

**Criterio de aceptación:**

- Tras una primera visita, todas las herramientas funcionan sin conexión, verificado en Playwright con `setOffline(true)`.
- Una actualización no deja la app en un estado mixto.
- La CSP sigue sin violaciones.

### F4. Herramientas restantes

- **4a. JSON:** formatear, minificar y validar, indicando línea y columna del error. Los mensajes de `JSON.parse` no son uniformes entre motores, así que la posición del error requiere un parser propio o una librería (ADR).
- **4b. SHA-256:** de texto y de archivos. `crypto.subtle.digest` no es incremental y carga el archivo entero en memoria, así que hay que elegir entre fijar un tamaño máximo o adoptar hashing incremental (ADR).
- **4c. Bases:** de la 2 a la 36, con `BigInt`. Propiedad de ida y vuelta: `parse(format(n, b), b) = n`.
- **4d. Unidades:** el conjunto de magnitudes y unidades se fija antes de empezar, con factores tomados del SI (BIPM). El tratamiento de la precisión se decide en un ADR.

## 15. Documentación

- **`docs/PLAN.md`:** este documento, versionado por revisiones.
- **`docs/PROGRESO.md`:** memoria entre sesiones: estado actual, siguiente paso, tareas cerradas con su commit y sus horas, decisiones y pendientes.
- **`docs/IDEAS_FUTURAS.md`:** lo excluido en la §2 y las ideas aplazadas, con su motivo.
- **`docs/adr/NNNN-titulo.md`:** cada ADR tiene contexto, opciones consideradas, decisión, consecuencias y estado (propuesto, aceptado o sustituido por NNNN).
  - Se escribe en la tarea donde se toma su decisión. Si reúne decisiones de varias tareas, queda propuesto y se acepta en la última que lo completa.
  - Un ADR aceptado no se edita; se sustituye por otro.
- **`CHANGELOG.md`:** una entrada por fase.
- **`README.md`:** cómo instalar, probar, previsualizar y desplegar; la arquitectura en una página; y los pasos exactos para agregar una herramienta.
- **`AGENTS.md`:** reglas para asistentes de código, en un formato que leen varios asistentes. El archivo propio de cada asistente, si lo necesita, es local, no se versiona y solo importa `AGENTS.md`. Las reglas son:
  - respetar las fronteras y los paquetes por capa de la §5.2;
  - ninguna dependencia nueva sin ADR;
  - ninguna petición a terceros;
  - ningún `style=` ni script inline sin hash;
  - ningún `define:vars`;
  - ningún worker creado desde URL `blob:` o `data:`;
  - ninguna dependencia que use el DOM dentro de un worker;
  - toda prueba debe ser determinista;
  - nunca incluir atribución, coautoría ni enlaces de sesión en commits, etiquetas ni pull requests;
  - no nombrar al asistente de código ni a su proveedor en archivos versionados, nombres de archivo, commits, etiquetas ni pull requests.

**ADR iniciales:**

| ADR | Tema |
|---|---|
| 0001 | Sitio estático sin servidor |
| 0002 | Astro, TypeScript estricto, pnpm y política de dependencias |
| 0003 | Cloudflare Workers con assets estáticos; despliegue desde Actions; vistas previas con URL de versión o Previews (en la tarea 0.12) |
| 0004 | CSP en tres capas (meta, páginas y workers) y cabeceras de seguridad |
| 0005 | Arquitectura por módulos, capas, puertos, paquetes por capa y su verificación; interfaz de las herramientas (decisión 6) |
| 0006 | i18n: prefijos, segmentos localizados, slugs compartidos, barra final y 404 por idioma |
| 0007 | Pipeline unified, KaTeX en MathML, eliminación de atributos `style` e imágenes no renderizadas |
| 0008 | CSS propio con tokens y fuentes del sistema |
| 0009 | Visibilidad del repositorio y licencias |
| 0010 | Pruebas y auditoría: Vitest, fast-check, Playwright contra `wrangler dev`, axe y Lighthouse CI, incluida la excepción `is-crawlable` y `aggregationMethod: 'median'` |
| 0011 | Validador en tiempo de ejecución (en la tarea 0.7) |
| 0012 | Temporal: carga condicional y elección del polyfill (en la F2) |

Los ADR que piden la F3 (precaché y actualización) y la F4 (parser de JSON, hash de archivos y precisión de unidades) se numeran desde el 0013 al crearlos.

## 16. Decisiones pendientes

| # | Decisión | Recomendación | Plazo |
|---|---|---|---|
| 1 | Visibilidad del repositorio | **Decidida: público.** GitHub Actions no cobra minutos en runners estándar para repositorios públicos, y el código de las herramientas no es sensible | Tarea 0.1 (ADR 0009) |
| 2 | Licencias | **Decidida:** MIT para el código; todos los derechos reservados para textos e imágenes (`LICENSE-CONTENT`) | Tarea 0.1 (ADR 0009) |
| 3 | Dominio propio | **Decidida: diferirlo.** Mientras tanto, usar el subdominio `workers.dev` con `noindex` en `/*` y Lighthouse sin `is-crawlable` (§11). Fijarlo antes de compartir el sitio, porque cambia `site`, `canonical` y `hreflang`. Al fijarlo, el `noindex` pasa a la regla de host de la §7, o se desactiva la ruta `workers.dev` manteniendo `preview_urls: true`, y se retira la excepción de Lighthouse | Antes de compartir el sitio |
| 4 | Validador | Comparar Zod 4, `zod/mini` y Valibot en tamaño dentro del bundle, API y mantenimiento | Tarea 0.7 (ADR 0011) |
| 5 | Polyfill de Temporal | Comparar `@js-temporal/polyfill` y `temporal-polyfill` en tamaño, conformidad y mantenimiento. Se carga solo cuando falta Temporal nativo, y se elimina cuando Temporal sea Baseline | F2 (ADR 0012) |
| 6 | Interfaz de las herramientas | Scripts de Astro sin framework: no añaden dependencias ni peso, y la estrategia `visible` se implementa con `IntersectionObserver`. Un framework de islas solo se justifica si una herramienta tiene estado complejo, y requiere un ADR con su peso frente a la §11 | Tarea 0.7 (ADR 0005) |

## 17. Riesgos

1. **La F0 no se cierra nunca por exceso de rigor.**
   Mitigación: la F0 se divide en F0a (sitio en producción) y F0b (compuertas completas). Hay recalibración al cerrar la F0a, límites de 78 h y 51 h con revisión por ADR, y todo lo no listado pasa a fases posteriores.

2. **El sitio compite con Ontos.**
   Mitigación: principio 9, con horas separadas.

3. **La CSP con hashes es frágil: cada cambio en un script inline invalida su hash.**
   Mitigación: `verify-dist.ts`, E2E local y contra la vista previa, y prueba de humo en producción.

4. **Lighthouse es inestable en CI.**
   Mitigación: mediana de 3 ejecuciones; los umbrales solo cambian por ADR.

5. **WebKit en Playwright no equivale a Safari real, y Safari no soporta Temporal.**
   Mitigación: el polyfill se carga cuando falta Temporal, una prueba E2E fuerza ese camino, y se revisa en un Safari real (§13).

6. **Cloudflare reorienta sus productos, como ya pasó con Pages y ahora con las URL de versión, que ya no recomienda para probar PR.**
   Mitigación: el sitio es un `dist/` estático; migrar exige cambiar el paso de despliegue, `_headers`, `_redirects` y los pasos 10 y 11. La tarea 0.12 compara las URL de versión con Previews (ADR 0003).

7. **Safari puede borrar el almacenamiento escrito por scripts de sitios sin interacción reciente.**
   Mitigación: exportar e importar datos en toda herramienta con persistencia (§5.6).

8. **Ataques a la cadena de suministro de npm.**
   Mitigación: lockfile congelado, scripts de instalación bloqueados, edad mínima de 7 días, un ADR por cada dependencia de ejecución y el token de Cloudflare aislado en jobs sin código del proyecto (§7).

9. **Filtración de información de Ontos antes del preregistro.**
   Mitigación: principio 8.

10. **Traducciones desincronizadas.**
    Mitigación: diccionarios tipados (§5.7).

11. **La auditoría automática de accesibilidad da una falsa sensación de cumplimiento.**
    Mitigación: verificación manual en cada módulo (§9).

12. **La CSP de los workers depende de la ruta donde Astro emite sus scripts. Si cambia, la regla de `_headers` deja de aplicarse sin aviso.**
    Mitigación: las E2E comprueban la cabecera en la URL real de cada worker, obtenida de la página, no en una ruta fija (§7).

13. **La excepción de `is-crawlable` sobrevive al cambio de dominio.**
    Mitigación: `verify-dist.ts` falla si `site` no es un subdominio de `workers.dev` y la excepción sigue en `lighthouserc.json` (paso 6).

14. **El umbral de 200 KB de la F1 resulta insuficiente para el uso real.**
    Mitigación: se mide en la F1. La actualización incremental del DOM queda en `docs/IDEAS_FUTURAS.md`, y requiere un ADR si llega a hacer falta.

15. **Una dependencia usa el DOM dentro del Worker.** rehype-katex convierte la salida de KaTeX con `hast-util-from-html-isomorphic`, que en el navegador usa el DOM, y los workers no lo tienen. Las pruebas de dominio corren en Node y no lo detectan.
    Mitigación: prueba E2E del pipeline dentro del Worker al inicio de la F1. Si falla, se resuelve con un alias de Vite hacia la variante basada en parse5, midiendo su peso, o se llama a KaTeX sin rehype-katex. La solución se registra en el ADR 0007.

16. **Chromium no aplica `mathvariant` en MathML.** MathML Core solo admite `mathvariant="normal"`. Si KaTeX expresa `\mathbb`, `\mathcal` o `\mathfrak` con ese atributo, Chromium los muestra como letras normales.
    Mitigación: casos de prueba en la F1, revisados en Chromium. Si se confirma, un plugin propio sustituye esas letras por los caracteres matemáticos de Unicode, o la limitación se documenta en el ADR 0007.

## 18. Plan de aprendizaje

| Fase | Tema | Para qué sirve |
|---|---|---|
| F0a–F0b | TypeScript estricto; Astro (rutas, islas, i18n, `security.csp`); CSS moderno (custom properties, `@layer`, OKLCH); CSP y cabeceras HTTP; GitHub Actions; `wrangler` y `wrangler dev` | Fundamentos, seguridad y despliegue |
| F1 | unified, remark y rehype; XSS y saneamiento (OWASP); MathML; File API, Blob y Web Workers; APIs de rendimiento (Long Animation Frames); fast-check | Visor de Markdown |
| F2 | Temporal, `Intl`, base de datos de zonas IANA y cambios de horario | Calculadora de horas |
| F3 | Service workers, Cache API, estrategias de caché y manifiesto | Uso sin conexión |
| F4 | Web Crypto, análisis sintáctico de JSON, `BigInt` y sistemas de unidades | Herramientas restantes |

## 19. Referencias

Verificar cada referencia en su fuente primaria antes de citarla. Las obras de consulta, como MDN, sirven para orientarse, pero no como referencia. Durante las revisiones 1.1 a 1.3 se consultaron, como orientación, la referencia de configuración de Astro, la documentación de Cloudflare (cabeceras, enrutado, URL de versión y Previews), el changelog de Wrangler, el código de rehype-katex y KaTeX, la configuración de Lighthouse CI, la documentación de configuración de pnpm y los rangos de dependencias publicados en npm. Ninguna de las siguientes está verificada todavía para citarla.

| Referencia | Para qué sirve |
|---|---|
| W3C (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. W3C Recommendation | Accesibilidad (§9 y §11) |
| W3C. *Content Security Policy Level 3* | CSP (§7) |
| WHATWG. *HTML Living Standard*: inicialización de la política de los workers | CSP de los workers (§7) |
| W3C. *MathML Core* | Fórmulas en Chromium (F1; §17, riesgo 16) |
| Astro. *Configuration Reference*: `security.csp`, `build.format` y `scopedStyleStrategy` | CSP generada por Astro, formato de salida y estilos (§5.7, §7 y §10) |
| Cloudflare. *Workers Static Assets: Headers y Redirects* | Hosting y cabeceras (§4 y §7) |
| Cloudflare. *Workers: Version URLs* y *Previews* | Vistas previas (§12 y tarea 0.12) |
| Cloudflare. *Workers Static Assets: Routing* (`not_found_handling`, `html_handling`) | 404 por idioma y barra final (§5.7) |
| Google. *Lighthouse: configuración* (`settings.skipAudits`) | Excepción `is-crawlable` (§11) |
| Lighthouse CI. *Configuration* (`aggregationMethod`) | Mediana de ejecuciones (§11) |
| GitHub. *GitHub Flavored Markdown Spec* | Visor de Markdown (F1) |
| OWASP. *Cross Site Scripting Prevention Cheat Sheet* y *Content Security Policy Cheat Sheet* | Saneamiento y CSP (§7) |
| OWASP. *XSS Filter Evasion Cheat Sheet* | Corpus de pruebas XSS (F1) |
| TC39. *Temporal* | Calculadora de horas (F2) |
| IANA. *Time Zone Database* | Zonas horarias (F2) |
| BIPM (2019). *The International System of Units (SI)*, 9.ª ed. | Conversor de unidades (F4) |
| Nygard, M. (2011). *Documenting Architecture Decisions* | Formato de los ADR (§15) |
| *Conventional Commits 1.0.0* | Mensajes de commit (§12) |
| *Semantic Versioning 2.0.0* | Etiquetas de versión (§12) |