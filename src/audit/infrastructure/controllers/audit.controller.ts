import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import Request from 'express';
import { GetAllAuditLogsUseCase } from 'src/audit/application/use-cases/get-all-audit-logs.use-case';
import { AuthGuard } from 'src/auth/application/guards/auth.guard';

@Controller('/workspace/:workspaceId')
@UseGuards(AuthGuard)
export class AuditController {
  constructor(
    private readonly getAllAuditLogsUseCase: GetAllAuditLogsUseCase,
  ) {}

  @Get('/audit-logs')
  async getAllAuditLogs(
    @Param('workspaceId') workspaceId: string,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;

    if (!userId) throw new UnauthorizedException('User not found');

    const auditLogs = await this.getAllAuditLogsUseCase.execute(
      userId,
      workspaceId,
    );

    if (!auditLogs)
      throw new InternalServerErrorException('Audit Logs not found');

    return { message: 'Audit Logs found', data: auditLogs };
  }
}
