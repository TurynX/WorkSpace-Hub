import { InjectQueue } from '@nestjs/bullmq';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogAction } from '@prisma/client';
import { Queue } from 'bullmq';
import { AuditLogPort } from 'src/audit/domain/ports/auditLog.port';
import { ReportPort } from 'src/report/domain/ports/report.port';
import { CreateReportDto } from 'src/report/infrastructure/dtos/report-dto';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class CreateReportUseCase {
  constructor(
    private readonly reportRepository: ReportPort,
    private readonly workSpaceRepository: WorkSpacePort,
    @InjectQueue('report-queue') private readonly reportQueue: Queue,
    private readonly auditLogPort: AuditLogPort,
  ) {}

  async execute(data: CreateReportDto, workspaceId: string, userId: string) {
    const workspace =
      await this.workSpaceRepository.findWorkSpaceById(workspaceId);

    if (!workspace) throw new NotFoundException('Workspace not found');

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember)
      throw new ForbiddenException('You are not a member of this workspace');

    const report = await this.reportRepository.create(data, workspaceId);

    if (!report)
      throw new InternalServerErrorException('Failed to create report');

    await this.reportQueue.add('generate-report', {
      workspaceName: workspace.name,
      reportId: report.id,
      workspaceId,
      type: data.type,
    });

    await this.auditLogPort.createAuditLog(
      AuditLogAction.REPORT_GENERATED,
      userId,
      workspaceId,
    );

    return report;
  }
}
