import { FastifyInstance } from 'fastify';
import { prisma } from '../database/prisma.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
  }));

  app.get('/ready', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
      };
    } catch (error: unknown) {
      app.log.error(error, 'Readiness check failed');

      return reply.status(503).send({
        status: 'not_ready',
        message: 'Database is unavailable',
      });
    }
  });
}
