# ADR 0008: CSS propio con tokens, capas y fuentes del sistema

- **Estado:** aceptado
- **Fecha:** 18/10/2026
- **Tarea:** 0.6a

## Contexto

La §10 pide tokens en OKLCH con pares claro y oscuro, escala tipográfica modular, capas CSS y un tema que sigue al sistema, con interruptor y sin parpadeo. La §11 fija en esta tarea la razón de la escala y la paleta, con contraste ≥ 4,5:1 en texto normal y ≥ 3:1 en componentes. La §2 excluye Tailwind, y la §4 pide cero dependencias y cero peticiones de fuentes.

La CSP (ADR 0004) solo admite scripts y estilos con hash. Astro calcula los hashes de lo que procesa, pero no los de los scripts `is:inline` (comprobado en `astro/dist/core/csp/common.js`: recoge los scripts empaquetados, los inyectados por integraciones y los procesados que se insertan en línea).

## Opciones consideradas

**Estilos**

1. **CSS propio** con custom properties y `@layer`, sin dependencias.
2. **Preprocesador (Sass) o CSS Modules:** dependencias o configuración para lo que el CSS actual ya cubre (variables, anidamiento, capas).
3. **Tailwind:** excluido por la §2.

**Pares claro y oscuro**

1. **`light-dark()` con `color-scheme`:** cada token declara sus dos valores juntos; `data-theme` solo cambia `color-scheme`. Los controles nativos (barras de desplazamiento, formularios) siguen el mismo tema.
2. **Bloques duplicados:** los valores claros en `:root`, los oscuros en `@media (prefers-color-scheme: dark)` y otra vez en `[data-theme='dark']`. Cada color se escribe tres veces.

**Hash del script de tema**

1. **Calcularlo en `astro.config.ts` desde la fuente del script**, que vive en un módulo que también importa el layout.
2. **Copiar el hash a mano en la configuración:** se desincroniza con cualquier cambio del script.

## Decisión

Se adoptan la opción 1 de estilos, la 1 de pares y la 1 de hash.

**Archivos (`src/design/`), importados en este orden desde `src/layouts/Base.astro`:**

- `reset.css`: declara el orden de las capas, `@layer reset, tokens, base, layout, components, utilities`, y un reset mínimo.
- `tokens.css`: los tokens, en `@layer tokens`.
- `base.css`: estilos de los elementos HTML (tipografía, enlaces, foco), en `@layer base`.

Los estilos de los componentes usan el alcance de Astro (`<style>` en el componente) y van dentro de `@layer components`: un estilo sin capa ganaría a todas las capas.

**Paleta (OKLCH, tono 250; valores claro y oscuro):**

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-bg` | `oklch(99% 0.003 250)` | `oklch(18% 0.01 250)` | Fondo |
| `--color-surface` | `oklch(96% 0.006 250)` | `oklch(23% 0.012 250)` | Superficies |
| `--color-text` | `oklch(22% 0.02 250)` | `oklch(93% 0.008 250)` | Texto |
| `--color-text-muted` | `oklch(45% 0.02 250)` | `oklch(74% 0.015 250)` | Texto secundario |
| `--color-border` | `oklch(88% 0.008 250)` | `oklch(32% 0.012 250)` | Separadores decorativos |
| `--color-border-strong` | `oklch(55% 0.02 250)` | `oklch(62% 0.02 250)` | Bordes de componentes |
| `--color-accent` | `oklch(50% 0.16 258)` | `oklch(76% 0.12 250)` | Enlaces y foco |
| `--color-danger` | `oklch(50% 0.18 27)` | `oklch(74% 0.14 27)` | Errores |

Contraste mínimo medido (claro / oscuro), sobre el fondo o la superficie, el peor de los dos:

| Primer plano | Mínimo exigido | Claro | Oscuro |
|---|---|---|---|
| `--color-text` | 4,5:1 | 15,41:1 | 13,74:1 |
| `--color-text-muted` | 4,5:1 | 6,61:1 | 7,33:1 |
| `--color-accent` | 4,5:1 | 5,45:1 | 7,91:1 |
| `--color-danger` | 4,5:1 | 5,87:1 | 6,90:1 |
| `--color-border-strong` | 3:1 | 4,31:1 | 4,64:1 |

`tests/design/contrast.test.ts` lee `tokens.css`, convierte cada par a sRGB y comprueba estos mínimos y que cada color esté dentro de la gama sRGB (paso 4). Un caso de `tests/gates/` comprueba que un color con poco contraste hace fallar el paso.

**Tipografía:**

- Escala modular de **razón 1,2** (tercera menor) sobre `1rem`: `--step--1` a `--step-4`, calculados con `pow()`. Es una escala contenida, adecuada para interfaces de herramientas con mucho texto de control.
- Pila del sistema para el texto (`system-ui` y equivalentes) y pila monoespaciada (`ui-monospace` y equivalentes) para el código.
- Interlineado 1,5 en el texto y 1,2 en los títulos; medida de línea de 70 caracteres como token.

**Espaciado, radios y duraciones:** escala de espaciado de `0.25rem` a `4rem`, tres radios y dos duraciones. Las duraciones valen `0ms` salvo con `prefers-reduced-motion: no-preference`, así que una animación que use los tokens se desactiva sola (§10).

**Tema:**

- `:root` declara `color-scheme: light dark` y sigue `prefers-color-scheme`. `data-theme='light'` o `'dark'` en `<html>` fija `color-scheme`, y con él todos los `light-dark()`.
- `<meta name="color-scheme" content="light dark">` para que el navegador pinte el lienzo inicial en el tema correcto.
- Script inline al principio de `<head>` (`src/components/theme.ts`): lee `theme` de `localStorage` y, si vale `light` o `dark`, aplica `data-theme` antes del primer pintado. `system`, un valor desconocido o un `localStorage` bloqueado dejan el tema del sistema.
- Su hash se calcula en `astro.config.ts` con `node:crypto` y se añade a `security.csp.scriptDirective.hashes`. Comprobado en el build: el script y la hoja de estilos en línea tienen su hash en la `<meta>` CSP.
- El interruptor (`ThemeToggle.astro`, tarea 0.6b) guarda `light`, `dark` o `system` con la misma clave, y no se muestra sin JavaScript.

## Consecuencias

- `light-dark()` exige Chrome y Edge 123, Firefox 120 y Safari 17.5; `pow()`, versiones anteriores. Todas quedan dentro de "las dos últimas versiones estables" (§11).
- El CSS global ocupa unos 2,3 KB y Astro lo inserta en línea (`build.inlineStylesheets: 'auto'`, por debajo de 4 KB), con su hash en `style-src`. Si crece por encima del límite, pasa a un archivo en `/_astro/`, también autorizado por `'self'`.
- El minificador de Astro no conserva la declaración de orden de las capas como primera regla: la reparte entre los bloques `@layer` del archivo. El orden se mantiene porque el CSS global se importa antes que cualquier componente. En la tarea 0.6b se comprueba en el build que los estilos de los componentes quedan detrás.
- Un color nuevo con requisito de contraste necesita su par en `tests/design/contrast.test.ts`.
- En `forced-colors`, el navegador sustituye los colores de los tokens por los del sistema; el anillo de foco se mantiene porque es un `outline`.
