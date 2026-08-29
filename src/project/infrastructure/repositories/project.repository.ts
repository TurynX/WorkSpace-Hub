import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { ProjectEntity } from 'src/project/domain/entities/project.entity';
import { ProjectPort } from 'src/project/domain/ports/project.port';
import {
  CreateProjectDTO,
  UpdateProjectDTO,
} from 'src/project/infrastructure/dtos/project.dto';

@Injectable()
export class ProjectRepository implements ProjectPort {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    data: CreateProjectDTO,
    workspaceId: string,
  ): Promise<ProjectEntity> {
    const project = await this.prisma.project.create({
      data: { ...data, workspaceId },
      include: { tasks: true },
    });

    return new ProjectEntity(
      project.id,
      project.name,
      project.createdAt,
      project.updatedAt,
      project.workspaceId,
      project.tasks,
      project.description!,
    );
  }

  async getProjectFromWorkSpace(workspaceId: string): Promise<ProjectEntity[]> {
    const project = await this.prisma.project.findMany({
      where: { workspaceId },
      include: { tasks: true },
    });

    return project.map(
      (p) =>
        new ProjectEntity(
          p.id,
          p.name,
          p.createdAt,
          p.updatedAt,
          p.workspaceId,
          p.tasks,
          p.description!,
        ),
    );
  }

  async getProjectById(projectId: string): Promise<ProjectEntity | null> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true },
    });

    if (!project) return null;

    return new ProjectEntity(
      project.id,
      project.name,
      project.createdAt,
      project.updatedAt,
      project.workspaceId,
      project.tasks,
      project.description!,
    );
  }

  async update(
    projectId: string,
    data: UpdateProjectDTO,
  ): Promise<ProjectEntity | null> {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: { ...data },
      include: { tasks: true },
    });

    return new ProjectEntity(
      project.id,
      project.name,
      project.createdAt,
      project.updatedAt,
      project.workspaceId,
      project.tasks,
      project.description!,
    );
  }

  async delete(projectId: string): Promise<ProjectEntity> {
    const project = await this.prisma.project.delete({
      where: { id: projectId },
      include: { tasks: true },
    });

    return new ProjectEntity(
      project.id,
      project.name,
      project.createdAt,
      project.updatedAt,
      project.workspaceId,
      project.tasks,
      project.description!,
    );
  }
}
