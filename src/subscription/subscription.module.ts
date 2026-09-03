import { forwardRef, Module } from '@nestjs/common';
import { SubscriptionController } from './infrastructure/controllers/subscription.controller';
import { AuthModule } from 'src/auth/auth.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { CreateSubscriptionUseCase } from './application/use-cases/create-subscription.use-case';
import { GetSubscriptionUseCase } from './application/use-cases/get-subscription.use-case';
import { ProcessWebhookUseCase } from './application/use-cases/process-webhook.use-case';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';
import { WorkSpaceRepository } from 'src/workspace/infrastructure/repository/prisma.repository';
import { CreateCheckoutUseCase } from './application/use-cases/create-checkout.use-case';
import { SubscriptionPort } from './domain/ports/subscription.port';
import { SubscriptionRepository } from './infrastructure/repository/prisma.repository';

@Module({
  imports: [AuthModule, forwardRef(() => WorkspaceModule)],

  controllers: [SubscriptionController],
  providers: [
    CreateSubscriptionUseCase,
    CreateCheckoutUseCase,
    GetSubscriptionUseCase,
    ProcessWebhookUseCase,

    { provide: SubscriptionPort, useClass: SubscriptionRepository },
    { provide: WorkSpacePort, useClass: WorkSpaceRepository },
  ],

  exports: [CreateSubscriptionUseCase],
})
export class SubscriptionModule {}
