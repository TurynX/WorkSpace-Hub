import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { SubscriptionEntity } from 'src/subscription/domain/entities/subscription.entity';
import { SubscriptionPort } from 'src/subscription/domain/ports/subscription.port';
import { Subscription, SubscriptionTier } from '@prisma/client';

@Injectable()
export class SubscriptionRepository implements SubscriptionPort {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(subscription: Subscription): SubscriptionEntity {
    return new SubscriptionEntity(
      subscription.id,
      subscription.tier,
      subscription.isActive,
      subscription.currentPeriodEnd,
      subscription.workspaceId,
      subscription.createdAt,
      subscription.updatedAt,
      subscription.stripeCustomerId,
      subscription.stripeSubscriptionId,
    );
  }

  async createSubscription(workspaceId: string): Promise<SubscriptionEntity> {
    const subscription = await this.prisma.subscription.create({
      data: {
        workspaceId,
      },
    });
    return this.mapToEntity(subscription);
  }

  async getSubscriptionByWorkspaceId(
    workspaceId: string,
  ): Promise<SubscriptionEntity | null> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        workspaceId,
      },
    });

    if (!subscription) return null;

    return this.mapToEntity(subscription);
  }

  async getSubscriptionById(
    subscriptionId: string,
  ): Promise<SubscriptionEntity | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        id: subscriptionId,
      },
    });

    if (!subscription) return null;

    return this.mapToEntity(subscription);
  }

  async updateSubscription(
    subscriptionId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    tier: SubscriptionTier,
    currentPeriodEnd: Date,
  ): Promise<SubscriptionEntity> {
    const subscription = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        tier,
        currentPeriodEnd,
        stripeCustomerId,
        stripeSubscriptionId,
      },
    });
    return this.mapToEntity(subscription);
  }
}
