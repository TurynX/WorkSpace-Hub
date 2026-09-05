import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuditLogAction, SubscriptionTier } from '@prisma/client';
import { SubscriptionPort } from 'src/subscription/domain/ports/subscription.port';
import { AuditLogPort } from 'src/audit/domain/ports/auditLog.port';
import Stripe from 'stripe';

@Injectable()
export class ProcessWebhookUseCase {
  private stripe: Stripe;
  constructor(
    private readonly subscriptionPort: SubscriptionPort,
    private readonly auditLogPort: AuditLogPort,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: '2026-08-26.dahlia',
    });
  }

  async execute(rawBody: Buffer, stripeSignature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (error) {
      throw new BadRequestException('Invalid signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const workspaceId = session.metadata?.workspaceId;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;
        const tier = session.metadata?.tier as SubscriptionTier;

        if (!workspaceId || !stripeCustomerId || !stripeSubscriptionId) {
          throw new BadRequestException('Missing metadata');
        }

        const stripeSubscription =
          await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

        const startDate = new Date(
          (stripeSubscription as any).billing_cycle_anchor * 1000,
        );

        const currentPeriodEnd = new Date(
          startDate.setMonth(startDate.getMonth() + 1),
        );

        const subscriptionExist =
          await this.subscriptionPort.getSubscriptionByWorkspaceId(workspaceId);

        if (!subscriptionExist) {
          throw new BadRequestException('Subscription not found');
        }

        const updatedSubscription =
          await this.subscriptionPort.updateSubscription(
            subscriptionExist.id,
            stripeCustomerId,
            stripeSubscriptionId,
            tier,
            currentPeriodEnd,
          );

        if (!updatedSubscription)
          throw new InternalServerErrorException(
            'Failed to update subscription',
          );

        await this.auditLogPort.createAuditLog(
          AuditLogAction.SUBSCRIPTION_UPDATED,
          workspaceId,
          session.client_reference_id!,
        );
        return updatedSubscription;
      }

      case 'checkout.session.expired': {
        throw new BadRequestException('Checkout session expired');
      }

      default:
        break;
    }
  }
}
