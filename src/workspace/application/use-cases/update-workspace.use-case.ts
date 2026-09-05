import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';
import { AuditLogAction } from '@prisma/client';
import { AuditLogPort } from 'src/audit/domain/ports/auditLog.port';
import { UpdateWorkSpaceDto } from 'src/workspace/infrastructure/dtos/workspace-dto';

@Injectable()
export class UpdateWorkSpaceUseCase {
  constructor(
    private readonly workSpaceRepository: WorkSpacePort,
    private readonly auditLogPort: AuditLogPort,
  ) {}

  async execute(workSpaceId: string, userId: string, dto: UpdateWorkSpaceDto) {
    const workSpaceExist =
      await this.workSpaceRepository.findWorkSpaceById(workSpaceId);

    if (!workSpaceExist)
      throw new NotFoundException('WorkSpace does not exists');

    const user = workSpaceExist.members.find((m) => m.userId === userId);

    if (!user)
      throw new ForbiddenException('You do not belong to this WorkSpace');

    if (user.role !== 'OWNER' && user.role !== 'ADMIN')
      throw new ForbiddenException(
        'You do not have permission to update this WorkSpace',
      );

    const workSpace = await this.workSpaceRepository.updateWorkSpace(
      workSpaceId,
      dto.name!,
      dto.slug!,
    );

    await this.auditLogPort.createAuditLog(
      AuditLogAction.WORKSPACE_UPDATED,
      userId,
      workSpaceId,
    );
    return workSpace;
  }
}
