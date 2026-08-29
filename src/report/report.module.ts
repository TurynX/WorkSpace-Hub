import { Module } from '@nestjs/common';
import { CreateReportUseCase } from './application/use-cases/create-report.use-case';
import { ReportWorker } from './application/worker/report.worker';
import { BullModule } from '@nestjs/bullmq';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { WORKSPACE_PORT } from 'src/workspace/domain/ports/workspace.port';
import { WorkSpaceRepository } from 'src/workspace/infrastructure/repository/prisma.repository';
import { AuthModule } from 'src/auth/auth.module';
import { PdfGeneratorService } from './infrastructure/pdf/pdf-generator.service';
import { MinioStorageService } from './infrastructure/storage/minio.storage.service';
import { StoragePort } from './domain/ports/storage.port';
import { ReportRepository } from './infrastructure/repository/prisma.repository';
import { ReportPort } from './domain/ports/report.port';
import { ReportController } from './infrastructure/controllers/report.controller';
import { GetReportUseCase } from './application/use-cases/get-report.use-case';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'report-queue',
    }),
    AuthModule,
    WorkspaceModule,
  ],
  providers: [
    ReportWorker,
    CreateReportUseCase,
    GetReportUseCase,
    PdfGeneratorService,
    { provide: ReportPort, useClass: ReportRepository },
    { provide: WORKSPACE_PORT, useClass: WorkSpaceRepository },
    { provide: StoragePort, useClass: MinioStorageService },
  ],
  controllers: [ReportController],
})
export class ReportModule {}
