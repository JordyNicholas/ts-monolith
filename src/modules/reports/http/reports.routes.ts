import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { env } from '@/shared/infra/env/index.js';
import { ensureAuthenticated } from '@/shared/infra/http/middlewares/ensureAuthenticated.js';
import { makeCreateReportService } from '../factories/makeCreateReportService.js';
import { makeListReportsService } from '../factories/makeListReportsService.js';
import {
  createReportBodySchema,
  createReportResponseSchema,
  listReportsQuerySchema,
  listReportsResponseSchema,
} from './dtos/createReport.dto.js';
import { processNextReportJob } from '../queue/dispatchReportJob.js';
import { inMemoryJobQueue } from '@/shared/infra/queue/inMemoryJobQueue.js';

export async function reportsRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.get(
    '/',
    {
      preHandler: ensureAuthenticated,
      schema: {
        tags: ['reports'],
        summary: 'List reports (paginated)',
        security: [{ bearerAuth: [] }],
        querystring: listReportsQuerySchema,
        response: { 200: listReportsResponseSchema },
      },
    },
    async (request) => {
      const tenantId = request.user.tenantId;
      const listReportsService = makeListReportsService(tenantId);
      const result = await listReportsService.execute(request.query);

      return {
        data: result.data.map((report) => ({
          id: report.id,
          title: report.title,
          status: report.status,
          tenantId: report.tenantId,
          createdAt: report.createdAt.toISOString(),
        })),
        meta: result.meta,
      };
    },
  );

  typedApp.post(
    '/',
    {
      preHandler: ensureAuthenticated,
      schema: {
        tags: ['reports'],
        summary: 'Create a report and enqueue processing',
        security: [{ bearerAuth: [] }],
        body: createReportBodySchema,
        response: { 201: createReportResponseSchema },
      },
    },
    async (request, reply) => {
      const { title } = request.body;
      const tenantId = request.user.tenantId;

      const createReportService = makeCreateReportService(tenantId);
      const report = await createReportService.execute({ title, tenantId });

      if (env.QUEUE_DRIVER === 'memory') {
        setImmediate(() => {
          void processNextReportJob(inMemoryJobQueue).catch((error: unknown) => {
            request.log.error({ err: error }, 'Failed to process report job in-process');
          });
        });
      }

      return reply.status(201).send({
        id: report.id,
        title: report.title,
        status: report.status,
        tenantId: report.tenantId,
      });
    },
  );
}
