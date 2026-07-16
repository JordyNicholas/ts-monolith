import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://user:password@localhost:5432/monolith_db',
      JWT_SECRET: 'test-jwt-secret-with-at-least-32-characters',
      DEFAULT_TENANT_ID: '00000000-0000-4000-8000-000000000001',
    },
  },
});
