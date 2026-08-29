import { forwardRef, Module } from '@nestjs/common';
import { WorkspaceController } from './infrastructure/controllers/workspace/workspace.controller';
import { CreateWorkSpaceUseCase } from './application/use-cases/create-workspace.use-case';
import { WORKSPACE_PORT } from './domain/ports/workspace.port';
import { WorkSpaceRepository } from './infrastructure/repository/prisma.repository';
import { AuthModule } from 'src/auth/auth.module';
import { GetWorkSpaceBelongingToUserUseCase } from './application/use-cases/get-workspace.use-case';
import { GetWorkSpaceByIdUseCase } from './application/use-cases/get-workspace-by-id.use-case';
import { UpdateWorkSpaceUseCase } from './application/use-cases/update-workspace.use-case';
import { DeleteWorkSpaceUseCase } from './application/use-cases/delete-workspace.use-case';
import { GetWorkSpaceMembersUseCase } from './application/use-cases/get-workspace-members.use-case';
import { UpdateWorkSpaceMemberUseCase } from './application/use-cases/update-workspace-member.use-case';
import { AddWorkSpaceMemberUseCase } from './application/use-cases/add-workspace-member.use-case';
import { AUTH_PORT } from 'src/auth/domain/ports/auth.port';
import { AuthRepository } from 'src/auth/infrastructure/repository/prisma.repository';
import { DeleteWorkSpaceMemberUseCase } from './application/use-cases/delete-workspace-member.use-case';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [AuthModule, forwardRef(() => SubscriptionModule)],
  controllers: [WorkspaceController],
  providers: [
    CreateWorkSpaceUseCase,
    GetWorkSpaceBelongingToUserUseCase,
    GetWorkSpaceByIdUseCase,
    UpdateWorkSpaceUseCase,
    DeleteWorkSpaceUseCase,
    GetWorkSpaceMembersUseCase,
    UpdateWorkSpaceMemberUseCase,
    AddWorkSpaceMemberUseCase,
    DeleteWorkSpaceMemberUseCase,
    {
      provide: WORKSPACE_PORT,
      useClass: WorkSpaceRepository,
    },
    {
      provide: AUTH_PORT,
      useClass: AuthRepository,
    },
  ],

  exports: [WORKSPACE_PORT],
})
export class WorkspaceModule {}
