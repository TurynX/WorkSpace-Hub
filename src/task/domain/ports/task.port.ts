import { TaskEntity } from '../entities/task.entity';
import {
  CreateTaskDTO,
  UpdateTaskDTO,
} from 'src/task/infrastructure/dtos/task-dto';

export abstract class TaskPort {
  abstract create(
    data: CreateTaskDTO,
    projectId: string,
    userId: string,
  ): Promise<TaskEntity>;
  abstract getAll(projectId: string): Promise<TaskEntity[]>;
  abstract getById(taskId: string): Promise<TaskEntity | null>;
  abstract update(
    taskId: string,
    data: UpdateTaskDTO,
    userId: string,
  ): Promise<TaskEntity | null>;
  abstract delete(taskId: string): Promise<TaskEntity>;
}
