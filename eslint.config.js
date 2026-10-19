// Configuración de ESLint (ADR 0005). Las capas y sus fronteras son las de PLAN §5.2.
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import boundaries from 'eslint-plugin-boundaries';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Capas (§5.2). Cada ruta es un prefijo completo desde la raíz del repositorio.
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

// Atajos para los selectores de las políticas.
const layer = (type) => ({ element: { type } });
const toolFile = (fileInternalPath, tool) => ({
  element: { type: 'tool', fileInternalPath, ...(tool && { captured: { tool } }) },
});
const sameTool = '{{from.element.captured.tool}}';
const external = (source) => ({ module: { origin: 'external', source } });

// Paquetes externos por capa (§5.2). Solo los nombrados aquí están permitidos;
// cada uno se justifica en un ADR.
const pagePackages = ['astro', 'astro:*', '@astrojs/*'];
const testPackages = ['vitest', 'fast-check', '@playwright/test', '@axe-core/playwright'];

const policies = [
  // core: solo core.
  { from: layer('core'), allow: { to: layer('core') } },
  // i18n: solo sus propios archivos.
  { from: layer('i18n'), allow: { to: layer('i18n') } },
  // domain: su propio domain y core. Los paquetes puros llegan con su ADR.
  {
    from: layer('tool-domain'),
    allow: {
      to: [{ element: { type: 'tool-domain', captured: { tool: sameTool } } }, layer('core')],
    },
  },
  // platform: platform y core.
  { from: layer('platform'), allow: { to: [layer('platform'), layer('core')] } },
  // meta de herramienta: solo `registry/define-tool.ts`.
  {
    from: toolFile('meta.ts'),
    allow: { to: { element: { type: 'registry', fileInternalPath: 'define-tool.ts' } } },
  },
  // i18n de herramienta: solo i18n.
  { from: toolFile('i18n.ts'), allow: { to: layer('i18n') } },
  // ui: su propio ui, domain e `i18n.ts`; core, platform, components e i18n.
  // Los paquetes (polyfill de Temporal, framework de la decisión 6) llegan con su ADR.
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
  // registry: registry, core y los `meta.ts` e `i18n.ts` de las herramientas.
  // El validador llega con el ADR 0011.
  {
    from: layer('registry'),
    allow: {
      to: [layer('registry'), layer('core'), toolFile('meta.ts'), toolFile('i18n.ts')],
    },
  },
  // páginas, layouts y componentes: entre sí, registry, i18n, la ui de las
  // herramientas, el CSS de design y las integraciones de Astro.
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
  // design: solo su propio CSS.
  { from: layer('design'), allow: { to: layer('design') } },
  // Pruebas: además de lo que permite su capa, sus paquetes. Las de una
  // herramienta (`e2e.spec.ts`) pueden importar de su propia ui.
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

  // TypeScript dentro de los `.astro`: frontmatter y bloques `<script>`.
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.astro'] },
    },
  },

  // Entornos: navegador en ui, platform y los bloques `<script>` de los `.astro`;
  // Node en la configuración y los scripts. core y domain no reciben globales:
  // sus APIs prohibidas las detecta `tsconfig.domain.json` (§5.2).
  {
    files: ['src/tools/*/ui/**/*.{js,ts}', 'src/platform/**/*.{js,ts}', '**/*.astro/*.{js,ts}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.{js,mjs,ts}', '{scripts,tests,e2e}/**/*.{js,mjs,ts}'],
    languageOptions: { globals: globals.node },
  },

  // Fronteras entre capas y paquetes por capa (§5.2). Los bloques `<script>` de los
  // `.astro` llegan como archivos virtuales (`Foo.astro/1_1.ts`) y también entran.
  {
    files: ['src/**/*.{js,mjs,ts,astro}'],
    plugins: { boundaries },
    settings: {
      'boundaries/root-path': import.meta.dirname,
      // `node_modules` se incluye para que un paquete que el resolvedor encuentra (como
      // `vitest`) no cuente como archivo ignorado: su origen externo lo revisan las
      // políticas. Un import a un archivo del proyecto fuera de `src/` sigue fallando.
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
          // Revisa también los paquetes externos y los módulos de Node.
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
