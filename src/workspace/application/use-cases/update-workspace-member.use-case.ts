import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { WorkSpaceMemberEntity } from 'src/workspace/domain/entities/workspace.entity';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class UpdateWorkSpaceMemberUseCase {
  constructor(
    private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(
    workspaceId: string,
    userId: string,
    memberId: string,
    role: WorkspaceRole,
  ): Promise<WorkSpaceMemberEntity> {
    const workspace =
      await this.workSpaceRepository.findWorkSpaceById(workspaceId);

    if (!workspace) throw new NotFoundException('Workspace not found');

    const isMember = workspace.members.some((m) => m.userId === memberId);

    if (!isMember)
      throw new ForbiddenException(
        'This user is not member of this workspace.',
      );

    const user = workspace.members.find((m) => m.userId === userId);

    if (!user)
      throw new ForbiddenException('You do not belong to this workspace');

    if (user.role !== 'OWNER')
      throw new ForbiddenException(
        'You do not have permission to update member roles',
      );

    const member = await this.workSpaceRepository.updateWorkSpaceMember(
      workspaceId,
      memberId,
      role,
    );

    if (!member)
      throw new InternalServerErrorException('Failed to update member');
    return member;
  }
}
