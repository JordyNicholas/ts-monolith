import { FastifyInstance } from 'fastify';
import { httpMetrics } from '../observability/httpMetrics.js';

export async function metricsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/metrics', async () => ({
    service: 'ts-monolith',
    ...httpMetrics.snapshot(),
  }));
}
