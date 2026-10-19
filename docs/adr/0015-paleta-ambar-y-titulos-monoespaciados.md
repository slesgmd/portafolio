# ADR 0015: Paleta ámbar y títulos monoespaciados

- **Estado:** aceptado
- **Fecha:** 19/10/2026
- **Tarea:** 0.8

## Contexto

El ADR 0008 fijó una paleta neutra de tono 250 con acento azul y la pila monoespaciada solo para el código. Era correcta, pero no tenía carácter. En la tarea 0.8 el usuario dio la dirección de diseño:

- Ambiente técnico y sobrio, con un detalle propio: la monoespaciada del sistema en los títulos y el cuerpo en la sans del sistema, sin descargar fuentes (§10; prioridad a la velocidad).
- Acento ámbar, sin el azul estándar ni un verde fosforito. Grises neutros o algo cálidos, sin tinte azul.
- Tema oscuro como principal; el claro se deriva de él. Contraste AA en los dos, con un ámbar oscuro para el texto y los enlaces del tema claro.
- La razón de la escala tipográfica se mantiene en 1,2. Orientación, sin copiar su aspecto: colecciones de herramientas densas y ordenadas, y herramientas centradas en la tarea que procesan todo en local.

Cambiar la paleta es cambiar un parámetro de la §11, y requiere un ADR nuevo (principio 5). El 0008 está aceptado y no se edita.

## Opciones consideradas

**Acento del tema claro**

1. **El mismo ámbar luminoso que en el oscuro:** no llega a 4,5:1 sobre el fondo claro.
2. **Un ámbar oscuro (`oklch(52% 0.11 66)`):** pasa AA sobre el fondo y la superficie, aunque se ve más tostado que el del oscuro.

**Fuente de los títulos**

1. **La monoespaciada del sistema**, sin peticiones de fuentes.
2. **Una fuente propia alojada en el sitio:** no rompe el principio 1, pero cambia la §10 y suma peso a cada página. El usuario la descartó.

**Indicador de foco**

1. **Usar `--color-accent` directamente:** hoy cumple, pero su umbral de 3:1 quedaría implícito en el de 4,5:1 del texto.
2. **Un token `--color-focus` con su propio par en la prueba:** el umbral del foco se comprueba aunque el acento cambie.

## Decisión

Se adoptan el ámbar oscuro en el tema claro, la monoespaciada del sistema en los títulos y el token de foco propio.

**Paleta (OKLCH; grises de tono 75 y croma ≤ 0,014):**

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-bg` | `oklch(98.5% 0.003 80)` | `oklch(17% 0.004 75)` | Fondo |
| `--color-surface` | `oklch(95.5% 0.005 80)` | `oklch(21.5% 0.006 75)` | Superficies |
| `--color-text` | `oklch(22% 0.01 70)` | `oklch(93% 0.006 80)` | Texto |
| `--color-text-muted` | `oklch(46% 0.012 70)` | `oklch(72% 0.01 75)` | Texto secundario |
| `--color-border` | `oklch(88% 0.008 75)` | `oklch(31% 0.008 75)` | Separadores decorativos |
| `--color-border-strong` | `oklch(56% 0.014 75)` | `oklch(56% 0.012 75)` | Bordes de componentes |
| `--color-accent` | `oklch(52% 0.11 66)` | `oklch(80% 0.15 75)` | Enlaces, estado activo, selección |
| `--color-on-accent` | `oklch(98.5% 0.003 80)` | `oklch(17% 0.004 75)` | Texto sobre el acento |
| `--color-focus` | `oklch(52% 0.11 66)` | `oklch(80% 0.15 75)` | Indicador de foco |
| `--color-danger` | `oklch(50% 0.18 27)` | `oklch(72% 0.15 27)` | Errores |

Contraste mínimo medido, el peor sobre el fondo o la superficie:

| Primer plano | Mínimo exigido | Claro | Oscuro |
|---|---|---|---|
| `--color-text` | 4,5:1 | 15,20:1 | 14,26:1 |
| `--color-text-muted` | 4,5:1 | 6,26:1 | 7,06:1 |
| `--color-accent` | 4,5:1 | 4,97:1 | 9,19:1 |
| `--color-on-accent` (sobre el acento) | 4,5:1 | 5,43:1 | 10,03:1 |
| `--color-focus` | 3:1 | 4,97:1 | 9,19:1 |
| `--color-danger` | 4,5:1 | 5,78:1 | 6,63:1 |
| `--color-border-strong` | 3:1 | 4,09:1 | 3,76:1 |

En el tema oscuro, el texto sobre el ámbar es oscuro. La selección de texto (`::selection`) usa el acento como fondo y `--color-on-accent` como texto; así no aparece el azul por defecto del navegador.

**Tipografía:**

- `--font-heading: var(--font-mono)` en `h1`–`h3` y en el nombre del sitio de la cabecera, con peso 600 y `letter-spacing: -0.02em`, porque la monoespaciada se ve ancha en los tamaños grandes. El cuerpo sigue con `--font-sans`.
- `'Cascadia Mono'` entra en la pila monoespaciada antes de Consolas. Viene con Windows 11, así que no se descarga nada; donde no está, se usa Consolas como antes.
- Se mantienen la razón 1,2, los interlineados y la medida del ADR 0008.

## Consecuencias

- Sustituye la paleta y las pilas de fuentes del ADR 0008. El resto del 0008 (capas, `light-dark()`, script de tema) sigue vigente.
- `tests/design/contrast.test.ts` suma los pares de `--color-on-accent` sobre el acento y de `--color-focus` sobre el fondo y la superficie. Todo componente que use el acento como fondo usa `--color-on-accent` para el texto.
- El botón activo del interruptor de tema pasa a la superficie con el texto en el acento, en lugar de invertir el texto y el fondo.
- Los títulos cambian de ancho según la monoespaciada de cada sistema. El reflujo a 320 px se revisa en navegador al cerrar la tarea.
