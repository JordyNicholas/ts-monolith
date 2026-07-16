import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.url('DATABASE_URL must be a valid connection string'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long for security'),
});

// We use safeParse to gracefully catch errors and log them before crashing
const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('❌ Invalid environment variables:', z.treeifyError(_env.error));
  process.exit(1);
}

export const env = _env.data;