import { InjectQueue } from '@nestjs/bullmq';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { ReportPort } from 'src/report/domain/ports/report.port';
import { CreateReportDto } from 'src/report/infrastructure/dtos/report-dto';
import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class CreateReportUseCase {
  constructor(
    private readonly reportRepository: ReportPort,
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
    @InjectQueue('report-queue') private readonly reportQueue: Queue,
  ) {}

  async execute(data: CreateReportDto, workspaceId: string, userId: string) {
    const workspace =
      await this.workSpaceRepository.findWorkSpaceById(workspaceId);

    if (!workspace) throw new NotFoundException('Workspace not found');

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember)
      throw new ForbiddenException('You are not a member of this workspace');

    const report = await this.reportRepository.create(data, workspaceId);

    await this.reportQueue.add('generate-report', {
      workspaceName: workspace.name,
      reportId: report.id,
      workspaceId,
      type: data.type,
    });

    return report;
  }
}
