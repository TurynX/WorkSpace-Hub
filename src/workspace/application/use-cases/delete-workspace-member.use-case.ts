import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

import { AuditLogAction } from '@prisma/client';
import { AuditLogPort } from 'src/audit/domain/ports/auditLog.port';

@Injectable()
export class DeleteWorkSpaceMemberUseCase {
  constructor(
    private readonly workSpaceRepository: WorkSpacePort,
    private readonly auditLogPort: AuditLogPort,
  ) {}

  async execute(workspaceId: string, requesterId: string, memberId: string) {
    const workSpace =
      await this.workSpaceRepository.findWorkSpaceById(workspaceId);

    if (!workSpace) throw new NotFoundException('WorkSpace not found');

    const requester = workSpace.members.find((m) => m.userId === requesterId);

    if (!requester) throw new NotFoundException('Requester not found');

    if (requester.role === 'OWNER' || requester.role === 'ADMIN') {
      const memberToRemove = workSpace.members.find(
        (m) => m.userId === memberId,
      );

      if (!memberToRemove) throw new NotFoundException('Member not found');

      if (memberToRemove.userId === requesterId)
        throw new BadRequestException('You cannot delete yourself');

      if (memberToRemove.role === 'OWNER' || memberToRemove.role === 'ADMIN')
        throw new ForbiddenException('You cannot delete this member');

      await this.auditLogPort.createAuditLog(
        AuditLogAction.MEMBER_REMOVED,
        requesterId,
        workspaceId,
      );
      const deleted = await this.workSpaceRepository.deleteWorkSpaceMember(
        workspaceId,
        memberId,
      );

      return deleted;
    }

    throw new ForbiddenException('You cannot do this');
  }
}
