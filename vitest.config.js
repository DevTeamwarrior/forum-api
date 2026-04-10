import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    sequence: {
      concurrent: false,
      shuffle: false,
      seed: 1,
      hooks: 'serial',
      setupFiles: [],
    },
    threads: false, // Disable worker threads, force single process
    isolate: true, // Isolate environment per test file
    coverage: {
      include: [
        'src/Commons/exceptions/*.js',
      ],
      exclude: [
        'src/Commons/exceptions/config.js',
      ],
    },
  },
});
