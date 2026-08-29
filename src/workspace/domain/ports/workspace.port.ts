import { WorkspaceRole } from '@prisma/client';
import {
  WorkSpaceEntity,
  WorkSpaceMemberEntity,
  WorkSpaceWithProjectEntity,
} from '../entities/workspace.entity';

export interface WorkSpacePort {
  create(userId: string, name: string, slug: string): Promise<WorkSpaceEntity>;
  findBySlug(slug: string): Promise<WorkSpaceEntity | null>;
  getWorkSpaceBelongingToUser(
    userId: string,
  ): Promise<WorkSpaceEntity[] | null>;
  findWorkSpaceById(
    workSpaceId: string,
  ): Promise<WorkSpaceWithProjectEntity | null>;

  updateWorkSpace(
    workSpaceId: string,
    name: string,
    slug: string,
  ): Promise<WorkSpaceEntity>;

  deleteWorkSpace(workSpaceId: string): Promise<WorkSpaceEntity>;

  deleteWorkSpaceMember(
    workSpaceId: string,
    memberId: string,
  ): Promise<WorkSpaceMemberEntity>;
  updateWorkSpaceMember(
    workSpaceId: string,
    memberId: string,
    role: WorkspaceRole,
  ): Promise<WorkSpaceMemberEntity>;

  addWorkSpaceMember(
    workSpaceId: string,
    invitedId: string,
  ): Promise<WorkSpaceMemberEntity>;
}

export const WORKSPACE_PORT = 'WORKSPACE_PORT';
