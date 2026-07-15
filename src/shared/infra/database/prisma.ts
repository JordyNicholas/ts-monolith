// 1. Explicitly load environment variables (required by the new provider)
import 'dotenv/config';

// 2. Target the specific client.ts file, using the .js extension for ESM compliance
import { Prisma, PrismaClient } from './client/client.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Explicitly typing the configuration bypasses the Subset<T> overload failure
const prismaOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  accelerateUrl: '',
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
