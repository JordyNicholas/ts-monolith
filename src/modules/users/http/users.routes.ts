import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ensureAuthenticated } from '@/shared/infra/http/middlewares/ensureAuthenticated.js';
import { resolveTenant } from '@/shared/infra/http/middlewares/resolveTenant.js';
import { makeGetUserProfileService } from '../factories/makeGetUserProfileService.js';
import { makeRegisterUserService } from '../factories/makeRegisterUserService.js';
import { profileResponseSchema } from './dtos/profile.dto.js';
import { registerBodySchema, registerResponseSchema } from './dtos/register.dto.js';

export async function usersRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.post(
    '/',
    {
      preHandler: resolveTenant,
      schema: {
        tags: ['users'],
        summary: 'Register a new user',
        body: registerBodySchema,
        response: {
          201: registerResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, name, password } = request.body;

      const registerUserService = makeRegisterUserService(request.tenantId);
      const user = await registerUserService.execute({ email, name, password });

      return reply.status(201).send({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    },
  );

  typedApp.get(
    '/me',
    {
      preHandler: ensureAuthenticated,
      schema: {
        tags: ['users'],
        summary: 'Get the authenticated user profile',
        response: {
          200: profileResponseSchema,
        },
      },
    },
    async (request) => {
      const getUserProfileService = makeGetUserProfileService(request.user.tenantId);
      const user = await getUserProfileService.execute({
        userId: request.user.id,
        tenantId: request.user.tenantId,
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
      };
    },
  );
}
