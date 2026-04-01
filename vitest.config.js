import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['dotenv/config'],
    pool: 'threads',
    maxThreads: 1,
    minThreads: 1,
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
  },
});
