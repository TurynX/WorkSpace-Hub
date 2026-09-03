import { Module } from '@nestjs/common';
import { TaskController } from './infrastructure/controllers/task.controller';
import { TaskPort } from './domain/ports/task.port';
import { TaskRepository } from './infrastructure/repository/prisma.repository';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { ProjectPort } from 'src/project/domain/ports/project.port';
import { ProjectRepository } from 'src/project/infrastructure/repositories/project.repository';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';
import { WorkSpaceRepository } from 'src/workspace/infrastructure/repository/prisma.repository';
import { AuthModule } from 'src/auth/auth.module';
import { ProjectModule } from 'src/project/project.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { GetAllTaskUseCase } from './application/use-cases/get-all-task.use-case';
import { GetTaskByIdUseCase } from './application/use-cases/get-task-by-id.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';

@Module({
  imports: [AuthModule, ProjectModule, WorkspaceModule],
  controllers: [TaskController],
  providers: [
    { provide: TaskPort, useClass: TaskRepository },
    { provide: ProjectPort, useClass: ProjectRepository },
    { provide: WorkSpacePort, useClass: WorkSpaceRepository },
    CreateTaskUseCase,
    GetAllTaskUseCase,
    GetTaskByIdUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
  ],
  exports: [TaskPort],
})
export class TaskModule {}
