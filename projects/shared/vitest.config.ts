import { defineConfig } from 'vitest/config';

// Pure domain logic — no DOM needed.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
