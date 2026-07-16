import { ReportEntity } from '../domain/report.entity.js';
import { IReportsRepository } from '../repositories/reportsRepository.interface.js';
import { IJobQueue } from '@/shared/infra/queue/jobQueue.interface.js';

export interface CreateReportRequest {
  title: string;
  tenantId: string;
}

export class CreateReportService {
  constructor(
    private readonly reportsRepository: IReportsRepository,
    private readonly jobQueue: IJobQueue,
  ) {}

  public async execute({ title, tenantId }: CreateReportRequest): Promise<ReportEntity> {
    const report = await this.reportsRepository.create({
      title,
      tenantId,
      status: 'PENDING',
    });

    await this.jobQueue.enqueue({
      tenantId,
      jobName: 'process-report',
      payload: { reportId: report.id },
      metadata: {
        retryCount: 0,
        timestamp: new Date().toISOString(),
      },
    });

    return report;
  }
}
