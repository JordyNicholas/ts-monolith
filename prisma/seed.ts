import 'dotenv/config';
import { createPrismaClient } from '../src/shared/infra/database/createPrismaClient.js';
import { DEFAULT_TENANT_ID } from '../src/shared/infra/env/constants.js';

const prisma = createPrismaClient();

async function main(): Promise<void> {
  const tenantId = process.env.DEFAULT_TENANT_ID ?? DEFAULT_TENANT_ID;

  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      name: 'Default Tenant',
    },
  });

  console.log(`Seeded default tenant: ${tenantId}`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
