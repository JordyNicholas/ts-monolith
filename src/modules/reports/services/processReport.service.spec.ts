import { beforeEach, describe, expect, test } from 'vitest';
import { ResourceNotFoundError } from '@/shared/core/errors/ResourceNotFoundError.js';
import { DEFAULT_TENANT_ID } from '@/shared/infra/env/constants.js';
import { InMemoryReportsRepository } from '../repositories/InMemory/inMemoryReports.repository.js';
import { ProcessReportService } from './processReport.service.js';

let reportsRepository: InMemoryReportsRepository;
let sut: ProcessReportService;

describe('Process Report Service', () => {
  beforeEach(() => {
    reportsRepository = new InMemoryReportsRepository();
    sut = new ProcessReportService(reportsRepository);
  });

  test('Should mark report as completed', async () => {
    const report = await reportsRepository.create({
      title: 'Monthly revenue',
      tenantId: DEFAULT_TENANT_ID,
    });

    const result = await sut.execute({ reportId: report.id });

    expect(result.status).toBe('COMPLETED');
  });

  test('Should throw when report does not exist', async () => {
    await expect(sut.execute({ reportId: 'missing-id' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
