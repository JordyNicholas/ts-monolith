import { Prisma, PrismaClient } from './client/client.js';
import { createPrismaClient } from './createPrismaClient.js';
import { env } from '../env/index.js';

type PrismaQueryArgs = {
  where?: Record<string, unknown>;
  data?: Record<string, unknown> | Record<string, unknown>[];
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export function getTenantPrisma(tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }): Promise<unknown> {
          const tenantBoundModels: string[] = ['User', 'Report'];

          if (tenantBoundModels.includes(model)) {
            // Safely assert the union type to our strict interface
            const typedArgs = args as PrismaQueryArgs;

            if (operation === 'create' || operation === 'createMany') {
              // Ensure data exists before spreading, fallback to empty object if undefined
              typedArgs.data = { ...(typedArgs.data || {}), tenantId };
            } else if (
              [
                'findFirst',
                'findMany',
                'findUnique',
                'update',
                'updateMany',
                'delete',
                'deleteMany',
                'count',
              ].includes(operation)
            ) {
              // Ensure where exists before spreading
              typedArgs.where = { ...(typedArgs.where || {}), tenantId };
            }
          }

          return query(args);
        },
      },
    },
  });
}

// 3. Export the Type for Dependency Injection
export type TenantPrismaClient = ReturnType<typeof getTenantPrisma>;
