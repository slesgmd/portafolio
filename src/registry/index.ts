import { buildRegistry, formatRegistryErrors, type ToolEntry } from './build-registry.ts';

export type { ToolEntry } from './build-registry.ts';

// De `ui/Tool.astro` solo se usan las rutas: el registro no importa `ui/` (§5.2).
const registry = buildRegistry({
  meta: import.meta.glob('../tools/*/meta.ts', { eager: true }),
  i18n: import.meta.glob('../tools/*/i18n.ts', { eager: true }),
  ui: Object.keys(import.meta.glob('../tools/*/ui/Tool.astro')),
});

if (!registry.ok) {
  throw new Error(`Registro de herramientas:\n${formatRegistryErrors(registry.error)}`);
}

/** Herramientas válidas, ordenadas por slug. */
export const tools: readonly ToolEntry[] = registry.value;

/** Falla si la herramienta no tiene textos en `locale`. */
export const textsFor = (entry: ToolEntry, locale: string) => {
  const texts = entry.texts[locale];
  if (texts === undefined) {
    throw new Error(`tools/${entry.meta.slug}/i18n.ts: faltan los textos en "${locale}"`);
  }
  return texts;
};
