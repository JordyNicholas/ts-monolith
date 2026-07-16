import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from './client/client.js';
import { env } from '../env/index.js';

export function createPrismaClient(): PrismaClient {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}
