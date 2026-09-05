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
export class UpdateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectPort,
    private readonly workSpaceRepository: WorkSpacePort,
    private readonly auditLogPort: AuditLogPort,
  ) {}

  async execute(
    userId: string,
    projectId: string,
    data: CreateProjectDTO,
  ): Promise<ProjectEntity> {
    const project = await this.projectRepository.getProjectById(projectId);

    if (!project) throw new NotFoundException('Project not found');

    const workspace = await this.workSpaceRepository.findWorkSpaceById(
      project.workspaceId,
    );

    if (!workspace) throw new NotFoundException('Workspace not found');

    const IsMember = workspace.members.find((m) => m.userId === userId);

    if (!IsMember)
      throw new ForbiddenException('You do not belong to this workspace');

    if (IsMember.role !== 'ADMIN' && IsMember.role !== 'OWNER') {
      throw new ForbiddenException(
        'You do not have permission to update this project',
      );
    }

    const updatedProject = await this.projectRepository.update(projectId, data);

    if (!updatedProject)
      throw new InternalServerErrorException('Failed to update project');

    await this.auditLogPort.createAuditLog(
      AuditLogAction.PROJECT_UPDATED,
      userId,
      project.workspaceId,
    );

    return updatedProject;
  }
}
