// Capas y fronteras: PLAN §5.2, ADR 0005.
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import boundaries from 'eslint-plugin-boundaries';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// `tool` recoge los archivos sueltos de una herramienta (`meta.ts`, `i18n.ts`,
// `e2e.spec.ts`); su `domain/` y su `ui/` son capas propias.
const elements = [
  { type: 'tool-domain', pattern: 'src/tools/*/domain', capture: ['tool'] },
  { type: 'tool-ui', pattern: 'src/tools/*/ui', capture: ['tool'] },
  { type: 'tool', pattern: 'src/tools/*', capture: ['tool'] },
  { type: 'core', pattern: 'src/core' },
  { type: 'i18n', pattern: 'src/i18n' },
  { type: 'platform', pattern: 'src/platform' },
  { type: 'registry', pattern: 'src/registry' },
  { type: 'pages', pattern: 'src/pages' },
  { type: 'layouts', pattern: 'src/layouts' },
  { type: 'components', pattern: 'src/components' },
  { type: 'design', pattern: 'src/design' },
  // Sin políticas hasta la sección de proyectos: ni importa ni se importa.
  { type: 'content', pattern: 'src/content' },
].map((element) => ({ ...element, partialMatch: false }));

const layer = (type) => ({ element: { type } });
const toolFile = (fileInternalPath, tool) => ({
  element: { type: 'tool', fileInternalPath, ...(tool && { captured: { tool } }) },
});
const sameTool = '{{from.element.captured.tool}}';
const external = (source) => ({ module: { origin: 'external', source } });

// Cada paquete permitido se justifica en un ADR.
const pagePackages = ['astro', 'astro:*', '@astrojs/*'];
const testPackages = ['vitest', 'fast-check', '@playwright/test', '@axe-core/playwright'];
const validator = external('valibot');

const policies = [
  { from: layer('core'), allow: { to: layer('core') } },
  { from: layer('i18n'), allow: { to: layer('i18n') } },
  // unified y los tipos de Temporal llegan con sus ADR.
  {
    from: layer('tool-domain'),
    allow: {
      to: [
        { element: { type: 'tool-domain', captured: { tool: sameTool } } },
        layer('core'),
        validator,
      ],
    },
  },
  { from: layer('platform'), allow: { to: [layer('platform'), layer('core')] } },
  {
    from: toolFile('meta.ts'),
    allow: { to: { element: { type: 'registry', fileInternalPath: 'define-tool.ts' } } },
  },
  { from: toolFile('i18n.ts'), allow: { to: layer('i18n') } },
  // Sin framework (decisión 6, ADR 0005). El polyfill de Temporal llega con su ADR.
  {
    from: layer('tool-ui'),
    allow: {
      to: [
        { element: { type: 'tool-ui', captured: { tool: sameTool } } },
        { element: { type: 'tool-domain', captured: { tool: sameTool } } },
        toolFile('i18n.ts', sameTool),
        layer('core'),
        layer('platform'),
        layer('components'),
        layer('i18n'),
      ],
    },
  },
  {
    from: layer('registry'),
    allow: {
      to: [layer('registry'), layer('core'), toolFile('meta.ts'), toolFile('i18n.ts'), validator],
    },
  },
  {
    from: [layer('pages'), layer('layouts'), layer('components')],
    allow: {
      to: [
        layer('pages'),
        layer('layouts'),
        layer('components'),
        layer('registry'),
        layer('i18n'),
        layer('tool-ui'),
        layer('design'),
        ...pagePackages.map(external),
      ],
    },
  },
  { from: layer('design'), allow: { to: layer('design') } },
  // Las pruebas suman sus paquetes a lo que permite su capa (ADR 0005).
  { from: { file: { categories: 'test' } }, allow: { to: testPackages.map(external) } },
  {
    from: [{ file: { categories: 'test' }, ...toolFile('e2e.spec.ts') }],
    allow: { to: { element: { type: 'tool-ui', captured: { tool: sameTool } } } },
  },
];

export default defineConfig([
  globalIgnores(['dist/', '.astro/', '.wrangler/', 'coverage/', 'node_modules/']),

  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs.recommended,
  astro.configs['jsx-a11y-strict'],

  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.astro'] },
    },
  },

  // core y domain no reciben globales: sus APIs prohibidas las detecta
  // `tsconfig.domain.json` (§5.2).
  {
    files: ['src/tools/*/ui/**/*.{js,ts}', 'src/platform/**/*.{js,ts}', '**/*.astro/*.{js,ts}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.{js,mjs,ts}', '{scripts,tests,e2e}/**/*.{js,mjs,ts}'],
    languageOptions: { globals: globals.node },
  },

  // Los bloques `<script>` de los `.astro` llegan como archivos virtuales
  // (`Foo.astro/1_1.ts`) y también entran.
  {
    files: ['src/**/*.{js,mjs,ts,astro}'],
    plugins: { boundaries },
    settings: {
      'boundaries/root-path': import.meta.dirname,
      // Sin `node_modules`, un paquete que el resolvedor encuentra (como `vitest`)
      // contaría como archivo ignorado. Su origen externo lo revisan las políticas (ADR 0005).
      'boundaries/include': ['src/**', 'node_modules/**'],
      'boundaries/elements': elements,
      'boundaries/files': [{ category: 'test', pattern: '**/*.{test,spec}.ts' }],
      'boundaries/legacy-templates': false,
      'import/resolver': {
        node: { extensions: ['.ts', '.js', '.mjs', '.astro', '.json'] },
      },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          // Sin esto, los paquetes externos y los módulos de Node no se revisan.
          checkAllOrigins: true,
          message:
            '{{from.element.types}} no puede importar {{dependency.source}} (PLAN §5.2, ADR 0005).',
          policies,
        },
      ],
      'boundaries/no-unknown-files': 'error',
      'boundaries/no-unknown-dependencies': 'error',
      'boundaries/no-ignored-dependencies': 'error',
    },
  },
]);
