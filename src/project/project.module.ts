import { Module } from '@nestjs/common';
import { ProjectController } from './infrastructure/controllers/project.controller';
import { ProjectRepository } from './infrastructure/repositories/project.repository';
import { PROJECT_PORT } from './domain/ports/project.port';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { GetAllProjectFromWorkSpaceUseCase } from './application/use-cases/get-all-project-from-workspace.use-case';
import { GetProjectByIdUseCase } from './application/use-cases/get-project-by-id.use-case';
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from './application/use-cases/delete-project.use-case';
import { AuthModule } from 'src/auth/auth.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';

@Module({
  imports: [AuthModule, WorkspaceModule],
  providers: [
    PrismaService,
    CreateProjectUseCase,
    GetAllProjectFromWorkSpaceUseCase,
    GetProjectByIdUseCase,
    UpdateProjectUseCase,
    DeleteProjectUseCase,
    {
      provide: PROJECT_PORT,
      useClass: ProjectRepository,
    },
  ],
  controllers: [ProjectController],

  exports: [PROJECT_PORT],
})
export class ProjectModule {}
