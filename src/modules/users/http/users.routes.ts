import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const usersRoutes: FastifyPluginAsyncZod = async (app: any) => {
  app.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
          },
          required: ['email', 'password'],
        },
        response: {
          200: { type: 'object', properties: { token: { type: 'string' } } },
        },
      },
    },
    async (request: any, reply: any) => {
      const { email, password } = request.body;

      const user = await reply.registerUserService.execute({ email, password });

      return reply.status(200).send({
        token: reply.jwtSign({ role: 'user' }, { sign: { sub: user.id, expiresIn: '1d' } }),
      });
    },
  );
};
