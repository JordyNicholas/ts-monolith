import { getTenantPrisma } from '@/shared/infra/database/prisma.js';
import { inMemoryJobQueue } from '@/shared/infra/queue/inMemoryJobQueue.js';
import { PrismaReportsRepository } from '../repositories/prismaReports.repository.js';
import { CreateReportService } from '../services/createReport.service.js';

export function makeCreateReportService(tenantId: string): CreateReportService {
  const tenantPrisma = getTenantPrisma(tenantId);
  const reportsRepository = new PrismaReportsRepository(tenantPrisma);

  return new CreateReportService(reportsRepository, inMemoryJobQueue);
}
