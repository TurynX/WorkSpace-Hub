import { CreateReportDto } from 'src/report/infrastructure/dtos/report-dto';
import { ReportEntity } from '../entities/report.entity';
import { ReportStatus } from '@prisma/client';

export abstract class ReportPort {
  abstract create(
    data: CreateReportDto,
    workspaceId: string,
  ): Promise<ReportEntity>;
  abstract update(
    reportId: string,
    status: ReportStatus,
    fileKey?: string,
  ): Promise<ReportEntity>;
  abstract findById(reportId: string): Promise<ReportEntity | null>;
}
