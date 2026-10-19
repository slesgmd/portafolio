// Configuración de Vitest (ADR 0010).
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Las pruebas de core y domain corren sin DOM (§5.2).
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', '.astro/**'],
    coverage: {
      provider: 'v8',
      // Umbral solo sobre las capas puras; sin umbral en ui (§11).
      include: ['src/core/**/*.ts', 'src/tools/*/domain/**/*.ts'],
      exclude: ['**/*.test.ts'],
      thresholds: { branches: 90 },
    },
  },
});
