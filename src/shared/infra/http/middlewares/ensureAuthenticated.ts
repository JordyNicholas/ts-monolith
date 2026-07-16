import { FastifyReply, FastifyRequest } from 'fastify';
import { UnauthorizedError } from '@/shared/core/errors/UnauthorizedError.js';
import { JwtTokenProvider } from '@/shared/providers/token/JwtTokenProvider.js';
import { getTokenRevocationStore } from '@/shared/providers/token/getTokenRevocationStore.js';

const tokenProvider = new JwtTokenProvider(getTokenRevocationStore());

export async function ensureAuthenticated(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('JWT token is missing');
  }

  const token = authHeader.slice('Bearer '.length);
  const payload = await tokenProvider.verifyAccess(token);

  request.user = {
    id: payload.sub,
    tenantId: payload.tenantId,
    ...(payload.role !== undefined ? { role: payload.role } : {}),
  };
  request.tenantId = payload.tenantId;
  request.log = request.log.child({
    userId: payload.sub,
    tenantId: payload.tenantId,
  });
}
