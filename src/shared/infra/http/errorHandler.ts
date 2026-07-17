// src/shared/infra/http/errorHandler.ts
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { AppError } from '../../core/errors/AppError.js';
import { UnauthorizedError } from '../../core/errors/UnauthorizedError.js';
import { ResourceNotFoundError } from '../../core/errors/ResourceNotFoundError.js';
import { Prisma } from '../database/client/client.js';

function isDatabaseUnavailable(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === 'P1001' || error.code === 'P1017';
  }

  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ECONNRESET';
  }

  return false;
}

export function globalErrorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): FastifyReply {
  // 1. Map Infrastructure Validation Errors (Zod)
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.validation.map((err) => ({
        path: err.instancePath,
        message: err.message,
      })),
    });
  }

  // Fastify parser / routing client errors (invalid JSON body, etc.)
  if (
    'statusCode' in error &&
    typeof error.statusCode === 'number' &&
    error.statusCode >= 400 &&
    error.statusCode < 500
  ) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  // 2. Map Specific Domain Errors to HTTP Status Codes
  if (error instanceof ResourceNotFoundError) {
    return reply.status(404).send({
      message: error.message,
    });
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: error.message,
    });
  }

  // 3. Map Generic Domain Errors
  if (error instanceof AppError) {
    return reply.status(400).send({
      message: error.message,
    });
  }

  // 4. Map known Prisma failures to actionable client responses
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return reply.status(400).send({
        message: 'Resource already exists',
      });
    }

    if (error.code === 'P2003') {
      return reply.status(400).send({
        message:
          'Referenced tenant does not exist. Run `npm run db:seed` or use a valid x-tenant-id.',
      });
    }
  }

  if (isDatabaseUnavailable(error)) {
    request.log.error(error);
    return reply.status(503).send({
      message:
        'Database is unavailable. Confirm PostgreSQL is running and DATABASE_URL matches docker-compose (monolith_db).',
    });
  }

  // 5. Fallback for Unhandled/Internal Errors
  // Log the real error internally for observability, but do not leak to the client.
  request.log.error(error);

  return reply.status(500).send({
    message: 'Internal server error',
  });
}
