import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogAction } from '@prisma/client';
import { AuditLogPort } from 'src/audit/domain/ports/auditLog.port';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class DeleteWorkSpaceUseCase {
  constructor(
    private readonly workSpaceRepository: WorkSpacePort,
    private readonly auditLogPort: AuditLogPort,
  ) {}

  async execute(workSpaceId: string, userId: string) {
    const workSpace =
      await this.workSpaceRepository.findWorkSpaceById(workSpaceId);

    if (!workSpace) throw new NotFoundException('WorkSpace does not exists');

    const user = workSpace.members.find((m) => m.userId === userId);

    if (!user)
      throw new ForbiddenException('You do not belong to this WorkSpace');

    if (user.role !== 'OWNER')
      throw new ForbiddenException(
        'You do not have permission to delete this WorkSpace',
      );

    await this.auditLogPort.createAuditLog(
      AuditLogAction.WORKSPACE_DELETED,
      userId,
      workSpaceId,
    );
    const deleted = await this.workSpaceRepository.deleteWorkSpace(workSpaceId);

    return deleted;
  }
}
