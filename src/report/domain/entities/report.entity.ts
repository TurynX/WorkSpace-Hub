import { ReportStatus, ReportType } from '@prisma/client';

export class ReportEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: ReportType,
    public readonly status: ReportStatus,
    public readonly fileKey: string | null,
    public readonly createdAt: Date,
    public readonly workspaceId: string,
  ) {}
}
