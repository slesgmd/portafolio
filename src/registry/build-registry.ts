import * as v from 'valibot';
import type { Result } from '../core/result.ts';
import { formatIssues, parseToolMeta, type ToolMeta } from './define-tool.ts';

/** Textos de cada herramienta por idioma, con lo que necesita el índice. */
export type ToolTextsByLocale = Readonly<
  Record<string, { readonly name: string; readonly description: string }>
>;

/** Módulos descubiertos con `import.meta.glob`, por ruta. */
export interface ToolModules {
  /** `tools/<carpeta>/meta.ts`, con el meta como export por defecto. */
  readonly meta: Readonly<Record<string, unknown>>;
  /** `tools/<carpeta>/i18n.ts`, con los textos en el export `texts`. */
  readonly i18n: Readonly<Record<string, unknown>>;
  /** Rutas de `tools/<carpeta>/ui/Tool.astro`: el registro no importa `ui/` (§5.2). */
  readonly ui: readonly string[];
}

export interface ToolEntry {
  readonly meta: ToolMeta;
  readonly texts: ToolTextsByLocale;
}

export type RegistryError =
  | { readonly kind: 'invalid_meta'; readonly folder: string; readonly issues: readonly string[] }
  | { readonly kind: 'invalid_i18n'; readonly folder: string; readonly issues: readonly string[] }
  | { readonly kind: 'slug_mismatch'; readonly folder: string; readonly slug: string }
  | { readonly kind: 'duplicate_slug'; readonly slug: string }
  | { readonly kind: 'missing_meta' | 'missing_ui' | 'missing_i18n'; readonly folder: string };

const textsSchema = v.object({
  texts: v.record(
    v.string(),
    v.object({ name: v.pipe(v.string(), v.nonEmpty()), description: v.string() }),
  ),
});

const byFolder = (paths: readonly string[], file: string): Map<string, string> => {
  const pattern = new RegExp(`(?:^|/)tools/([^/]+)/${file.replaceAll('.', '\\.')}$`);
  const folders = new Map<string, string>();
  for (const path of paths) {
    const folder = pattern.exec(path)?.[1];
    if (folder !== undefined) folders.set(folder, path);
  }
  return folders;
};

const defaultExport = (module: unknown): unknown =>
  typeof module === 'object' && module !== null && 'default' in module ? module.default : undefined;

/**
 * Valida las herramientas descubiertas y devuelve sus entradas ordenadas por slug, o
 * todos los errores encontrados (PLAN §5.4).
 */
export const buildRegistry = (
  modules: ToolModules,
): Result<readonly ToolEntry[], readonly RegistryError[]> => {
  const metas = byFolder(Object.keys(modules.meta), 'meta.ts');
  const texts = byFolder(Object.keys(modules.i18n), 'i18n.ts');
  const uis = byFolder(modules.ui, 'ui/Tool.astro');
  const folders = [...new Set([...metas.keys(), ...texts.keys(), ...uis.keys()])].sort();

  const errors: RegistryError[] = [];
  const entries: ToolEntry[] = [];
  const slugCounts = new Map<string, number>();

  for (const folder of folders) {
    const metaPath = metas.get(folder);
    const textsPath = texts.get(folder);
    const problems: RegistryError[] = [];

    if (metaPath === undefined) problems.push({ kind: 'missing_meta', folder });
    if (!uis.has(folder)) problems.push({ kind: 'missing_ui', folder });
    if (textsPath === undefined) problems.push({ kind: 'missing_i18n', folder });

    const meta =
      metaPath === undefined ? null : parseToolMeta(defaultExport(modules.meta[metaPath]));
    if (meta !== null && !meta.ok)
      problems.push({ kind: 'invalid_meta', folder, issues: meta.error });
    if (meta?.ok) {
      const { slug } = meta.value;
      slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
      if (slug !== folder) problems.push({ kind: 'slug_mismatch', folder, slug });
    }

    const parsedTexts =
      textsPath === undefined ? null : v.safeParse(textsSchema, modules.i18n[textsPath]);
    if (parsedTexts !== null && !parsedTexts.success) {
      problems.push({ kind: 'invalid_i18n', folder, issues: formatIssues(parsedTexts.issues) });
    }

    errors.push(...problems);
    if (problems.length === 0 && meta?.ok && parsedTexts?.success) {
      entries.push({ meta: meta.value, texts: parsedTexts.output.texts });
    }
  }

  for (const [slug, count] of slugCounts) {
    if (count > 1) errors.push({ kind: 'duplicate_slug', slug });
  }

  return errors.length > 0 ? { ok: false, error: errors } : { ok: true, value: entries };
};

/** Una línea por error, para el mensaje con el que falla el build. */
export const formatRegistryErrors = (errors: readonly RegistryError[]): string =>
  errors
    .map((error) => {
      switch (error.kind) {
        case 'invalid_meta':
          return `tools/${error.folder}/meta.ts no es válido: ${error.issues.join('; ')}`;
        case 'invalid_i18n':
          return `tools/${error.folder}/i18n.ts no es válido: ${error.issues.join('; ')}`;
        case 'slug_mismatch':
          return `tools/${error.folder}/meta.ts: el slug "${error.slug}" no coincide con la carpeta`;
        case 'duplicate_slug':
          return `el slug "${error.slug}" está repetido`;
        case 'missing_meta':
          return `tools/${error.folder}: falta meta.ts`;
        case 'missing_ui':
          return `tools/${error.folder}: falta ui/Tool.astro`;
        case 'missing_i18n':
          return `tools/${error.folder}: falta i18n.ts`;
      }
    })
    .join('\n');
