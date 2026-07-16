import { TenantPrismaClient, getTenantPrisma } from "@/shared/infra/database/prisma.js";
import { PrismaReportsRepository } from "../repositories/prismaReports.repository.js";
import { ProcessReportService } from "../services/processReport.service.js";

export function makeProcessReportService(tenantId: string): ProcessReportService {
  const tenantPrisma: TenantPrismaClient = getTenantPrisma(tenantId);
  const reportsRepository: PrismaReportsRepository = new PrismaReportsRepository(tenantPrisma);
  
  return new ProcessReportService(reportsRepository);
}