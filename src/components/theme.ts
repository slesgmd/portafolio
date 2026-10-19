// Tema (PLAN §10, ADR 0008). Por defecto sigue `prefers-color-scheme`; el interruptor
// guarda la elección en `localStorage`, y `system` vuelve al del sistema.

export const themeStorageKey = 'theme';
export const themes = ['light', 'dark', 'system'] as const;
export type Theme = (typeof themes)[number];
