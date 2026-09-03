import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateSubscriptionUseCase } from 'src/subscription/application/use-cases/create-subscription.use-case';

import { WorkSpaceEntity } from 'src/workspace/domain/entities/workspace.entity';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';
import { CreateWorkSpaceDto } from 'src/workspace/infrastructure/dtos/workspace-dto';

@Injectable()
export class CreateWorkSpaceUseCase {
  constructor(
    private readonly workSpacePort: WorkSpacePort,
    private readonly createSubscription: CreateSubscriptionUseCase,
  ) {}

  async execute(
    userId: string,
    data: CreateWorkSpaceDto,
  ): Promise<WorkSpaceEntity> {
    const slug = await this.workSpacePort.findBySlug(data.slug);
    if (slug) {
      throw new ConflictException('Slug already used');
    }

    const workspace = await this.workSpacePort.create(
      userId,
      data.name,
      data.slug,
    );

    if (!workspace)
      throw new InternalServerErrorException('Error creating workspace');

    const createSubscription = await this.createSubscription.execute(
      workspace.id,
    );

    if (!createSubscription)
      throw new InternalServerErrorException('Error creating subscription');

    return workspace;
  }
}
