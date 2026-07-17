import { describe, expect, test } from 'vitest';
import { validateEnv } from './index.js';

const baseProductionEnv = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://user:password@localhost:5432/monolith_db',
  JWT_SECRET: 'production-access-secret-with-at-least-32-characters',
  JWT_REFRESH_SECRET: 'production-refresh-secret-with-at-least-32-characters',
  CORS_ORIGIN: 'https://app.example.com',
};

describe('production environment validation', () => {
  test('accepts independent secrets and an explicit CORS allowlist', () => {
    expect(validateEnv(baseProductionEnv).success).toBe(true);
  });

  test('rejects the documented demo access secret', () => {
    const result = validateEnv({
      ...baseProductionEnv,
      JWT_SECRET: 'change-me-to-a-long-random-secret-at-least-32-chars',
    });

    expect(result.success).toBe(false);
  });

  test('rejects wildcard CORS', () => {
    const result = validateEnv({
      ...baseProductionEnv,
      CORS_ORIGIN: '*',
    });

    expect(result.success).toBe(false);
  });

  test('requires an independent refresh secret', () => {
    const result = validateEnv({
      ...baseProductionEnv,
      JWT_REFRESH_SECRET: baseProductionEnv.JWT_SECRET,
    });

    expect(result.success).toBe(false);
  });

  test('rejects unsupported token revocation drivers', () => {
    const result = validateEnv({
      ...baseProductionEnv,
      TOKEN_REVOCATION_DRIVER: 'database',
    });

    expect(result.success).toBe(false);
  });
});
