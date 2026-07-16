import { randomUUID } from 'node:crypto';
import { ReportEntity, ReportStatus, CreateReportData } from '../../domain/report.entity.js';
import { IReportsRepository } from '../reportsRepository.interface.js';

export class InMemoryReportsRepository implements IReportsRepository {
  public items: ReportEntity[] = [];

  public async findById(id: string): Promise<ReportEntity | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  public async create(data: CreateReportData): Promise<ReportEntity> {
    const report: ReportEntity = {
      id: randomUUID(),
      tenantId: data.tenantId,
      title: data.title,
      status: data.status ?? 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(report);
    return report;
  }

  public async updateStatus(id: string, status: ReportStatus): Promise<ReportEntity> {
    const report = this.items.find((item) => item.id === id);
    if (!report) {
      throw new Error('Report not found');
    }
    report.status = status;
    report.updatedAt = new Date();
    return report;
  }

  public async list(pagination: { page: number; limit: number }) {
    const start = (pagination.page - 1) * pagination.limit;
    const items = this.items.slice(start, start + pagination.limit);
    return { items, total: this.items.length };
  }
}
