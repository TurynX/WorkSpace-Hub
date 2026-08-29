import { TaskPriority, TaskStatus } from '@prisma/client';

export interface TaskEntity {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  assigneeId?: string;
  creatorId: string;
}
