import { TenantPrismaClient } from "@/shared/infra/database/prisma.js";
import { IReportsRepository } from "./reportsRepository.interface.js";
import { Report } from "@/shared/infra/database/client/client.js";
export class PrismaReportsRepository implements IReportsRepository {
  constructor(private readonly prisma: TenantPrismaClient) {}

  public async findById (id: string): Promise<Report | null> {
    // The extension secretly injects "AND tenantId = '...'" into this query.
    // We use findFirst to avoid TS errors regarding incomplete compound unique inputs.
    const report: Report | null = await this.prisma.report.findFirst({
      where: { id },
    });

    return report;
  }
}