import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectEntity } from 'src/project/domain/entities/project.entity';
import { ProjectPort } from 'src/project/domain/ports/project.port';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class GetProjectByIdUseCase {
  constructor(
    private readonly projectRepository: ProjectPort,
    private readonly workSpaceRepository: WorkSpacePort,
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

    return project;
  }
}
