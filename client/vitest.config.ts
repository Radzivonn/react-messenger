import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './client/src/setupTests.ts',
    coverage: {
      all: true,
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './tests/unit/coverage',
      include: ['client/src/**/*.{ts,tsx}'],
      exclude: ['client/src/test/', '**/types.ts', 'vite-env.d.ts'],
    },
  },
});
