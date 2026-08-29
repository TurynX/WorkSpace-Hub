import { TaskPriority, TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTaskDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  dueDate: Date;
}

export class UpdateTaskDTO {
  @IsString()
  @IsOptional()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  description: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority: TaskPriority;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dueDate: Date;
}
