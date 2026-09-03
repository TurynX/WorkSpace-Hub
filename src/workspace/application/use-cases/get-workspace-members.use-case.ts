import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { WorkSpaceMembers } from 'src/workspace/domain/entities/workspace.entity';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class GetWorkSpaceMembersUseCase {
  constructor(private readonly workSpaceRepository: WorkSpacePort) {}

  async execute(
    workSpaceId: string,
    userId: string,
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
