import { TaskEntity } from 'src/task/domain/entities/task.entity';
import { TaskPort } from 'src/task/domain/ports/task.port';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectPort } from 'src/project/domain/ports/project.port';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    private readonly taskRepository: TaskPort,
    private readonly projectRepository: ProjectPort,
    private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(
    projectId: string,
    taskId: string,
    userId: string,
  ): Promise<TaskEntity> {
    const project = await this.projectRepository.getProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const workspaceId = project.workspaceId;
    const workspace =
      await this.workSpaceRepository.findWorkSpaceById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isMember = workspace.members.find((m) => m.userId === userId);

    if (!isMember) {
      throw new ForbiddenException(
        'You are not authorized to delete a task in this project',
      );
    }

    if (isMember.role !== 'OWNER' && isMember.role !== 'ADMIN')
      throw new ForbiddenException(
        'You do not have permission to delete a task in this project',
      );

    const task = await this.taskRepository.delete(taskId);
    if (!task) throw new NotFoundException('Task not found');

    return task;
  }
}
