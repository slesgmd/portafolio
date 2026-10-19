// Tema (PLAN §10, ADR 0008). Por defecto sigue `prefers-color-scheme`; el interruptor
// (tarea 0.6b) guarda la elección en `localStorage`, y `system` vuelve al del sistema.

export const themeStorageKey = 'theme';
export const themes = ['light', 'dark', 'system'] as const;
export type Theme = (typeof themes)[number];

// Script inline de `<head>`: aplica `data-theme` antes del primer pintado, para evitar
// el parpadeo. Sin `localStorage` (bloqueado o sin JavaScript), el sitio sigue el tema
// del sistema. `astro.config.ts` añade su hash a la CSP: Astro no calcula el de los
// scripts `is:inline` (§7).
export const themeScript =
  `try{const t=localStorage.getItem(${JSON.stringify(themeStorageKey)});` +
  `if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}`;
