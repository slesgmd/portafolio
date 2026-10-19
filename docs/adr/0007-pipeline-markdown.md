# ADR 0007: Pipeline unified, KaTeX en MathML, eliminación de atributos `style` e imágenes no renderizadas

- **Estado:** propuesto. Recoge el diseño de la §4 y la §7; se acepta en la F1, cuando la prueba E2E del pipeline dentro del Worker y los casos de `\mathbb`, `\mathcal` y `\mathfrak` resuelvan los riesgos 15 y 16 (§17).
- **Fecha:** 19/10/2026
- **Tarea:** 0.9 (propuesta); F1 (aceptación)

## Contexto

El visor de Markdown (F1) renderiza texto arbitrario con GFM y fórmulas, en el navegador y dentro de un Web Worker (§5.8). Tres restricciones condicionan el pipeline:

- La CSP no admite `unsafe-inline` ni atributos `style` (§7). La salida HTML de KaTeX usa `style` para el posicionamiento, y su mensaje de error lleva un `style` con el color.
- El Markdown es contenido no confiable: la salida no puede producir `<script>`, `on*=`, `javascript:`, `style=` ni `<img>` (§7).
- Ningún dato sale del navegador (principio 1): una imagen externa sería una petición a un tercero.

En la F0a no se instala ninguna dependencia del pipeline: las versiones se eligen en la F1, con la edad mínima de 7 días (ADR 0002), y se añaden a la política de `tool-domain` de `eslint.config.js` (ADR 0005).

## Opciones consideradas

**Procesador**

1. **unified** (remark-parse, remark-gfm, remark-math, remark-rehype, rehype-sanitize, rehype-katex, rehype-stringify): ecosistema maduro que funciona en el navegador, con plugins de GFM, fórmulas y saneamiento. Astro ya no lo usa por defecto (su procesador actual es Sätteri), pero el visor no depende de Astro para esto.
2. **markdown-it con plugins:** las fórmulas y el saneamiento del HTML dependen de plugins y librerías aparte. No se ha medido; se compara en la F1 si unified no cabe en los límites de la §11.
3. **Sätteri, el procesador de Astro:** pensado para el build, no para ejecutarse en un worker del navegador.

**Salida de las fórmulas**

1. **MathML (`output: 'mathml'`):** casi sin atributos `style`; lo renderiza el navegador.
2. **HTML de KaTeX:** depende de `style` en línea y de su hoja de estilos, incompatibles con la CSP.

**Imágenes**

1. **No renderizarlas:** se muestra su texto alternativo.
2. **Renderizar solo las relativas:** apuntarían a rutas inexistentes del sitio.
3. **Renderizarlas todas:** las externas contradicen el principio 1, y la CSP las bloquearía.

## Decisión propuesta

Opción 1 en las tres cuestiones, con el orden de la §7:

remark-parse → remark-gfm → remark-math → remark-rehype → plugin propio que sustituye cada imagen por su texto alternativo → rehype-sanitize (esquema por defecto más las clases de math) → rehype-katex (`output: 'mathml'`, `trust: false`) → plugin propio que elimina los atributos `style` → rehype-stringify.

- remark-rehype sin `allowDangerousHtml`: el HTML incrustado no se renderiza en la v1.
- rehype-sanitize se mantiene como defensa en profundidad (por ejemplo, ante enlaces `javascript:`).
- rehype-katex corre después del saneamiento, así que su salida no se sanea: `trust: false` explícito desactiva `\href`, `\htmlStyle` y similares.
- El último plugin elimina los `style`, también el de `katex-error`; el color del error se aplica con CSS sobre esa clase.

## Pendiente para la F1

- **Riesgo 15:** rehype-katex convierte la salida de KaTeX con `hast-util-from-html-isomorphic`, que en el navegador usa el DOM, y un worker no lo tiene. La primera tarea de la F1 lo comprueba con una prueba E2E del pipeline dentro del Worker. Si falla: alias de Vite hacia la variante basada en parse5, midiendo su peso, o KaTeX sin rehype-katex. La solución se anota aquí.
- **Riesgo 16:** Chromium no aplica `mathvariant` distinto de `normal`. Si KaTeX expresa `\mathbb`, `\mathcal` o `\mathfrak` con ese atributo, se sustituyen las letras por los caracteres matemáticos de Unicode con un plugin propio, o la limitación se documenta aquí.
- Versiones, tamaño de cada paquete frente a los límites de la §11 y estado de mantenimiento (principio 6).

## Consecuencias

- La prueba con un corpus de cargas XSS basado en OWASP, incluidas cargas dentro de fórmulas, forma parte del criterio de aceptación de la F1.
- Las dependencias del pipeline se cargan con `import()` dinámico, solo en el worker del visor (§5.8), y cuentan contra el total de 300 KB de la herramienta (§11).
- Las imágenes del Markdown no se ven. Si algún día se renderizan, hace falta un ADR que sustituya a este y revise el principio 1 y la CSP.
