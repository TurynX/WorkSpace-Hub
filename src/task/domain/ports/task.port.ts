import { TaskEntity } from '../entities/task.entity';
import {
  CreateTaskDTO,
  UpdateTaskDTO,
} from 'src/task/infrastructure/dtos/task-dto';

export interface TaskPort {
  create(
    data: CreateTaskDTO,
    projectId: string,
    userId: string,
  ): Promise<TaskEntity>;
  getAll(projectId: string): Promise<TaskEntity[]>;
  getById(taskId: string): Promise<TaskEntity | null>;
  update(
    taskId: string,
    data: UpdateTaskDTO,
    userId: string,
  ): Promise<TaskEntity | null>;
  delete(taskId:string)
}

export const TASK_PORT = Symbol('TASK_PORT');
