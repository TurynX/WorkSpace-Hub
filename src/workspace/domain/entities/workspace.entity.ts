import { WorkspaceRole } from '@prisma/client';

export interface WorkSpaceMembers {
  userId: string;
  role: WorkspaceRole;
}

export class WorkSpaceEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly members: Array<WorkSpaceMembers>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

class TaskEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
  ) {}
}

export class ProjectEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly tasks: Array<TaskEntity>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly description: string | null,
  ) {}
}

export class WorkSpaceWithProjectEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly members: Array<WorkSpaceMembers>,
    public readonly project: Array<ProjectEntity>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export class WorkSpaceMemberEntity {
  constructor(
    public readonly id: string,
    public readonly role: string,
    public readonly joinedAt: Date,
    public readonly userId: string,
    public readonly workSpaceId: string,
  ) {}
}
