import { Injectable } from '@nestjs/common';
import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/task-dto';
import { TaskEntity } from 'src/task/domain/entities/task.entity';
import { TaskPort } from 'src/task/domain/ports/task.port';
import { PrismaService } from 'src/lib/prisma/prisma.service';

@Injectable()
export class TaskRepository implements TaskPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateTaskDTO,
    projectId: string,
    userId: string,
  ): Promise<TaskEntity> {
    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate,
        projectId,
        creatorId: userId,
      },
    });

    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      creatorId: task.creatorId,
      projectId: task.projectId!,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      description: task.description!,
      dueDate: task.dueDate!,
      assigneeId: task.assigneeId!,
    };
  }

  async getAll(projectId: string): Promise<TaskEntity[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
      },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      creatorId: task.creatorId,
      projectId: task.projectId!,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      description: task.description!,
      dueDate: task.dueDate!,
      assigneeId: task.assigneeId!,
    }));
  }

  async getById(taskId: string): Promise<TaskEntity | null> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) return null;

    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      creatorId: task.creatorId,
      projectId: task.projectId!,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      description: task.description!,
      dueDate: task.dueDate!,
      assigneeId: task.assigneeId!,
    };
  }

  async update(
    taskId: string,
    data: UpdateTaskDTO,
    userId: string,
  ): Promise<TaskEntity | null> {
    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        assigneeId: userId,
      },
    });
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      creatorId: task.creatorId,
      projectId: task.projectId!,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      description: task.description!,
      dueDate: task.dueDate!,
      assigneeId: task.assigneeId!,
    };
  }

  async delete(taskId: string): Promise<TaskEntity> {
    const task = await this.prisma.task.delete({ where: { id: taskId } });
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      creatorId: task.creatorId,
      projectId: task.projectId!,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      description: task.description!,
      dueDate: task.dueDate!,
      assigneeId: task.assigneeId!,
    };
  }
}
