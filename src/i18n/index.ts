// Punto de entrada de la i18n (PLAN §5.7, ADR 0006).
import { compareKeys, type Dict } from './dict.ts';
import { en } from './en.ts';
import { es } from './es.ts';
import type { Locale } from './routes.ts';

export * from './routes.ts';
export type { Dict } from './dict.ts';

export type Messages = Dict<typeof es>;

const dictionaries: Record<Locale, Messages> = { es, en };

// Falla al cargar el módulo, y con él el build, si `en` no tiene las mismas claves
// que `es`.
const { missing, extra } = compareKeys(es, en);
if (missing.length > 0 || extra.length > 0) {
  throw new Error(
    `Diccionario en: faltan claves [${missing.join(', ')}]; sobran claves [${extra.join(', ')}]`,
  );
}

export const messages = (locale: Locale): Messages => dictionaries[locale];
