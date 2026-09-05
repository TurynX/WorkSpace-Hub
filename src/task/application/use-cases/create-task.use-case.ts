import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogAction } from '@prisma/client';
import { AuditLogPort } from 'src/audit/domain/ports/auditLog.port';
import { ProjectPort } from 'src/project/domain/ports/project.port';
import { TaskPort } from 'src/task/domain/ports/task.port';
import { CreateTaskDTO } from 'src/task/infrastructure/dtos/task-dto';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskPort,
    private readonly projectRepository: ProjectPort,
    private readonly workSpaceRepository: WorkSpacePort,
    private readonly auditLogPort: AuditLogPort,
  ) {}

  async execute(data: CreateTaskDTO, projectId: string, userId: string) {
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

    if (data.dueDate < new Date()) {
      throw new BadRequestException(
        'Due date must be greater than current date',
      );
    }

    const task = await this.taskRepository.create(data, projectId, userId);
    if (!task) throw new InternalServerErrorException('Error creating task');

    await this.auditLogPort.createAuditLog(
      AuditLogAction.TASK_CREATED,
      userId,
      workspaceId,
    );
    return task;
  }
}
