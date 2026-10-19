// Script inline de `<head>` (PLAN §10, ADR 0008): aplica `data-theme` antes del primer
// pintado, para evitar el parpadeo, y marca `data-js` para mostrar el interruptor (sin
// JavaScript no se muestra). Sin `localStorage` (bloqueado), el sitio sigue el tema del
// sistema. `astro.config.ts` añade su hash a la CSP: Astro no calcula el de los scripts
// `is:inline` (§7). Va aparte de `theme.ts` para que el script del interruptor no lo
// incluya.
import { themeStorageKey } from './theme.ts';

export const themeScript =
  `document.documentElement.dataset.js='';` +
  `try{const t=localStorage.getItem(${JSON.stringify(themeStorageKey)});` +
  `if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}`;
