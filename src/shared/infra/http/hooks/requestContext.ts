import { FastifyRequest } from 'fastify';
import { httpMetrics } from '../../observability/httpMetrics.js';

export async function requestContextHook(request: FastifyRequest): Promise<void> {
  request.log = request.log.child({
    requestId: request.id,
    ...(request.tenantId ? { tenantId: request.tenantId } : {}),
    ...(request.user?.id ? { userId: request.user.id } : {}),
  });

  httpMetrics.incrementRequests();

  request.raw.on('close', () => {
    if (request.raw.destroyed) {
      httpMetrics.incrementErrors();
    }
  });
}
