import { Injectable } from '@nestjs/common';
import { AuditLogAction } from '@prisma/client';
import { AuditLogEntity } from 'src/audit/domain/entities/auditLog.entity';
import { AuditLogPort } from 'src/audit/domain/ports/auditLog.port';
import { PrismaService } from 'src/lib/prisma/prisma.service';

@Injectable()
export class AuditLogRepository implements AuditLogPort {
  constructor(private readonly prisma: PrismaService) {}

  async createAuditLog(
    action: AuditLogAction,
    userId: string,
    workspaceId: string,
  ): Promise<AuditLogEntity> {
    const auditLog = await this.prisma.auditLog.create({
      data: {
        action,
        actorId: userId,
        workspaceId,
      },
    });

    return new AuditLogEntity(
      auditLog.id,
      auditLog.action,
      auditLog.createdAt,
      auditLog.actorId,
      auditLog.workspaceId,
    );
  }

  async getAllAuditLogs(workspaceId: string): Promise<AuditLogEntity[]> {
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        workspaceId,
      },
    });

    return auditLogs.map(
      (auditLog) =>
        new AuditLogEntity(
          auditLog.id,
          auditLog.action,
          auditLog.createdAt,
          auditLog.actorId,
          auditLog.workspaceId,
        ),
    );
  }
}
