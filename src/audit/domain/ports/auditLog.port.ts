import { AuditLogEntity } from '../entities/auditLog.entity';

export abstract class AuditLogPort {
  abstract createAuditLog(
    action: string,

    userId: string,
    workspaceId: string,
  ): Promise<AuditLogEntity>;
  abstract getAllAuditLogs(workspaceId: string): Promise<AuditLogEntity[]>;
}
