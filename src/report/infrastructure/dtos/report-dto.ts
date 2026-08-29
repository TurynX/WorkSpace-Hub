import { IsEnum, IsString } from 'class-validator';
import { ReportType } from '@prisma/client';

export class CreateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsString()
  title: string;
}
