import { TaskEntity } from 'src/task/domain/entities/task.entity';
import { type TaskPort, TASK_PORT } from 'src/task/domain/ports/task.port';
import {
  ForbiddenException,
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  PROJECT_PORT,
  type ProjectPort,
} from 'src/project/domain/ports/project.port';
import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class GetTaskByIdUseCase {
  constructor(
    @Inject(TASK_PORT) private readonly taskRepository: TaskPort,
    @Inject(PROJECT_PORT) private readonly projectRepository: ProjectPort,
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(
    projectId: string,
    taskId: string,
    userId: string,
  ): Promise<TaskEntity | null> {
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
    const task = await this.taskRepository.getById(taskId);

    if (!task) throw new NotFoundException('Task not found');

    return task;
  }
}
