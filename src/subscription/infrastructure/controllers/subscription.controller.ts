import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/application/guards/auth.guard';
import { Public } from 'src/auth/application/guards/public.decorator';
import { CreateCheckoutUseCase } from 'src/subscription/application/use-cases/create-checkout.use-case';
import { GetSubscriptionUseCase } from 'src/subscription/application/use-cases/get-subscription.use-case';
import { ProcessWebhookUseCase } from 'src/subscription/application/use-cases/process-webhook.use-case';
import Stripe from 'stripe';
import { UpdateSubscriptionDto } from '../dtos/subscription-dto';

@Controller()
@UseGuards(AuthGuard)
export class SubscriptionController {
  private stripe: Stripe;

  constructor(
    private readonly checkoutSubscriptionUseCase: CreateCheckoutUseCase,
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
    private readonly processWebhookUseCase: ProcessWebhookUseCase,
  ) {}

  @Post('workspace/:workspaceId/subscription/upgrade')
  @HttpCode(HttpStatus.OK)
  async Checkout(
    @Req() req: Request,
    @Param('workspaceId') workspaceId: string,
    @Body() body: UpdateSubscriptionDto,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('Unauthorized');
    const checkout = await this.checkoutSubscriptionUseCase.execute(
      workspaceId,
      userId,
      body,
    );
    return { data: { url: checkout } };
  }

  @Get('workspace/:workspaceId/subscription')
  @HttpCode(HttpStatus.OK)
  async getSubscription(
    @Param('workspaceId') workspaceId: string,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('Unauthorized');
    const subscription = await this.getSubscriptionUseCase.execute(
      workspaceId,
      userId,
    );
    return { data: { subscription } };
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: Request) {
    const stripeSignature = req.headers['stripe-signature'];
    if (!stripeSignature)
      throw new BadRequestException('No signature provided');

    const rawBody = (req as any).rawBody;

    const webhook = await this.processWebhookUseCase.execute(
      rawBody,
      stripeSignature,
    );

    if (!webhook)
      throw new InternalServerErrorException('Webhook not processed');

    return { data: { webhook } };
  }

  @Public()
  @Get('billing/success')
  @HttpCode(HttpStatus.OK)
  async handleBillingSuccess(@Req() req: Request) {
    return { data: { message: 'Billing success' } };
  }

  @Public()
  @Get('billing/failed')
  @HttpCode(HttpStatus.OK)
  async handleBillingFailed(@Req() req: Request) {
    return { data: { message: 'Billing failed' } };
  }
}
