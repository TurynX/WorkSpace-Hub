import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionEntity } from 'src/subscription/domain/entities/subscription.entity';
import { SubscriptionPort } from 'src/subscription/domain/ports/subscription.port';
import { WORKSPACE_PORT } from 'src/workspace/domain/ports/workspace.port';
import type { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    private readonly subscriptionPort: SubscriptionPort,
    @Inject(WORKSPACE_PORT) private readonly workspacePort: WorkSpacePort,
  ) {}

  async execute(workspaceId: string): Promise<SubscriptionEntity> {
    const workspace = await this.workspacePort.findWorkSpaceById(workspaceId);

    if (!workspace) throw new NotFoundException('Workspace not found');
    const subscriptionExist =
      await this.subscriptionPort.getSubscriptionByWorkspaceId(workspaceId);

    if (subscriptionExist)
      throw new ConflictException('Subscription already exists');

    const subscription =
      await this.subscriptionPort.createSubscription(workspaceId);

    if (!subscription)
      throw new InternalServerErrorException('Error creating subscription');

    return subscription;
  }
}
