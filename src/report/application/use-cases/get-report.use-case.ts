import { InjectQueue } from '@nestjs/bullmq';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportPort } from 'src/report/domain/ports/report.port';
import { StoragePort } from 'src/report/domain/ports/storage.port';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class GetReportUseCase {
  constructor(
    private readonly reportRepository: ReportPort,
    private readonly workSpaceRepository: WorkSpacePort,
    private readonly minioStorage: StoragePort,
  ) {}

  async execute(reportId: string, userId: string) {
    const report = await this.reportRepository.findById(reportId);

    if (!report) throw new NotFoundException('Report not found');

    const workspace = await this.workSpaceRepository.findWorkSpaceById(
      report.workspaceId,
    );

    if (!workspace) throw new NotFoundException('Workspace not found');

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Not allowed');

    if (!report.fileKey)
      throw new NotFoundException('Report fileKey not found');

    const url = await this.minioStorage.generatePresignedUrl(report.fileKey);

    return url;
  }
}
