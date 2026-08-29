import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionTier, WorkspaceRole } from '@prisma/client';
import { SubscriptionPort } from 'src/subscription/domain/ports/subscription.port';
import { UpdateSubscriptionDto } from 'src/subscription/infrastructure/dtos/subscription-dto';
import { WORKSPACE_PORT } from 'src/workspace/domain/ports/workspace.port';
import Stripe from 'stripe';
import { type WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';
import { CreateSubscriptionUseCase } from './create-subscription.use-case';

@Injectable()
export class CreateCheckoutUseCase {
  private stripe: Stripe;
  constructor(
    private readonly subscriptionPort: SubscriptionPort,
    @Inject(WORKSPACE_PORT) private readonly workspacePort: WorkSpacePort,
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: '2026-08-26.dahlia',
    });
  }

  async execute(
    workspaceId: string,
    userId: string,
    data: UpdateSubscriptionDto,
  ) {
    const workspace = await this.workspacePort.findWorkSpaceById(workspaceId);

    if (!workspace) throw new NotFoundException('WorkSpace not found');

    const isMember = workspace.members.find((m) => m.userId === userId);

    if (!isMember)
      throw new ForbiddenException('You are not a member of this workspace');

    if (isMember.role !== WorkspaceRole.OWNER)
      throw new ForbiddenException('You must be the owner of this workspace');

    const subscriptionExists =
      await this.subscriptionPort.getSubscriptionByWorkspaceId(workspaceId);

    let subscriptionId: string;
    let customerId: string;

    if (!subscriptionExists) {
      const subscription =
        await this.createSubscriptionUseCase.execute(workspaceId);
      subscriptionId = subscription.id;
      customerId = subscription.stripeCustomerId!;
    } else {
      subscriptionId = subscriptionExists.id;
      customerId = subscriptionExists.stripeCustomerId!;
    }

    if (!customerId) {
      customerId = (
        await this.stripe.customers.create({
          metadata: { workspaceId },
        })
      ).id;
    }

    let price: string;
    let tier: SubscriptionTier;

    if (data.tier === 'PRO') {
      price = process.env.STRIPE_PRO_SUBSCRIPTION_MONTHLY!;
      tier = SubscriptionTier.PRO;
    } else {
      price = process.env.STRIPE_ENTERPRISE_SUBSCRIPTION_MONTHLY!;
      tier = SubscriptionTier.ENTERPRISE;
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      expand: ['subscription'],
      metadata: { workspaceId, tier },
      success_url: `${process.env.HOST_URL}/billing/success`,
      cancel_url: `${process.env.HOST_URL}/billing/failed`,
    });

    return session.url;
  }
}
