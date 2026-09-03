import {
  Body,
  Controller,
  Post,
  UseGuards,
  Param,
  Req,
  Get,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/application/guards/auth.guard';
import { CreateReportUseCase } from 'src/report/application/use-cases/create-report.use-case';
import { CreateReportDto } from '../dtos/report-dto';
import { GetReportUseCase } from 'src/report/application/use-cases/get-report.use-case';

@Controller()
@UseGuards(AuthGuard)
export class ReportController {
  constructor(
    private readonly createReportUseCase: CreateReportUseCase,
    private readonly getReportUseCase: GetReportUseCase,
  ) {}

  @Post('workspace/:workspaceId/report/create')
  async create(
    @Body() data: CreateReportDto,
    @Param('workspaceId') workspaceId: string,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    const report = await this.createReportUseCase.execute(
      data,
      workspaceId,
      userId,
    );
    return {
      data: report,
    };
  }

  @Get('report/:reportId/download')
  async getReport(@Param('reportId') reportId: string, @Req() req: Request) {
    const userId = req['user'].sub;
    const url = await this.getReportUseCase.execute(reportId, userId);
    return { data: { url } };
  }
}
