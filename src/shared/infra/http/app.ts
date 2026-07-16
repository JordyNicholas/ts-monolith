// src/shared/infra/http/app.ts
import Fastify, { FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { globalErrorHandler } from './errorHandler.js';
import { healthRoutes } from './health.routes.js';
import { authRoutes } from '../../../modules/auth/http/auth.routes.js';
import { usersRoutes } from '../../../modules/users/http/users.routes.js';
import { prisma } from '../database/prisma.js';

export const app: FastifyInstance = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

// Set strict Zod compilers
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Register the strict Global Error Handler
app.setErrorHandler(globalErrorHandler);

// Operational endpoints
app.register(healthRoutes);

// Register route plugins
app.register(authRoutes, { prefix: '/auth' });
app.register(usersRoutes, { prefix: '/users' });

// Graceful shutdown hook
app.addHook('onClose', async (instance: FastifyInstance) => {
  instance.log.info('Disconnecting Prisma from the PostgreSQL database...');
  await prisma.$disconnect();
});
