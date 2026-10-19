import { describe, expect, it } from 'vitest';
import { parseToolMeta, type ToolMeta } from './define-tool.ts';

const valid: ToolMeta = {
  slug: 'markdown',
  status: 'beta',
  hydration: 'visible',
  tags: ['texto'],
  persistence: { version: 1 },
};

const issuesOf = (raw: unknown): readonly string[] => {
  const result = parseToolMeta(raw);
  return result.ok ? [] : result.error;
};

describe('parseToolMeta', () => {
  it('acepta un meta válido, con y sin persistencia', () => {
    expect(parseToolMeta(valid)).toEqual({ ok: true, value: valid });
    const stateless = { ...valid, slug: 'sha-256', persistence: null };
    expect(parseToolMeta(stateless)).toEqual({ ok: true, value: stateless });
  });

  it('rechaza un slug fuera de kebab-case', () => {
    for (const slug of ['Markdown', 'mark_down', '-md', 'md-', 'a--b', '']) {
      expect(issuesOf({ ...valid, slug })).toEqual(['slug: debe estar en kebab-case']);
    }
  });

  it('informa cada campo inválido con su ruta', () => {
    const issues = issuesOf({
      ...valid,
      status: 'alpha',
      hydration: 'idle',
      tags: ['ok', ''],
      persistence: { version: 0 },
    });
    expect(issues.map((issue) => issue.split(':')[0])).toEqual([
      'status',
      'hydration',
      'tags.1',
      'persistence.version',
    ]);
  });

  it('rechaza claves desconocidas, campos ausentes y versiones no enteras', () => {
    expect(issuesOf({ ...valid, extra: true })).toHaveLength(1);
    const withoutTags = Object.fromEntries(Object.entries(valid).filter(([key]) => key !== 'tags'));
    expect(issuesOf(withoutTags)[0]).toMatch(/^tags: /);
    expect(issuesOf({ ...valid, persistence: { version: 1.5 } })[0]).toMatch(
      /^persistence\.version: /,
    );
  });

  it('informa sin ruta lo que no es un objeto', () => {
    expect(issuesOf(null)).toEqual([expect.stringMatching(/^Invalid type/)]);
  });
});
