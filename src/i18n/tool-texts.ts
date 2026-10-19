import { assertSameKeys, type Dict } from './dict.ts';

/** Textos que el índice de herramientas necesita de cada una. */
export interface ToolTexts {
  readonly name: string;
  readonly description: string;
}

/**
 * Textos del `i18n.ts` de una herramienta. `es` es la fuente de verdad de las claves;
 * si `en` no tiene las mismas, es un error de tipos y el build falla (§5.7).
 */
export const defineToolTexts = <T extends ToolTexts>(texts: {
  readonly es: T;
  readonly en: NoInfer<Dict<T>>;
}): { readonly es: T; readonly en: Dict<T> } => {
  assertSameKeys('Textos de herramienta en', texts.es, texts.en);
  return texts;
};
