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
import { CreateProjectDTO } from 'src/project/infrastructure/dtos/project.dto';
import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PROJECT_PORT) private readonly projectRepository: ProjectPort,
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
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

    return project;
  }
}
