// src/shared/server.ts
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { landingRoutes } from '../modules/public/controllers/landing.routes.js';
import { authRoutes } from '../modules/auth/controllers/auth.routes.js';

export const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

// Type Provider compilers
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// JWT Plugin
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'super-secret-key-replace-in-production',
});

// Register Modules
app.register(landingRoutes);
app.register(authRoutes, { prefix: '/auth' });