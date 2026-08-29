import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  PROJECT_PORT,
  type ProjectPort,
} from 'src/project/domain/ports/project.port';
import { TASK_PORT, type TaskPort } from 'src/task/domain/ports/task.port';

import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class GetAllTaskUseCase {
  constructor(
    @Inject(TASK_PORT) private readonly taskRepository: TaskPort,
    @Inject(PROJECT_PORT) private readonly projectRepository: ProjectPort,
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(projectId: string, userId: string) {
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

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException(
        'You are not authorized to create a task in this project',
      );
    }

    const task = await this.taskRepository.getAll(projectId);
    if (!task) throw new NotFoundException('No task found');
    return task;
  }
}
