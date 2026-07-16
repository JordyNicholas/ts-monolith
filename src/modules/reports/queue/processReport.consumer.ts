import { jobEnvelopeSchema } from "@/shared/infra/queue/reportsRepository.interface.js";
import { makeProcessReportService } from "../factories/makeProcessReportsService.js";

export async function processReportConsumer(rawJsonPayload: string): Promise<void> {
  const parsedData: unknown = JSON.parse(rawJsonPayload);
  const envelope = jobEnvelopeSchema.parse(parsedData);

  const { tenantId, payload } = envelope;

  const processReportService = makeProcessReportService(tenantId);

  try {
    await processReportService.execute({
      // We safely cast the payload attribute expected by this specific job
      reportId: payload.reportId as string,
    });
  } catch (error: unknown) {
    console.error(`[Queue: Reports] Job failed for tenant ${tenantId}`, error);
    throw error; // Rethrow to trigger the queue's Dead Letter/Retry mechanisms
  }
}