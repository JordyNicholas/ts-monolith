export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ReportEntity {
  id: string;
  tenantId: string;
  title: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportData {
  tenantId: string;
  title: string;
  status?: ReportStatus;
}
