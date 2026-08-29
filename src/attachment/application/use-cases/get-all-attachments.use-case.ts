import { AttachmentPort } from 'src/attachment/domain/ports/attachment.port';
import { AttachmentEntity } from 'src/attachment/domain/entities/attachment.entity';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TASK_PORT, type TaskPort } from 'src/task/domain/ports/task.port';
import {
  PROJECT_PORT,
  type ProjectPort,
} from 'src/project/domain/ports/project.port';
import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class GetAllAttachmentsUseCase {
  constructor(
    private readonly attachmentPort: AttachmentPort,
    @Inject(TASK_PORT) private readonly taskRepository: TaskPort,
    @Inject(PROJECT_PORT) private readonly projectRepository: ProjectPort,
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(
    taskId: string,
    userId: string,
  ): Promise<AttachmentEntity[] | null> {
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
        'You are not authorized to get attachments in this project',
      );
    }
    const attachment = await this.attachmentPort.getAll(taskId);

    if (!attachment) throw new NotFoundException('No attachments found');

    return attachment;
  }
}
