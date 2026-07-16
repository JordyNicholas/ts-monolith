// src/shared/infra/http/errorHandler.ts
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { AppError } from '../../core/errors/AppError.js';
import { UnauthorizedError } from '../../core/errors/UnauthorizedError.js';
import { ResourceNotFoundError } from '../../core/errors/ResourceNotFoundError.js';

export function globalErrorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
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

  // 4. Fallback for Unhandled/Internal Errors
  // Log the real error internally for observability, but do not leak to the client.
  request.log.error(error);

  return reply.status(500).send({
    message: 'Internal server error',
  });
}