import { FastifyReply, FastifyRequest } from 'fastify';
import { ResourceNotFoundError } from '@/shared/core/errors/ResourceNotFoundError.js';
import { prisma } from '@/shared/infra/database/prisma.js';
import { env } from '@/shared/infra/env/index.js';

const TENANT_HEADER = 'x-tenant-id';

/**
 * Resolves the active tenant for public routes (register/login/create report).
 * Prefer an explicit header; fall back to the seeded default tenant for local demos.
 */
export async function resolveTenant(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const headerValue = request.headers[TENANT_HEADER];
  const tenantId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  request.tenantId =
    typeof tenantId === 'string' && tenantId.length > 0 ? tenantId : env.DEFAULT_TENANT_ID;

  const tenant = await prisma.tenant.findUnique({
    where: { id: request.tenantId },
    select: { id: true, isActive: true },
  });

  if (!tenant || !tenant.isActive) {
    throw new ResourceNotFoundError(
      `Tenant not found (${request.tenantId}). Run \`npm run db:seed\` or provide a valid x-tenant-id.`,
    );
  }

  request.log = request.log.child({ tenantId: request.tenantId });
}
