import {
  PaginationQuery,
  buildPaginatedResult,
  PaginatedResult,
} from '@/shared/core/pagination.js';
import { ReportEntity } from '../domain/report.entity.js';
import { IReportsRepository } from '../repositories/reportsRepository.interface.js';

export class ListReportsService {
  constructor(private readonly reportsRepository: IReportsRepository) {}

  public async execute(pagination: PaginationQuery): Promise<PaginatedResult<ReportEntity>> {
    const { items, total } = await this.reportsRepository.list(pagination);
    return buildPaginatedResult(items, total, pagination);
  }
}
