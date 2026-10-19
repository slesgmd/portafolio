// Principio 4 y PLAN §12. La salida de cada caso debe contener `expected`, para que un
// fallo por otro motivo no cuente como acierto. El contenido de los archivos va aquí,
// como texto, para que ninguna compuerta del propio repositorio lo revise (ADR 0010).

export interface GateCase {
  step: 1 | 2 | 3 | 4 | 5;
  name: string;
  // `ci.yml` debe contener `pnpm <command>`.
  command: string[];
  files: Record<string, string | ((current: string) => string)>;
  expected: RegExp;
  // Paso 1: la instalación no debe poder tocar el `node_modules` real.
  withoutNodeModules?: boolean;
}

// Debe pasar: ya contiene los casos negativos de su compuerta.
export interface ReusedTest {
  step: 1 | 2 | 3 | 4 | 5;
  name: string;
  file: string;
}

const addDependency = (current: string): string => {
  const pkg = JSON.parse(current) as { devDependencies: Record<string, string> };
  pkg.devDependencies['is-number'] = '7.0.0';
  return `${JSON.stringify(pkg, null, 2)}\n`;
};

// Sustituye un texto que debe estar en el archivo: si el archivo cambia y el texto
// desaparece, el caso falla por ese motivo y no por otro.
const replaceOnce =
  (search: string, replacement: string) =>
  (current: string): string => {
    if (!current.includes(search)) throw new Error(`No se encontró: ${search}`);
    return current.replace(search, replacement);
  };

const enKey = "    name: 'English',\n";
const withoutEnKey = replaceOnce(enKey, '');
const withExtraEnKey = replaceOnce(enKey, `${enKey}    extra: 'Extra',\n`);

export const cases: GateCase[] = [
  {
    step: 1,
    name: 'lockfile desactualizado',
    command: ['install', '--frozen-lockfile'],
    files: { 'package.json': addDependency },
    expected: /ERR_PNPM_OUTDATED_LOCKFILE/,
    withoutNodeModules: true,
  },
  {
    step: 2,
    name: 'error de tipos',
    command: ['check'],
    files: { 'src/core/caso-tipos.ts': "export const n: number = 'texto';\n" },
    expected: /ts\(2322\)/,
  },
  {
    step: 2,
    name: 'traducción faltante (tipos)',
    command: ['check'],
    files: { 'src/i18n/en.ts': withoutEnKey },
    expected: /Property 'name' is missing/,
  },
  {
    step: 2,
    name: 'traducción sobrante (tipos)',
    command: ['check'],
    files: { 'src/i18n/en.ts': withExtraEnKey },
    expected: /'extra' does not exist/,
  },
  {
    step: 2,
    name: 'API del navegador en core',
    command: ['check'],
    files: { 'src/core/caso-dom.ts': 'export const ancho = (): number => window.innerWidth;\n' },
    expected: /caso-dom\.ts.*Cannot find name 'window'/,
  },
  {
    step: 3,
    name: 'violación de ESLint',
    command: ['lint'],
    files: { 'src/core/caso-lint.ts': 'export function f(): void {\n  debugger;\n}\n' },
    expected: /no-debugger/,
  },
  {
    step: 3,
    name: 'violación de fronteras (core importa platform)',
    command: ['lint'],
    files: {
      'src/platform/reloj.ts': 'export const ahora = (): number => 0;\n',
      'src/core/usa-platform.ts':
        "import { ahora } from '../platform/reloj.ts';\n\nexport const t = ahora();\n",
    },
    expected: /boundaries\/dependencies/,
  },
  {
    step: 3,
    name: 'paquete no permitido (core importa el validador)',
    command: ['lint'],
    files: {
      'src/core/usa-validador.ts':
        "import * as v from 'valibot';\n\nexport const s = v.string();\n",
    },
    expected: /core no puede importar valibot/,
  },
  {
    step: 3,
    name: 'violación de fronteras (i18n importa core)',
    command: ['lint'],
    files: {
      'src/core/texto.ts': "export const texto = 'x';\n",
      'src/i18n/usa-core.ts':
        "import { texto } from '../core/texto.ts';\n\nexport const t = texto;\n",
    },
    expected: /i18n no puede importar \.\.\/core\/texto\.ts/,
  },
  {
    step: 3,
    name: 'archivo sin formatear',
    command: ['format:check'],
    files: { 'src/core/caso-formato.ts': 'export const a = {b:1}\n' },
    expected: /src\/core\/caso-formato\.ts[\s\S]*Code style issues/,
  },
  {
    step: 4,
    name: 'prueba que falla',
    command: ['test:coverage'],
    files: {
      'src/core/caso-falla.test.ts':
        "import { expect, it } from 'vitest';\n\nit('falla', () => {\n  expect(1).toBe(2);\n});\n",
    },
    expected: /caso-falla\.test\.ts[\s\S]*1 failed/,
  },
  {
    step: 4,
    name: 'cobertura de ramas bajo el umbral',
    command: ['test:coverage'],
    files: {
      'src/core/signo.ts': 'export const signo = (n: number): number => (n < 0 ? -1 : 1);\n',
      'src/core/signo.test.ts':
        "import { expect, it } from 'vitest';\nimport { signo } from './signo.ts';\n\n" +
        "it('positivo', () => {\n  expect(signo(2)).toBe(1);\n});\n",
    },
    expected: /Coverage for branches \(50%\) does not meet global threshold \(90%\)/,
  },
  {
    step: 4,
    name: 'color con contraste insuficiente',
    command: ['test:coverage'],
    files: {
      'src/design/tokens.css': replaceOnce(
        '--color-text-muted: light-dark(oklch(45% ',
        '--color-text-muted: light-dark(oklch(80% ',
      ),
    },
    expected: /color-text-muted sobre color-bg \(light\)/,
  },
  {
    step: 5,
    name: 'build que falla',
    command: ['build'],
    files: {
      'src/pages/caso-build.astro':
        "---\nimport Falta from '../components/Falta.astro';\n---\n\n<Falta />\n",
    },
    expected: /Falta\.astro/,
  },
  {
    step: 5,
    name: 'traducción faltante (build)',
    command: ['build'],
    files: { 'src/i18n/en.ts': withoutEnKey },
    expected: /faltan claves \[langSwitch\.name\]/,
  },
];

// Se reutiliza en lugar de duplicar sus casos (decisión del usuario, tarea 0.2b).
export const reusedTests: ReusedTest[] = [
  { step: 3, name: 'comprobación de procedencia', file: 'scripts/check-provenance.test.ts' },
];
