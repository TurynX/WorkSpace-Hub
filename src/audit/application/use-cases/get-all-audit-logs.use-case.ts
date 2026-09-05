import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogPort } from 'src/audit/domain/ports/auditLog.port';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class GetAllAuditLogsUseCase {
  constructor(
    private readonly auditLogPort: AuditLogPort,
    private readonly workSpacePort: WorkSpacePort,
  ) {}

  async execute(userId: string, workspaceId: string) {
    const workspace = await this.workSpacePort.findWorkSpaceById(workspaceId);

    if (!workspace) throw new NotFoundException('WorkSpace not found');

    const isMember = workspace.members.find((m) => m.userId === userId);

    if (!isMember)
      throw new ForbiddenException(
        'You are not authorized to access this workspace',
      );

    if (!['OWNER', 'ADMIN', 'MEMBER'].includes(isMember.role))
      throw new ForbiddenException(
        'You are not authorized to access this workspace',
      );

    const auditLogs = await this.auditLogPort.getAllAuditLogs(workspaceId);

    if (!auditLogs) throw new NotFoundException('Audit Logs not found');

    return auditLogs;
  }
}
