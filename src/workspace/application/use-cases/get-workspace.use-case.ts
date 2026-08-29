import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WorkSpaceEntity } from 'src/workspace/domain/entities/workspace.entity';
import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class GetWorkSpaceBelongingToUserUseCase {
  constructor(
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(userId: string): Promise<WorkSpaceEntity[]> {
    const workspace =
      await this.workSpaceRepository.getWorkSpaceBelongingToUser(userId);
    if (!workspace)
      throw new NotFoundException('You do not belong to any WorkSpace');
    return workspace.map(
      (workspace) =>
        new WorkSpaceEntity(
          workspace.id,
          workspace.slug,
          workspace.name,
          workspace.members,
          workspace.createdAt,
          workspace.updatedAt,
        ),
    );
  }
}
