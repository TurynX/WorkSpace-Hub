import { SubscriptionTier } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;
}
