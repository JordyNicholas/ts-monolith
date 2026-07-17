import 'dotenv/config';
import { z } from 'zod';
import { DEFAULT_TENANT_ID } from './constants.js';

const DEMO_JWT_SECRET = 'change-me-to-a-long-random-secret-at-least-32-chars';
const DEMO_JWT_REFRESH_SECRET = 'change-me-to-another-long-random-secret-at-least-32-chars';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.url('DATABASE_URL must be a valid connection string'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long for security'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long for security')
      .optional(),
    DEFAULT_TENANT_ID: z.uuid().default(DEFAULT_TENANT_ID),
    QUEUE_DRIVER: z.enum(['memory', 'bullmq']).default('memory'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    HASH_ALGORITHM: z.enum(['argon2', 'bcrypt']).default('argon2'),
    CORS_ORIGIN: z.string().default('*'),
    RATE_LIMIT_MAX: z.coerce.number().default(100),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
    OTEL_ENABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    OTEL_SERVICE_NAME: z.string().default('ts-monolith'),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV !== 'production') return;

    if (value.JWT_SECRET === DEMO_JWT_SECRET) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must not use the documented demo value in production',
      });
    }

    if (
      !value.JWT_REFRESH_SECRET ||
      value.JWT_REFRESH_SECRET === DEMO_JWT_REFRESH_SECRET ||
      value.JWT_REFRESH_SECRET === value.JWT_SECRET
    ) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_REFRESH_SECRET'],
        message: 'JWT_REFRESH_SECRET must be set to an independent non-demo value in production',
      });
    }

    if (value.CORS_ORIGIN === '*') {
      context.addIssue({
        code: 'custom',
        path: ['CORS_ORIGIN'],
        message: 'CORS_ORIGIN must be an explicit allowlist in production',
      });
    }
  });

export function validateEnv(input: NodeJS.ProcessEnv) {
  return envSchema.safeParse(input);
}

const _env = validateEnv(process.env);

if (_env.success === false) {
  console.error('❌ Invalid environment variables:', z.treeifyError(_env.error));
  process.exit(1);
}

export const env = {
  ..._env.data,
  JWT_REFRESH_SECRET: _env.data.JWT_REFRESH_SECRET ?? `${_env.data.JWT_SECRET}-refresh`,
};
