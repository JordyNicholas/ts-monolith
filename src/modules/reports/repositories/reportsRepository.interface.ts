import { CreateReportData, ReportEntity, ReportStatus } from '../domain/report.entity.js';
import { PaginationQuery } from '@/shared/core/pagination.js';

export interface IReportsRepository {
  findById(id: string): Promise<ReportEntity | null>;
  create(data: CreateReportData): Promise<ReportEntity>;
  updateStatus(id: string, status: ReportStatus): Promise<ReportEntity>;
  list(pagination: PaginationQuery): Promise<{ items: ReportEntity[]; total: number }>;
}
