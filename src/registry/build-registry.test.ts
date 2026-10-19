import { describe, expect, it } from 'vitest';
import {
  buildRegistry,
  formatRegistryErrors,
  type RegistryError,
  type ToolModules,
} from './build-registry.ts';
import type { ToolMeta } from './define-tool.ts';

const meta = (slug: string, overrides: Partial<ToolMeta> = {}): ToolMeta => ({
  slug,
  status: 'stable',
  hydration: 'load',
  tags: [],
  persistence: null,
  ...overrides,
});

const texts = (name: string) => ({
  texts: {
    es: { name, description: `${name} (es)` },
    en: { name, description: `${name} (en)` },
  },
});

// Módulos ficticios con las rutas que da `import.meta.glob` desde `src/registry/`.
const tool = (folder: string, toolMeta: unknown = meta(folder)): ToolModules => ({
  meta: { [`../tools/${folder}/meta.ts`]: { default: toolMeta } },
  i18n: { [`../tools/${folder}/i18n.ts`]: texts(folder) },
  ui: [`../tools/${folder}/ui/Tool.astro`],
});

const merge = (...parts: ToolModules[]): ToolModules => ({
  meta: Object.assign({}, ...parts.map((part) => part.meta)),
  i18n: Object.assign({}, ...parts.map((part) => part.i18n)),
  ui: parts.flatMap((part) => part.ui),
});

const errorsOf = (modules: ToolModules): readonly RegistryError[] => {
  const result = buildRegistry(modules);
  return result.ok ? [] : result.error;
};

describe('buildRegistry', () => {
  it('sin herramientas, devuelve un índice vacío', () => {
    expect(buildRegistry({ meta: {}, i18n: {}, ui: [] })).toEqual({ ok: true, value: [] });
  });

  it('devuelve las herramientas válidas ordenadas por slug', () => {
    const result = buildRegistry(merge(tool('time'), tool('base'), tool('sha256')));
    expect(result.ok && result.value.map((entry) => entry.meta.slug)).toEqual([
      'base',
      'sha256',
      'time',
    ]);
    expect(result.ok && result.value[0]).toEqual({
      meta: meta('base'),
      texts: texts('base').texts,
    });
  });

  it('informa un meta inválido con sus problemas', () => {
    const errors = errorsOf(tool('json', { ...meta('json'), hydration: 'idle' }));
    expect(errors).toEqual([
      { kind: 'invalid_meta', folder: 'json', issues: [expect.stringMatching(/^hydration: /)] },
    ]);
  });

  it('informa un meta sin export por defecto', () => {
    const modules = { ...tool('json'), meta: { '../tools/json/meta.ts': { meta: meta('json') } } };
    expect(errorsOf(modules)).toEqual([
      { kind: 'invalid_meta', folder: 'json', issues: [expect.any(String)] },
    ]);
    const notAModule = { ...tool('json'), meta: { '../tools/json/meta.ts': null } };
    expect(errorsOf(notAModule)[0]?.kind).toBe('invalid_meta');
  });

  it('informa un slug que no coincide con la carpeta, y los repetidos', () => {
    const errors = errorsOf(merge(tool('units'), tool('unidades', meta('units'))));
    expect(errors).toEqual([
      { kind: 'slug_mismatch', folder: 'unidades', slug: 'units' },
      { kind: 'duplicate_slug', slug: 'units' },
    ]);
  });

  it('informa los archivos que faltan en cada carpeta', () => {
    const errors = errorsOf({
      meta: { '../tools/a/meta.ts': { default: meta('a') } },
      i18n: { '../tools/b/i18n.ts': texts('b') },
      ui: ['../tools/c/ui/Tool.astro'],
    });
    expect(errors).toEqual([
      { kind: 'missing_ui', folder: 'a' },
      { kind: 'missing_i18n', folder: 'a' },
      { kind: 'missing_meta', folder: 'b' },
      { kind: 'missing_ui', folder: 'b' },
      { kind: 'missing_meta', folder: 'c' },
      { kind: 'missing_i18n', folder: 'c' },
    ]);
  });

  it('informa unos textos sin la forma esperada', () => {
    const modules = {
      ...tool('json'),
      i18n: { '../tools/json/i18n.ts': { texts: { es: { name: '', description: 'x' } } } },
    };
    expect(errorsOf(modules)).toEqual([
      {
        kind: 'invalid_i18n',
        folder: 'json',
        issues: [expect.stringMatching(/^texts\.es\.name: /)],
      },
    ]);
    const withoutTexts = { ...tool('json'), i18n: { '../tools/json/i18n.ts': {} } };
    expect(errorsOf(withoutTexts)).toEqual([
      { kind: 'invalid_i18n', folder: 'json', issues: [expect.stringMatching(/^texts: /)] },
    ]);
  });

  it('ignora las rutas que no son de una herramienta', () => {
    const modules = { ...tool('json'), ui: [...tool('json').ui, '../tools/json/ui/Otro.astro'] };
    expect(buildRegistry(modules).ok).toBe(true);
  });
});

describe('formatRegistryErrors', () => {
  it('da una línea por error', () => {
    const errors: RegistryError[] = [
      { kind: 'invalid_meta', folder: 'a', issues: ['slug: x', 'tags: y'] },
      { kind: 'invalid_i18n', folder: 'a', issues: ['texts: z'] },
      { kind: 'slug_mismatch', folder: 'b', slug: 'c' },
      { kind: 'duplicate_slug', slug: 'c' },
      { kind: 'missing_meta', folder: 'd' },
      { kind: 'missing_ui', folder: 'd' },
      { kind: 'missing_i18n', folder: 'd' },
    ];
    expect(formatRegistryErrors(errors).split('\n')).toEqual([
      'tools/a/meta.ts no es válido: slug: x; tags: y',
      'tools/a/i18n.ts no es válido: texts: z',
      'tools/b/meta.ts: el slug "c" no coincide con la carpeta',
      'el slug "c" está repetido',
      'tools/d: falta meta.ts',
      'tools/d: falta ui/Tool.astro',
      'tools/d: falta i18n.ts',
    ]);
  });
});
