import { WorkspaceRole } from '@prisma/client';
import {
  WorkSpaceEntity,
  WorkSpaceMemberEntity,
  WorkSpaceWithProjectEntity,
} from '../entities/workspace.entity';

export abstract class WorkSpacePort {
  abstract create(
    userId: string,
    name: string,
    slug: string,
  ): Promise<WorkSpaceEntity>;
  abstract findBySlug(slug: string): Promise<WorkSpaceEntity | null>;
  abstract getWorkSpaceBelongingToUser(
    userId: string,
  ): Promise<WorkSpaceEntity[] | null>;
  abstract findWorkSpaceById(
    workSpaceId: string,
  ): Promise<WorkSpaceWithProjectEntity | null>;

  abstract updateWorkSpace(
    workSpaceId: string,
    name: string,
    slug: string,
  ): Promise<WorkSpaceEntity>;

  abstract deleteWorkSpace(workSpaceId: string): Promise<WorkSpaceEntity>;

  abstract deleteWorkSpaceMember(
    workSpaceId: string,
    memberId: string,
  ): Promise<WorkSpaceMemberEntity>;
  abstract updateWorkSpaceMember(
    workSpaceId: string,
    memberId: string,
    role: WorkspaceRole,
  ): Promise<WorkSpaceMemberEntity>;

  abstract addWorkSpaceMember(
    workSpaceId: string,
    invitedId: string,
  ): Promise<WorkSpaceMemberEntity>;
}
