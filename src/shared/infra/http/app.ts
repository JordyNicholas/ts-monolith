import { randomUUID } from 'node:crypto';
import Fastify, { FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { globalErrorHandler } from './errorHandler.js';
import { healthRoutes } from './health.routes.js';
import { metricsRoutes } from './metrics.routes.js';
import { requestContextHook } from './hooks/requestContext.js';
import { authRoutes } from '../../../modules/auth/http/auth.routes.js';
import { usersRoutes } from '../../../modules/users/http/users.routes.js';
import { reportsRoutes } from '../../../modules/reports/http/reports.routes.js';
import { prisma } from '../database/prisma.js';
import { env } from '../env/index.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      redact: ['req.headers.authorization'],
    },
    genReqId: () => randomUUID(),
    requestIdHeader: 'x-request-id',
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(globalErrorHandler);

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'TS Monolith API',
        description: 'Modular monolith boilerplate API',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  if (env.NODE_ENV !== 'test') {
    await app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
    });
  }

  app.addHook('onRequest', requestContextHook);

  await app.register(healthRoutes);
  await app.register(metricsRoutes);
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(usersRoutes, { prefix: '/users' });
  await app.register(reportsRoutes, { prefix: '/reports' });

  app.addHook('onClose', async (instance: FastifyInstance) => {
    instance.log.info('Disconnecting Prisma from the PostgreSQL database...');
    await prisma.$disconnect();
  });

  return app;
}
