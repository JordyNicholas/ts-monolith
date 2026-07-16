import { CreateReportData, ReportEntity, ReportStatus } from '../domain/report.entity.js';

export interface IReportsRepository {
  findById(id: string): Promise<ReportEntity | null>;
  create(data: CreateReportData): Promise<ReportEntity>;
  updateStatus(id: string, status: ReportStatus): Promise<ReportEntity>;
}
