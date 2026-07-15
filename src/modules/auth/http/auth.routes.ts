// src/modules/auth/controllers/auth.routes.ts
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { makeAuthenticateService } from '../factories/make-authenticate-service.js';
import { loginBodySchema, loginResponseSchema } from './dtos/login.dto.js';

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/login',
    {
      schema: {
        body: loginBodySchema,
        response: {
          200: loginResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const authenticateService = makeAuthenticateService();
      const user = await authenticateService.execute({ email, password });

      const token = await reply.jwtSign(
        { role: 'user' },
        { sign: { sub: user.id, expiresIn: '1d' } },
      );

      return reply.status(200).send({
        token,
        user: {
          id: user.id,
          name: user.name,
        },
      });
    },
  );
};
