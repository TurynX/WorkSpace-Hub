import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectEntity } from 'src/project/domain/entities/project.entity';

import {
  PROJECT_PORT,
  type ProjectPort,
} from 'src/project/domain/ports/project.port';
import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject(PROJECT_PORT) private readonly projectRepository: ProjectPort,
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(userId: string, projectId: string): Promise<ProjectEntity> {
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
        'You do not have permission to delete this project',
      );
    }

    const deletedProject = await this.projectRepository.delete(projectId);

    if (!deletedProject)
      throw new InternalServerErrorException('Failed to delete project');

    return deletedProject;
  }
}
