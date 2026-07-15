// src/shared/infra/http/app.ts
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

// Import from the newly structured domain paths (Requires .js extension for NodeNext)
import { authRoutes } from '../../../modules/auth/http/auth.routes.js';
import { usersRoutes } from '../../../modules/users/http/users.routes.js';

export const app = Fastify({
  // Disable logging in test environments to keep console clean
  logger: process.env.NODE_ENV !== 'test',
}).withTypeProvider<ZodTypeProvider>();

// Edge Validation: Zod compilers
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Security: JWT Plugin
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'super-secret-key-replace-in-production',
});

// Modular Route Registration
// The old 'landingRoutes' is replaced by 'usersRoutes' for the registration flow
app.register(usersRoutes, { prefix: '/users' });
app.register(authRoutes, { prefix: '/auth' });
