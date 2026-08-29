import {
  ForbiddenException,
  Inject,
  Injectable,
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
export class GetAllProjectFromWorkSpaceUseCase {
  constructor(
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
    @Inject(PROJECT_PORT) private readonly projectRepository: ProjectPort,
  ) {}

  async execute(workspaceId: string, userId: string): Promise<ProjectEntity[]> {
    const workspace =
      await this.workSpaceRepository.findWorkSpaceById(workspaceId);

    if (!workspace) throw new NotFoundException('Workspace not found');

    const IsMember = workspace.members.find((m) => m.userId === userId);

    if (!IsMember)
      throw new ForbiddenException('You do not belong to this workspace');

    const projects =
      await this.projectRepository.getProjectFromWorkSpace(workspaceId);

    return projects;
  }
}
