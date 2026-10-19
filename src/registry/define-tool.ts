import * as v from 'valibot';
import type { Result } from '../core/result.ts';

export interface ToolMeta {
  /** kebab-case, igual al nombre de la carpeta de la herramienta. */
  readonly slug: string;
  readonly status: 'stable' | 'beta';
  /** Cuándo se carga la interfaz (PLAN §5.8). */
  readonly hydration: 'load' | 'visible';
  readonly tags: readonly string[];
  readonly persistence: { readonly version: number } | null;
}

const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const toolMetaSchema: v.GenericSchema<unknown, ToolMeta> = v.strictObject({
  slug: v.pipe(v.string(), v.regex(kebabCase, 'debe estar en kebab-case')),
  status: v.picklist(['stable', 'beta']),
  hydration: v.picklist(['load', 'visible']),
  tags: v.array(v.pipe(v.string(), v.nonEmpty())),
  persistence: v.nullable(
    v.strictObject({ version: v.pipe(v.number(), v.integer(), v.minValue(1)) }),
  ),
});

/** Solo tipa el `meta.ts`; la validación la hace el registro en el build (ADR 0011). */
export const defineTool = (meta: ToolMeta): ToolMeta => meta;

/** Cada error como `ruta: mensaje`, o `mensaje` en la raíz. */
export const formatIssues = (issues: readonly v.BaseIssue<unknown>[]): string[] =>
  issues.map((issue) => {
    const path = v.getDotPath(issue);
    return path === null ? issue.message : `${path}: ${issue.message}`;
  });

export const parseToolMeta = (raw: unknown): Result<ToolMeta, readonly string[]> => {
  const result = v.safeParse(toolMetaSchema, raw);
  return result.success
    ? { ok: true, value: result.output }
    : { ok: false, error: formatIssues(result.issues) };
};
