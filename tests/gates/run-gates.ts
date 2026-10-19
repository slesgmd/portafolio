// Pruebas negativas de las compuertas (PLAN §12, principio 4).
//
// Para cada caso de `cases.ts`: copia los archivos versionados a un directorio
// temporal, enlaza `node_modules` (salvo en el paso 1), escribe los archivos del
// caso y ejecuta el comando de su paso. El caso pasa si el comando falla y su
// salida contiene la firma esperada. Antes comprueba que `ci.yml` llama a cada
// comando, para que los casos prueben las mismas compuertas que la CI.
//
// Las pruebas reutilizadas (`reusedTests`) se ejecutan en el propio repositorio y
// deben pasar.
//
// Uso: node tests/gates/run-gates.ts [filtro]
//   El filtro selecciona los casos cuyo nombre lo contiene. Los casos corren uno
//   detrás de otro: comparten las cachés de `node_modules`.
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { stripVTControlCharacters } from 'node:util';
import { cases, reusedTests, type GateCase } from './cases.ts';

const root = resolve(import.meta.dirname, '../..');
const filter = process.argv[2] ?? '';

// pnpm 12 instala las dependencias antes de cada script (`verifyDepsBeforeRun`).
// En la copia, `node_modules` es un enlace: se desactiva para que no intente
// escribir en él. El paso 1 no ejecuta scripts y no le afecta.
const env = {
  ...process.env,
  ASTRO_TELEMETRY_DISABLED: '1',
  NO_COLOR: '1',
  pnpm_config_verify_deps_before_run: 'false',
};

// pnpm se lanza a través de la shell porque en Windows es un `.cmd`. El comando va
// como una sola cadena: sus argumentos son fijos (los de `cases.ts`), sin espacios
// ni datos externos.
const pnpm = (args: string[], cwd: string) => {
  const result = spawnSync(`pnpm ${args.join(' ')}`, {
    cwd,
    env,
    encoding: 'utf8',
    shell: true,
    timeout: 10 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
  });
  // Sin códigos ANSI, para que las firmas no dependan de los colores: no todas las
  // herramientas respetan `NO_COLOR`.
  const output = stripVTControlCharacters(`${result.stdout ?? ''}${result.stderr ?? ''}`);
  return { status: result.status, output };
};

// Enlaces del primer nivel de `node_modules` (y de sus ámbitos `@x/`) con su
// destino. Si un caso los cambia, algo escribió en el `node_modules` real a través
// del enlace de la copia, y el ejecutor se detiene.
const nodeModulesLinks = (): string => {
  const base = join(root, 'node_modules');
  const entries = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isSymbolicLink()) return [`${path} -> ${readlinkSync(path)}`];
      if (entry.isDirectory() && entry.name.startsWith('@')) return entries(path);
      return [];
    });
  return entries(base).join('\n');
};

const tracked = (): string[] => {
  const result = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ls-files falló:\n${result.stderr}`);
  return result.stdout.split('\0').filter(Boolean);
};

// Copia de trabajo de los archivos versionados.
const copyRepo = (dir: string) => {
  for (const file of tracked()) {
    const source = join(root, file);
    if (!existsSync(source)) continue; // Borrado en la copia de trabajo y aún versionado.
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    cpSync(source, join(dir, file));
  }
};

const runCase = (gate: GateCase): string[] => {
  const dir = mkdtempSync(join(tmpdir(), 'gates-'));
  const link = join(dir, 'node_modules');
  try {
    copyRepo(dir);
    if (!gate.withoutNodeModules) symlinkSync(join(root, 'node_modules'), link, 'junction');
    for (const [file, content] of Object.entries(gate.files)) {
      const path = join(dir, file);
      mkdirSync(dirname(path), { recursive: true });
      const current = existsSync(path) ? readFileSync(path, 'utf8') : '';
      writeFileSync(path, typeof content === 'function' ? content(current) : content);
    }
    const { status, output } = pnpm(gate.command, dir);
    if (status === 0) return ['el comando terminó sin errores.'];
    if (!gate.expected.test(output)) {
      return [`falló sin la firma ${gate.expected}. Salida:`, output.trimEnd()];
    }
    return [];
  } finally {
    // Primero el enlace, para que el borrado recursivo nunca llegue al `node_modules` real.
    if (!gate.withoutNodeModules && existsSync(link)) unlinkSync(link);
    rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
  }
};

const ci = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8');
const links = nodeModulesLinks();
const failures: string[] = [];
let ran = 0;

for (const gate of cases.filter((c) => c.name.includes(filter))) {
  const label = `paso ${gate.step}, ${gate.name}`;
  const command = `pnpm ${gate.command.join(' ')}`;
  ran++;
  const problems = ci.includes(command)
    ? runCase(gate)
    : [`ci.yml no ejecuta "${command}": el caso no probaría la compuerta real.`];
  if (nodeModulesLinks() !== links) {
    console.error(
      `run-gates: el caso "${label}" modificó los enlaces de node_modules del repositorio.` +
        " Ejecuta 'pnpm install --frozen-lockfile' para repararlos.",
    );
    process.exit(1);
  }
  console.log(`${problems.length === 0 ? 'ok   ' : 'FALLA'} ${label}`);
  if (problems.length > 0) failures.push(`${label}: ${problems.join('\n')}`);
}

for (const test of reusedTests.filter((t) => t.name.includes(filter))) {
  const label = `paso ${test.step}, ${test.name} (${test.file})`;
  ran++;
  const { status, output } = pnpm(['exec', 'vitest', 'run', test.file], root);
  console.log(`${status === 0 ? 'ok   ' : 'FALLA'} ${label}`);
  if (status !== 0) failures.push(`${label}: la prueba falló. Salida:\n${output.trimEnd()}`);
}

if (ran === 0) {
  console.error(`run-gates: ningún caso contiene "${filter}".`);
  process.exit(1);
}
if (failures.length > 0) {
  console.error(`\nrun-gates: ${failures.length} de ${ran} casos no se comportaron como debían:\n`);
  console.error(failures.join('\n\n'));
  process.exit(1);
}
console.log(`\nrun-gates: los ${ran} casos fallan en su compuerta, como deben.`);
