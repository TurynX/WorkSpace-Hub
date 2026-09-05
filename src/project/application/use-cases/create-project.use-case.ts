import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogAction } from '@prisma/client';
import { AuditLogPort } from 'src/audit/domain/ports/auditLog.port';
import { ProjectEntity } from 'src/project/domain/entities/project.entity';
import { ProjectPort } from 'src/project/domain/ports/project.port';
import { CreateProjectDTO } from 'src/project/infrastructure/dtos/project.dto';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectPort,
    private readonly workSpaceRepository: WorkSpacePort,
    private readonly auditLogPort: AuditLogPort,
  ) {}

  async execute(
    data: CreateProjectDTO,
    workspaceId: string,
    userId: string,
  ): Promise<ProjectEntity> {
    const workspace =
      await this.workSpaceRepository.findWorkSpaceById(workspaceId);

    if (!workspace) throw new NotFoundException('Workspace not found');

    const IsMember = workspace.members.find((m) => m.userId === userId);

    if (!IsMember)
      throw new ForbiddenException('You do not belong to this workspace');

    if (IsMember.role !== 'ADMIN' && IsMember.role !== 'OWNER') {
      throw new ForbiddenException(
        'You do not have permission to create a project',
      );
    }

    const project = await this.projectRepository.create(data, workspaceId);
    if (!project)
      throw new InternalServerErrorException('Error creating project');

    await this.auditLogPort.createAuditLog(
      AuditLogAction.PROJECT_CREATED,
      userId,
      workspaceId,
    );

    return project;
  }
}
