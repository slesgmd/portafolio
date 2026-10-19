import { assertSameKeys, type Dict } from './dict.ts';
import { en } from './en.ts';
import { es } from './es.ts';
import type { Locale } from './routes.ts';

export * from './editorial.ts';
export * from './routes.ts';
export * from './site.ts';
export * from './tool-texts.ts';
export type { Dict } from './dict.ts';

export type Messages = Dict<typeof es>;

const dictionaries: Record<Locale, Messages> = { es, en };

assertSameKeys('Diccionario en', es, en);

export const messages = (locale: Locale): Messages => dictionaries[locale];
