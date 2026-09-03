import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkSpaceEntity } from 'src/workspace/domain/entities/workspace.entity';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class GetWorkSpaceByIdUseCase {
  constructor(
    private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(workspaceId: string): Promise<WorkSpaceEntity> {
    const workspace =
      await this.workSpaceRepository.findWorkSpaceById(workspaceId);

    if (!workspace) throw new NotFoundException('WorkSpace not found');

    return new WorkSpaceEntity(
      workspace.id,
      workspace.slug,
      workspace.name,
      workspace.members,
      workspace.createdAt,
      workspace.updatedAt,
    );
  }
}
