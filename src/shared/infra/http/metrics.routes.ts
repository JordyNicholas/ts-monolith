import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { httpMetrics } from '../observability/httpMetrics.js';
import { env } from '../env/index.js';

const metricsResponseSchema = z.object({
  service: z.string(),
  totalRequests: z.number(),
  totalErrors: z.number(),
  uptimeSeconds: z.number(),
  startedAt: z.string(),
});

export async function metricsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/metrics',
    { schema: { tags: ['system'], response: { 200: metricsResponseSchema } } },
    async () => ({
      service: env.OTEL_SERVICE_NAME,
      ...httpMetrics.snapshot(),
    }),
  );
}
