import { jobEnvelopeSchema } from '@/shared/infra/queue/jobEnvelope.schema.js';
import { makeProcessReportService } from '../factories/makeProcessReportsService.js';

export async function processReportConsumer(rawJsonPayload: string): Promise<void> {
  const parsedData: unknown = JSON.parse(rawJsonPayload);
  const envelope = jobEnvelopeSchema.parse(parsedData);

  const { tenantId, payload } = envelope;
  const reportId = payload.reportId;

  if (typeof reportId !== 'string') {
    throw new Error('Job payload.reportId must be a string');
  }

  const processReportService = makeProcessReportService(tenantId);

  try {
    await processReportService.execute({ reportId });
  } catch (error: unknown) {
    console.error(`[Queue: Reports] Job failed for tenant ${tenantId}`, error);
    throw error;
  }
}
