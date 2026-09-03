import { Task } from '@prisma/client';

export class ProjectEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly workspaceId: string,
    public readonly tasks: Task[],
    public readonly description?: string,
  ) {}
}
