import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AttachmentController } from './infrastructure/controllers/attachment.controller';
import { UploadAttachmentUseCase } from './application/use-cases/upload-attachment.use.case';
import { AuthModule } from 'src/auth/auth.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { TaskModule } from 'src/task/task.module';
import { ProjectModule } from 'src/project/project.module';
import { AttachmentRepository } from './infrastructure/repository/prisma.repository';
import { GetAllAttachmentsUseCase } from './application/use-cases/get-all-attachments.use-case';
import { DownloadAttachmentUseCase } from './application/use-cases/dowload-attachment.use-case';
import { DeleteAttachmentUseCase } from './application/use-cases/delete-attachment.use-case';
import { AttachmentPort } from './domain/ports/attachment.port';
import { MinioStorageService } from './infrastructure/storage/minio.storage.service';
import { StoragePort } from './domain/ports/storage.port';
import { AttachmentWorker } from './application/workers/minio-storage.worker';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'attachment-queue',
    }),
    AuthModule,
    WorkspaceModule,
    ProjectModule,
    TaskModule,
  ],
  providers: [
    AttachmentWorker,
    UploadAttachmentUseCase,
    GetAllAttachmentsUseCase,
    DownloadAttachmentUseCase,
    DeleteAttachmentUseCase,
    AttachmentRepository,
    MinioStorageService,
    { provide: AttachmentPort, useClass: AttachmentRepository },
    {
      provide: StoragePort,

      useClass: MinioStorageService,
    },
  ],
  controllers: [AttachmentController],
})
export class AttachmentModule {}
