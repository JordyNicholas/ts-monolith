import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../database/prisma.js';

const healthResponseSchema = z.object({ status: z.literal('ok') });
const readyResponseSchema = z.object({
  status: z.enum(['ready', 'not_ready']),
  message: z.string().optional(),
});

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/health',
    { schema: { tags: ['system'], response: { 200: healthResponseSchema } } },
    async () => ({ status: 'ok' as const }),
  );

  app.get(
    '/ready',
    {
      schema: {
        tags: ['system'],
        response: { 200: readyResponseSchema, 503: readyResponseSchema },
      },
    },
    async (_request, reply) => {
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
    },
  );
}
