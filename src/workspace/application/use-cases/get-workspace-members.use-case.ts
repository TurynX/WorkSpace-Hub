import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { WorkSpaceMembers } from 'src/workspace/domain/entities/workspace.entity';
import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class GetWorkSpaceMembersUseCase {
  constructor(
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(
    userId: string,
    workSpaceId: string,
  ): Promise<WorkSpaceMembers[]> {
    const workspace =
      await this.workSpaceRepository.findWorkSpaceById(workSpaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');

    const isMember = workspace.members.some((m) => m.userId === userId);

    if (!isMember)
      throw new ForbiddenException('You do not belong to this WorkSpace');

    return workspace.members;
  }
}
