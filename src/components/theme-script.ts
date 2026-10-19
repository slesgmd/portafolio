// Va inline en `<head>` para aplicar el tema antes del primer pintado (§10); su hash lo
// añade `astro.config.ts`. Separado de `theme.ts` para que el script del interruptor no
// lo incluya (ADR 0013).
import { themeStorageKey } from './theme.ts';

export const themeScript =
  `document.documentElement.dataset.js='';` +
  `try{const t=localStorage.getItem(${JSON.stringify(themeStorageKey)});` +
  `if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}`;
