import path from 'path';
import { defineConfig } from 'vitest/config';

// Standalone test config — deliberately does NOT load vite.config.ts so the
// PWA/service-worker plugin and git-info execSync don't run during unit tests.
// JSX is handled by esbuild's automatic runtime (no React import needed).
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  // AboutDialog guards __APP_VERSION__ with a typeof check, but defining it
  // keeps the test environment identical to the build.
  define: {
    __APP_VERSION__: JSON.stringify({
      version: 'test',
      revision: 'test',
      branch: 'test',
      buildTime: '1970-01-01T00:00:00.000Z',
    }),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@figo/shared': path.resolve(__dirname, '../../projects/shared/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    restoreMocks: true,
  },
});
