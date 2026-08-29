import { ForbiddenException, Injectable } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import {
  WorkSpaceEntity,
  WorkSpaceMemberEntity,
  WorkSpaceWithProjectEntity,
} from 'src/workspace/domain/entities/workspace.entity';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class WorkSpaceRepository implements WorkSpacePort {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    name: string,
    slug: string,
  ): Promise<WorkSpaceEntity> {
    const workSpace = await this.prisma.workspace.create({
      data: {
        name,
        slug,
      },
    });

    await this.prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId: workSpace.id,
        role: 'OWNER',
      },
    });

    const members = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId: workSpace.id,
      },
    });
    return new WorkSpaceEntity(
      workSpace.id,
      workSpace.slug,
      workSpace.name,
      members,
      workSpace.createdAt,
      workSpace.updatedAt,
    );
  }

  async findBySlug(slug: string): Promise<WorkSpaceEntity | null> {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        slug,
      },
      include: {
        members: true,
      },
    });

    if (!workspace) return null;
    return new WorkSpaceEntity(
      workspace.id,
      workspace.slug,
      workspace.name,
      workspace.members,
      workspace.createdAt,
      workspace.updatedAt,
    );
  }

  async getWorkSpaceBelongingToUser(
    userId: string,
  ): Promise<WorkSpaceEntity[] | null> {
    const workSpace = await this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: { members: true },
    });

    if (!workSpace) return null;

    return workSpace.map((workSpace) => {
      return new WorkSpaceEntity(
        workSpace.id,
        workSpace.slug,
        workSpace.name,
        workSpace.members,
        workSpace.createdAt,
        workSpace.updatedAt,
      );
    });
  }

  async findWorkSpaceById(
    workspaceId: string,
  ): Promise<WorkSpaceWithProjectEntity | null> {
    const workSpace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        members: true,
        projects: {
          include: {
            tasks: true,
          },
        },
      },
    });
    if (!workSpace) return null;
    return new WorkSpaceWithProjectEntity(
      workSpace.id,
      workSpace.slug,
      workSpace.name,
      workSpace.members,
      workSpace.projects,
      workSpace.createdAt,
      workSpace.updatedAt,
    );
  }

  async updateWorkSpace(
    workSpaceId: string,
    name: string,
    slug: string,
  ): Promise<WorkSpaceEntity> {
    const workSpace = await this.prisma.workspace.update({
      where: { id: workSpaceId },
      data: { name, slug },
      include: {
        members: true,
      },
    });

    return new WorkSpaceEntity(
      workSpace.id,
      workSpace.slug,
      workSpace.name,
      workSpace.members,
      workSpace.createdAt,
      workSpace.updatedAt,
    );
  }

  async deleteWorkSpace(workSpaceId: string): Promise<WorkSpaceEntity> {
    const workSpace = await this.prisma.workspace.delete({
      where: { id: workSpaceId },
      include: { members: true },
    });
    return new WorkSpaceEntity(
      workSpace.id,
      workSpace.slug,
      workSpace.name,
      workSpace.members,
      workSpace.createdAt,
      workSpace.updatedAt,
    );
  }

  async deleteWorkSpaceMember(
    workspaceId: string,
    memberId: string,
  ): Promise<WorkSpaceMemberEntity> {
    const workspaceMember = await this.prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId: memberId, workspaceId } },
    });

    return new WorkSpaceMemberEntity(
      workspaceMember.id,
      workspaceMember.role,
      workspaceMember.joinedAt,
      workspaceMember.userId,
      workspaceMember.workspaceId,
    );
  }

  async updateWorkSpaceMember(
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole,
  ): Promise<WorkSpaceMemberEntity> {
    const workspaceMember = await this.prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId: memberId, workspaceId } },
      data: { role },
    });

    return new WorkSpaceMemberEntity(
      workspaceMember.id,
      workspaceMember.role,
      workspaceMember.joinedAt,
      workspaceMember.userId,
      workspaceMember.workspaceId,
    );
  }

  async addWorkSpaceMember(
    workspaceId: string,
    invitedId: string,
  ): Promise<WorkSpaceMemberEntity> {
    const workspaceMember = await this.prisma.workspaceMember.create({
      data: { workspaceId, userId: invitedId, role: 'GUEST' },
    });
    return new WorkSpaceMemberEntity(
      workspaceMember.id,
      workspaceMember.role,
      workspaceMember.joinedAt,
      workspaceMember.userId,
      workspaceMember.workspaceId,
    );
  }
}
