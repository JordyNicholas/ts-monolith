import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ensureAuthenticated } from '@/shared/infra/http/middlewares/ensureAuthenticated.js';
import { makeCreateReportService } from '../factories/makeCreateReportService.js';
import { createReportBodySchema, createReportResponseSchema } from './dtos/createReport.dto.js';
import { processNextReportJob } from '../queue/dispatchReportJob.js';
import { inMemoryJobQueue } from '@/shared/infra/queue/inMemoryJobQueue.js';

export async function reportsRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.post(
    '/',
    {
      preHandler: ensureAuthenticated,
      schema: {
        tags: ['reports'],
        summary: 'Create a report and enqueue processing',
        body: createReportBodySchema,
        response: {
          201: createReportResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { title } = request.body;
      const tenantId = request.user.tenantId;

      const createReportService = makeCreateReportService(tenantId);
      const report = await createReportService.execute({ title, tenantId });

      // Same-process demo: drain one job so status advances without a separate worker.
      setImmediate(() => {
        void processNextReportJob(inMemoryJobQueue).catch((error: unknown) => {
          request.log.error({ err: error }, 'Failed to process report job in-process');
        });
      });

      return reply.status(201).send({
        id: report.id,
        title: report.title,
        status: report.status,
        tenantId: report.tenantId,
      });
    },
  );
}
