import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

export const landingRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        response: {
          200: z.object({
            app: z.string(),
            status: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
    async (_, reply) => {
      return reply.status(200).send({
        app: 'TS Modular Monolith API',
        status: 'Operational',
        timestamp: new Date().toISOString(),
      });
    }
  );
};