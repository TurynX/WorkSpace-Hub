import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import path from 'path';
import { ReportPort } from 'src/report/domain/ports/report.port';
import * as fs from 'fs';
import { PdfGeneratorService } from 'src/report/infrastructure/pdf/pdf-generator.service';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';
import { StoragePort } from 'src/report/domain/ports/storage.port';
import { ReportStatus } from '@prisma/client';

@Processor('report-queue')
export class ReportWorker extends WorkerHost {
  constructor(
    private readonly reportRepository: ReportPort,
    private readonly workspaceRepository: WorkSpacePort,
    private readonly pdfGeneratorService: PdfGeneratorService,

    private readonly minioStorage: StoragePort,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'generate-report': {
        const { reportId, workspaceId } = job.data;

        try {
          const templatePath = path.join(
            process.cwd(),
            'dist/src/report/templates/workspace-report.hbs',
          );

          const reportTemplateHtml = fs.readFileSync(templatePath, 'utf-8');

          const workspace =
            await this.workspaceRepository.findWorkSpaceById(workspaceId);

          if (!workspace) {
            throw new Error('Workspace not found');
          }

          const generatedAt = new Date();

          const projectData = workspace.project.map((p) => ({
            name: p.name,
            taskCount: p.tasks.length,
          }));

          const html = this.pdfGeneratorService.compileTemplate(
            reportTemplateHtml,
            {
              workspaceName: workspace?.name,
              generatedAt,
              totalProjects: workspace?.project.length,
              totalMembers: workspace?.members.length,
              projects: projectData,
            },
          );

          const pdfBuffer =
            await this.pdfGeneratorService.generatePdfFromHtml(html);

          const uploadResult = await this.minioStorage.upload(
            `reports/${reportId}.pdf`,
            pdfBuffer,
            pdfBuffer.length,
            'application/pdf',
          );

          await this.reportRepository.update(
            reportId,
            ReportStatus.COMPLETED,
            uploadResult,
          );
        } catch (error) {
          await this.reportRepository.update(reportId, ReportStatus.FAILED);
          throw new Error('Failed to generate report');
        }
      }

      default:
        throw new Error('Invalid job name ' + job.name);
    }
  }
}
