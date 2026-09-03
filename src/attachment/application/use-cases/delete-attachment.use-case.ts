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
import { StoragePort } from 'src/attachment/domain/ports/storage.port';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AttachmentEntity } from 'src/attachment/domain/entities/attachment.entity';

@Injectable()
export class DeleteAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly taskRepository: TaskPort,
    private readonly projectRepository: ProjectPort,
    private readonly workSpaceRepository: WorkSpacePort,
    @InjectQueue('attachment-queue')
    private readonly deleteQueue: Queue,
  ) {}

  async execute(
    attachmentId: string,
    userId: string,
  ): Promise<AttachmentEntity> {
    const attachment = await this.attachmentRepository.getById(attachmentId);
    if (!attachment) throw new NotFoundException('Attachment not found');

    const task = await this.taskRepository.getById(attachment.taskId);
    if (!task) throw new NotFoundException('Task not found');
    const project = await this.projectRepository.getProjectById(task.projectId);
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
        'You are not authorized to delete attachment in this project',
      );
    }

    const deleteAttachment =
      await this.attachmentRepository.deleteAttachment(attachmentId);

    const deleteAttachmentQueue = await this.deleteQueue.add(
      'delete-attachment',
      attachment.fileKey,
    );

    if (!deleteAttachmentQueue)
      throw new InternalServerErrorException('Failed to delete attachment');

    return deleteAttachment;
  }
}
