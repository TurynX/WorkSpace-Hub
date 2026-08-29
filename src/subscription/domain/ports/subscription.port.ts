import { UpdateSubscriptionDto } from 'src/subscription/infrastructure/dtos/subscription-dto';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { SubscriptionTier } from '@prisma/client';

export abstract class SubscriptionPort {
  abstract createSubscription(workspaceId: string): Promise<SubscriptionEntity>;

  abstract getSubscriptionByWorkspaceId(
    workspaceId: string,
  ): Promise<SubscriptionEntity | null>;

  abstract getSubscriptionById(
    subscriptionId: string,
  ): Promise<SubscriptionEntity | null>;

  abstract updateSubscription(
    subscriptionId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    tier: SubscriptionTier,
    currentPeriodEnd: Date,
  ): Promise<SubscriptionEntity>;
}
