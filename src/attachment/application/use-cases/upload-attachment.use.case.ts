import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AttachmentRepository } from 'src/attachment/infrastructure/repository/prisma.repository';
import { TaskPort } from 'src/task/domain/ports/task.port';
import { ProjectPort } from 'src/project/domain/ports/project.port';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AttachmentEntity } from 'src/attachment/domain/entities/attachment.entity';

@Injectable()
export class UploadAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly taskRepository: TaskPort,
    private readonly projectRepository: ProjectPort,
    private readonly workSpaceRepository: WorkSpacePort,
    @InjectQueue('attachment-queue') private uploadQueue: Queue,
  ) {}

  async execute(
    taskId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<AttachmentEntity> {
    const task = await this.taskRepository.getById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    const project = await this.projectRepository.getProjectById(
      task?.projectId,
    );
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const workspaceId = project.workspaceId;
    const workspace =
      await this.workSpaceRepository.findWorkSpaceById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException(
        'You are not authorized to upload attachment in this project',
      );
    }

    try {
      const fileKey = `${Date.now()}-${file.originalname}`;
      const upload = await this.uploadQueue.add('upload-attachment', {
        fileKey,
        buffer: file.buffer.toString('base64'),
        size: file.size,
        mimetype: file.mimetype,
      });

      if (!upload) {
        throw new InternalServerErrorException('Upload failed');
      }

      const attachment = await this.attachmentRepository.upload(
        taskId,
        fileKey,
        file.originalname,
        file.mimetype,
        file.size,
      );
      return attachment;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Upload failed');
    }
  }
}
