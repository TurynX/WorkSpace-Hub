import { TaskEntity } from 'src/task/domain/entities/task.entity';
import { type TaskPort, TASK_PORT } from 'src/task/domain/ports/task.port';
import {
  ForbiddenException,
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  PROJECT_PORT,
  type ProjectPort,
} from 'src/project/domain/ports/project.port';
import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';
import { UpdateTaskDTO } from 'src/task/infrastructure/dtos/task-dto';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(TASK_PORT) private readonly taskRepository: TaskPort,
    @Inject(PROJECT_PORT) private readonly projectRepository: ProjectPort,
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(
    projectId: string,
    taskId: string,
    data: UpdateTaskDTO,
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
        'You are not authorized to update a task in this project',
      );
    }

    const oldTask = await this.taskRepository.getById(taskId);
    if (!oldTask) throw new NotFoundException('Task not found');

    if (data.dueDate && data.dueDate < new Date()) {
      throw new BadRequestException(
        'Due date must be greater than current date or old date',
      );
    }

    const task = await this.taskRepository.update(taskId, data, userId);

    if (!task)
      throw new InternalServerErrorException('Error while updating the task');

    return task;
  }
}
