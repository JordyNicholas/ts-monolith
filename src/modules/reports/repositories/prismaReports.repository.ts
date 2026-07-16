import { TenantPrismaClient } from "@/shared/infra/database/prisma.js";

export class PrismaReportsRepository implements IReportsRepository {
  constructor (private readonly prisma: TenantPrismaClient) {}

  public async findById (id: string): Promise<Report | null> {
    const report: Report | null = await this.prisma.report.findFirst({
      where: { id }
    })

    return report
}
