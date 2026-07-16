import { ResourceNotFoundError } from "@/shared/core/errors/ResourceNotFoundError.js";
import { IReportsRepository } from "../repositories/reportsRepository.interface.js";

export interface ProcessReportRequest {
  reportId: string;
}

export class ProcessReportService {
  constructor(private readonly reportsRepository: IReportsRepository) {}

  public async execute({ reportId }: ProcessReportRequest): Promise<void> {
    const report = await this.reportsRepository.findById(reportId);

    if (!report) {
      throw new ResourceNotFoundError('Report not found');
    }

    console.log(`Processing report ${report.id}...`);
  }
}