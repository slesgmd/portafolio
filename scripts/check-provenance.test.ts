// Repositorios temporales sin la configuración global ni la del sistema, para que el
// resultado no dependa del equipo.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const script = resolve(import.meta.dirname, 'check-provenance.ts');

// Los términos se construyen al ejecutar, para que este archivo no los contenga.
const assistant = ['Cla', 'ude'].join('');
const provider = ['anth', 'ropic'].join('');

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
});

function createRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'check-provenance-'));
  dirs.push(dir);
  const emptyConfig = join(dir, '.gitconfig-vacio');
  writeFileSync(emptyConfig, '');
  const env = {
    ...process.env,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: emptyConfig,
    GIT_AUTHOR_NAME: 'Prueba',
    GIT_AUTHOR_EMAIL: 'prueba@example.com',
    GIT_AUTHOR_DATE: '2026-01-01T00:00:00Z',
    GIT_COMMITTER_NAME: 'Prueba',
    GIT_COMMITTER_EMAIL: 'prueba@example.com',
    GIT_COMMITTER_DATE: '2026-01-01T00:00:00Z',
  };
  const repo = join(dir, 'repo');
  mkdirSync(repo);
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: repo, env, encoding: 'utf8' }).trim();
  git('init', '-q', '-b', 'main');

  return {
    commit(message: string[], files: Record<string, string> = {}) {
      for (const [path, content] of Object.entries(files)) {
        mkdirSync(dirname(join(repo, path)), { recursive: true });
        writeFileSync(join(repo, path), content);
      }
      git('add', '--all');
      git('commit', '-q', '--allow-empty', ...message.flatMap((m) => ['-m', m]));
      return git('rev-parse', 'HEAD');
    },
    check(base?: string) {
      const result = spawnSync(process.execPath, [script, ...(base ? [base] : [])], {
        cwd: repo,
        env,
        encoding: 'utf8',
      });
      return { status: result.status, output: result.stdout + result.stderr };
    },
  };
}

describe('check-provenance', { timeout: 30_000 }, () => {
  it('pasa con commits y archivos limpios', () => {
    const repo = createRepo();
    const base = repo.commit(['chore: base'], { 'README.md': '# Proyecto\n' });
    repo.commit(['feat: añade una página'], { 'src/pagina.ts': 'export const a = 1;\n' });
    const { status, output } = repo.check(base);
    expect(output).toContain('1 commits y 2 archivos revisados');
    expect(status).toBe(0);
  });

  it('falla con un trailer Co-authored-by', () => {
    const repo = createRepo();
    const base = repo.commit(['chore: base'], { 'README.md': '# Proyecto\n' });
    repo.commit(['feat: añade algo', 'Co-authored-by: Otra Persona <otra@example.com>']);
    const { status, output } = repo.check(base);
    expect(output).toContain('Co-authored-by');
    expect(status).toBe(1);
  });

  it('falla si un mensaje nombra al asistente o al proveedor, sin distinguir mayúsculas', () => {
    for (const term of [assistant, assistant.toUpperCase(), provider]) {
      const repo = createRepo();
      const base = repo.commit(['chore: base'], { 'README.md': '# Proyecto\n' });
      repo.commit(['feat: añade algo', `Hecho con ${term}.`]);
      const { status, output } = repo.check(base);
      expect(output).toContain('el mensaje nombra');
      expect(status).toBe(1);
    }
  });

  it('falla si el contenido de un archivo versionado los nombra', () => {
    const repo = createRepo();
    const base = repo.commit(['chore: base'], { 'README.md': '# Proyecto\n' });
    repo.commit(['docs: añade notas'], { 'docs/notas.md': `Uno\nRevisado por ${provider}.\n` });
    const { status, output } = repo.check(base);
    expect(output).toContain('docs/notas.md: nombra');
    expect(output).toContain('2: Revisado por');
    expect(status).toBe(1);
  });

  it('falla si el nombre de un archivo versionado los nombra', () => {
    const repo = createRepo();
    const base = repo.commit(['chore: base'], { 'README.md': '# Proyecto\n' });
    repo.commit(['chore: añade configuración'], { [`${assistant}.md`]: 'Instrucciones.\n' });
    const { status, output } = repo.check(base);
    expect(output).toContain(`${assistant}.md: el nombre nombra`);
    expect(status).toBe(1);
  });

  it('con base, ignora los mensajes anteriores a ella; sin base, revisa todo el historial', () => {
    const repo = createRepo();
    const base = repo.commit(['chore: base', `Hecho con ${assistant}.`], {
      'README.md': '# Proyecto\n',
    });
    repo.commit(['feat: añade algo']);
    expect(repo.check(base).status).toBe(0);
    expect(repo.check().status).toBe(1);
  });

  it('ignora el contenido de los archivos binarios', () => {
    const repo = createRepo();
    const base = repo.commit(['chore: base'], { 'README.md': '# Proyecto\n' });
    repo.commit(['feat: añade una imagen'], { 'imagen.bin': `\0${assistant}\0` });
    expect(repo.check(base).status).toBe(0);
  });
});
