// src/modules/users/http/users.routes.ts
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { makeRegisterUserService } from '../factories/makeRegisterUserService.js';
import { registerBodySchema, registerResponseSchema } from './dtos/register.dto.js';

export async function usersRoutes(app: FastifyInstance) {
  // Bind the Zod Type Provider to this specific route scope
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.post(
    '/',
    {
      schema: {
        body: registerBodySchema,
        response: {
          201: registerResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, name, password } = request.body;

      const registerUserService = makeRegisterUserService();
      const user = await registerUserService.execute({ email, name, password });

      return reply.status(201).send({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    }
  );
}