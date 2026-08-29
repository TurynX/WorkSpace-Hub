import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateReportDto } from '../dtos/report-dto';
import { ReportEntity } from 'src/report/domain/entities/report.entity';
import { ReportPort } from 'src/report/domain/ports/report.port';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportRepository implements ReportPort {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    data: CreateReportDto,
    workspaceId: string,
  ): Promise<ReportEntity> {
    const report = await this.prismaService.report.create({
      data: {
        title: data.title,
        type: data.type,
        workspaceId,
      },
    });

    return new ReportEntity(
      report.id,
      report.title,
      report.type,
      report.status,
      report.fileKey,
      report.createdAt,
      report.workspaceId,
    );
  }

  async update(
    reportId: string,
    status: ReportStatus,
    fileKey?: string,
  ): Promise<ReportEntity> {
    const report = await this.prismaService.report.update({
      where: {
        id: reportId,
      },
      data: {
        status,
        fileKey,
      },
    });

    return new ReportEntity(
      report.id,
      report.title,
      report.type,
      report.status,
      report.fileKey,
      report.createdAt,
      report.workspaceId,
    );
  }

  async findById(reportId: string): Promise<ReportEntity | null> {
    const report = await this.prismaService.report.findUnique({
      where: {
        id: reportId,
      },
    });

    if (!report) {
      return null;
    }

    return new ReportEntity(
      report.id,
      report.title,
      report.type,
      report.status,
      report.fileKey,
      report.createdAt,
      report.workspaceId,
    );
  }
}
