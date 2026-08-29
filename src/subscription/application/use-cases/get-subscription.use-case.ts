import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionEntity } from 'src/subscription/domain/entities/subscription.entity';

import { SubscriptionPort } from 'src/subscription/domain/ports/subscription.port';
import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class GetSubscriptionUseCase {
  constructor(
    @Inject(SubscriptionPort)
    private readonly subscriptionRepository: SubscriptionPort,
    @Inject(WORKSPACE_PORT)
    private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(
    workspaceId: string,
    userId: string,
  ): Promise<SubscriptionEntity> {
    const workspace =
      await this.workSpaceRepository.findWorkSpaceById(workspaceId);

    if (!workspace) throw new NotFoundException('Workspace not found');

    const isMember = workspace.members.some((m) => m.userId === userId);

    if (!isMember) throw new ForbiddenException('Not allowed');

    const subscription =
      await this.subscriptionRepository.getSubscriptionByWorkspaceId(
        workspaceId,
      );
    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }
}
