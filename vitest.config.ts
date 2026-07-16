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
      JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-with-at-least-32-chars',
      DEFAULT_TENANT_ID: '00000000-0000-4000-8000-000000000001',
      QUEUE_DRIVER: 'memory',
      REDIS_URL: 'redis://localhost:6379',
      HASH_ALGORITHM: 'argon2',
      OTEL_ENABLED: 'false',
    },
  },
});
