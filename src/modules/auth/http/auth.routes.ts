import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { resolveTenant } from '@/shared/infra/http/middlewares/resolveTenant.js';
import { ensureAuthenticated } from '@/shared/infra/http/middlewares/ensureAuthenticated.js';
import { makeAuthenticateService } from '../factories/makeAuthenticateService.js';
import { makeRefreshTokenService } from '../factories/makeRefreshTokenService.js';
import { makeLogoutService } from '../factories/makeLogoutService.js';
import {
  loginBodySchema,
  loginResponseSchema,
  logoutBodySchema,
  refreshBodySchema,
  refreshResponseSchema,
} from './dtos/login.dto.js';

export async function authRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.post(
    '/login',
    {
      preHandler: resolveTenant,
      schema: {
        tags: ['auth'],
        summary: 'Authenticate and receive access + refresh tokens',
        body: loginBodySchema,
        response: { 200: loginResponseSchema },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      const authenticateService = makeAuthenticateService(request.tenantId);
      const { user, accessToken, refreshToken } = await authenticateService.execute({
        email,
        password,
        tenantId: request.tenantId,
      });

      return reply.status(200).send({
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name },
      });
    },
  );

  typedApp.post(
    '/refresh',
    {
      schema: {
        tags: ['auth'],
        summary: 'Rotate refresh token and issue a new access token',
        body: refreshBodySchema,
        response: { 200: refreshResponseSchema },
      },
    },
    async (request, reply) => {
      const refreshTokenService = makeRefreshTokenService();
      const tokens = await refreshTokenService.execute(request.body);
      return reply.status(200).send(tokens);
    },
  );

  typedApp.post(
    '/logout',
    {
      preHandler: ensureAuthenticated,
      schema: {
        tags: ['auth'],
        summary: 'Revoke the current access token (and optional refresh token)',
        security: [{ bearerAuth: [] }],
        body: logoutBodySchema,
      },
    },
    async (request, reply) => {
      const authHeader = request.headers.authorization ?? '';
      const accessToken = authHeader.slice('Bearer '.length);
      const logoutService = makeLogoutService();
      await logoutService.execute({
        accessToken,
        ...(request.body.refreshToken !== undefined
          ? { refreshToken: request.body.refreshToken }
          : {}),
      });
      return reply.status(204).send();
    },
  );
}
