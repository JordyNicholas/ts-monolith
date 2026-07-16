import { getTenantPrisma } from '@/shared/infra/database/prisma.js';
import { PrismaReportsRepository } from '../repositories/prismaReports.repository.js';
import { ListReportsService } from '../services/listReports.service.js';

export function makeListReportsService(tenantId: string): ListReportsService {
  const tenantPrisma = getTenantPrisma(tenantId);
  const reportsRepository = new PrismaReportsRepository(tenantPrisma);
  return new ListReportsService(reportsRepository);
}
