// Paso 3 (PLAN §12).
//
// Uso: node scripts/check-provenance.ts [base]
//   Sin base, revisa todos los commits alcanzables desde HEAD; con base, los de
//   `base..HEAD`. Necesita el historial completo (`fetch-depth: 0`).
//
// Los términos van con clases de caracteres para que este archivo no se detecte a sí
// mismo, y deben coincidir con `names` en `.githooks/commit-msg`.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const names = /[c]laude|[a]nthropic/i;
const coAuthor = /^[ \t]*co-authored-by:/im;

const git = (args: string[]): string =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });

const matchingLines = (text: string): string[] =>
  text.split(/\r?\n/).flatMap((line, i) => (names.test(line) ? [`  ${i + 1}: ${line}`] : []));

const problems: string[] = [];

if (git(['rev-parse', '--is-shallow-repository']).trim() === 'true') {
  console.error('check-provenance: el clon es superficial; hace falta el historial completo.');
  process.exit(1);
}

// Con `-z`, los commits se separan con NUL; dentro de cada uno, `%x00` separa el hash
// del mensaje.
const base = process.argv[2];
const log = git(['log', '-z', '--format=%H%x00%B', base ? `${base}..HEAD` : 'HEAD']);
const fields = log.split('\0');
let commits = 0;
for (let i = 0; i + 1 < fields.length; i += 2) {
  const hash = (fields[i] ?? '').trim().slice(0, 12);
  const message = fields[i + 1] ?? '';
  commits++;
  if (coAuthor.test(message)) {
    problems.push(`commit ${hash}: tiene un trailer Co-authored-by.`);
  }
  const lines = matchingLines(message);
  if (lines.length > 0) {
    problems.push(`commit ${hash}: el mensaje nombra al asistente o a su proveedor:`, ...lines);
  }
}

const files = git(['ls-files', '-z']).split('\0').filter(Boolean);
for (const file of files) {
  if (names.test(file)) {
    problems.push(`${file}: el nombre nombra al asistente o a su proveedor.`);
  }
  let content: Buffer;
  try {
    content = readFileSync(file);
  } catch {
    continue; // Borrado en la copia de trabajo y aún versionado.
  }
  const isBinary = content.includes(0);
  if (isBinary) continue;
  const lines = matchingLines(content.toString('utf8'));
  if (lines.length > 0) {
    problems.push(`${file}: nombra al asistente o a su proveedor:`, ...lines);
  }
}

if (problems.length > 0) {
  console.error('check-provenance: problemas de procedencia (AGENTS.md, PLAN §12):');
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(
  `check-provenance: ${commits} commits y ${files.length} archivos revisados; todo en orden.`,
);
