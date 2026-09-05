import { AuditLogAction } from '@prisma/client';

export class AuditLogEntity {
  constructor(
    public readonly id: string,
    public readonly action: AuditLogAction,
    public readonly createdAt: Date,
    public readonly actorId: string,
    public readonly workspaceId: string,
  ) {}
}
