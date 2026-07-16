import { ResourceNotFoundError } from '@/shared/core/errors/ResourceNotFoundError.js';
import { ReportEntity } from '../domain/report.entity.js';
import { IReportsRepository } from '../repositories/reportsRepository.interface.js';

export interface ProcessReportRequest {
  reportId: string;
}

export class ProcessReportService {
  constructor(private readonly reportsRepository: IReportsRepository) {}

  public async execute({ reportId }: ProcessReportRequest): Promise<ReportEntity> {
    const report = await this.reportsRepository.findById(reportId);

    if (!report) {
      throw new ResourceNotFoundError('Report not found');
    }

    await this.reportsRepository.updateStatus(reportId, 'PROCESSING');

    // Placeholder for real report generation logic.
    await this.reportsRepository.updateStatus(reportId, 'COMPLETED');

    const completed = await this.reportsRepository.findById(reportId);
    if (!completed) {
      throw new ResourceNotFoundError('Report not found after processing');
    }

    return completed;
  }
}
