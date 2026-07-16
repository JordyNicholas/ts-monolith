import { FastifyReply, FastifyRequest } from 'fastify';
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

  request.log = request.log.child({ tenantId: request.tenantId });
}
