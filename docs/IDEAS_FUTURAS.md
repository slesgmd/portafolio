# Ideas futuras

Lo que queda fuera de la v1, con su motivo (PLAN §2). Retomar algo de esta lista requiere revisar el plan y, si cambia una decisión o un parámetro, un ADR.

## Excluido de la v1

| Idea | Motivo |
|---|---|
| Servidor, base de datos y cuentas | Ninguna herramienta los necesita, y solo añadirían superficie de ataque y mantenimiento (ADR 0001) |
| Página de Ontos, sección de proyectos, bitácora y CV | Se planifican cuando tengan contenido (§14). Nada de Ontos que no sea ya público (principio 8) |
| Analítica | Contradice el principio 1 |
| Transiciones de vista con `ClientRouter` | Incompatibles con la CSP de Astro (§7) |
| Resaltado de código con Shiki | Incompatible con la CSP de Astro (§7) |
| Monorepo | Las fronteras se imponen con ESLint y TypeScript; si algún día se comparte `domain/`, se extrae sin cambios |
| Tailwind, Storybook, regresión visual, CMS y librerías de manejo de estado | Su costo de mantenimiento supera lo que aportan en un sitio de este tamaño |
| Detección automática de idioma | En un sitio estático exige JavaScript o servidor (§5.7) |

## Aplazado hasta medirlo

- **Actualización incremental del DOM en la vista previa del Markdown.** Solo se aborda si el umbral de 200 KB de la F1 resulta insuficiente para el uso real, y con un ADR (§17, riesgo 14).
- **TypeScript 7.** Cuando `@astrojs/check` y `typescript-eslint` lo admitan (ADR 0002).
