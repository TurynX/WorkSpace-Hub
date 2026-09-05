import { Global, Module } from '@nestjs/common';
import { AuditLogPort } from './domain/ports/auditLog.port';
import { AuditLogRepository } from './infrastructure/repository/prisma.repository';
import { AuditController } from './infrastructure/controllers/audit.controller';
import { AuthModule } from 'src/auth/auth.module';
import { GetAllAuditLogsUseCase } from './application/use-cases/get-all-audit-logs.use-case';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Global()
@Module({
  imports: [AuthModule, WorkspaceModule],
  providers: [
    GetAllAuditLogsUseCase,
    { provide: AuditLogPort, useClass: AuditLogRepository },
  ],
  exports: [AuditLogPort],
  controllers: [AuditController],
})
export class AuditModule {}
