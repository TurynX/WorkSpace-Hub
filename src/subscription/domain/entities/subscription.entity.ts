import { SubscriptionTier } from '@prisma/client';

export class SubscriptionEntity {
  constructor(
    public readonly id: string,
    public readonly tier: SubscriptionTier,
    public readonly isActive: boolean,
    public readonly currentPeriodEnd: Date | null,
    public readonly workspaceId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly stripeCustomerId: string | null,
    public readonly stripeSubscriptionId: string | null,
  ) {}
}
