import { TenantPrismaClient } from '@/shared/infra/database/prisma.js';
import { CreateReportData, ReportEntity, ReportStatus } from '../domain/report.entity.js';
import { IReportsRepository } from './reportsRepository.interface.js';

export class PrismaReportsRepository implements IReportsRepository {
  constructor(private readonly prisma: TenantPrismaClient) {}

  public async findById(id: string): Promise<ReportEntity | null> {
    const report = await this.prisma.report.findFirst({ where: { id } });
    return report ? this.toEntity(report) : null;
  }

  public async create(data: CreateReportData): Promise<ReportEntity> {
    const report = await this.prisma.report.create({
      data: {
        title: data.title,
        tenantId: data.tenantId,
        status: data.status ?? 'PENDING',
      },
    });

    return this.toEntity(report);
  }

  public async updateStatus(id: string, status: ReportStatus): Promise<ReportEntity> {
    const report = await this.prisma.report.updateMany({
      where: { id },
      data: { status },
    });

    if (report.count === 0) {
      throw new Error(`Report ${id} not found for status update`);
    }

    const updated = await this.prisma.report.findFirst({ where: { id } });
    if (!updated) {
      throw new Error(`Report ${id} vanished after status update`);
    }

    return this.toEntity(updated);
  }

  private toEntity(report: {
    id: string;
    tenantId: string;
    title: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): ReportEntity {
    return {
      id: report.id,
      tenantId: report.tenantId,
      title: report.title,
      status: report.status as ReportStatus,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}
