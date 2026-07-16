import { makeProcessReportService } from '../factories/makeProcessReportsService.js';
import { JobEnvelope } from '@/shared/infra/queue/jobEnvelope.schema.js';
import { IJobQueue } from '@/shared/infra/queue/jobQueue.interface.js';

export async function processNextReportJob(queue: IJobQueue): Promise<boolean> {
  const job = await queue.dequeue();
  if (!job) {
    return false;
  }

  await dispatchReportJob(job);
  return true;
}

export async function dispatchReportJob(job: JobEnvelope): Promise<void> {
  if (job.jobName !== 'process-report') {
    throw new Error(`Unsupported job: ${job.jobName}`);
  }

  const reportId = job.payload.reportId;
  if (typeof reportId !== 'string') {
    throw new Error('Job payload.reportId must be a string');
  }

  const processReportService = makeProcessReportService(job.tenantId);
  await processReportService.execute({ reportId });
}
