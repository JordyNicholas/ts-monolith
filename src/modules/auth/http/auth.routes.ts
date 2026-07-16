import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { resolveTenant } from '@/shared/infra/http/middlewares/resolveTenant.js';
import { makeAuthenticateService } from '../factories/makeAuthenticateService.js';
import { loginBodySchema, loginResponseSchema } from './dtos/login.dto.js';

export async function authRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.post(
    '/login',
    {
      preHandler: resolveTenant,
      schema: {
        tags: ['auth'],
        summary: 'Authenticate and receive a JWT',
        body: loginBodySchema,
        response: {
          200: loginResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const authenticateService = makeAuthenticateService(request.tenantId);
      const { user, token } = await authenticateService.execute({
        email,
        password,
        tenantId: request.tenantId,
      });

      return reply.status(200).send({
        token,
        user: {
          id: user.id,
          name: user.name,
        },
      });
    },
  );
}
