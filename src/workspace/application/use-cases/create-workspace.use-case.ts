import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateSubscriptionUseCase } from 'src/subscription/application/use-cases/create-subscription.use-case';
import { SubscriptionPort } from 'src/subscription/domain/ports/subscription.port';
import { WorkSpaceEntity } from 'src/workspace/domain/entities/workspace.entity';
import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';
import { CreateWorkSpaceDto } from 'src/workspace/infrastructure/dtos/workspace-dto';

@Injectable()
export class CreateWorkSpaceUseCase {
  constructor(
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
    private readonly createSubscription: CreateSubscriptionUseCase,
  ) {}

  async execute(
    userId: string,
    data: CreateWorkSpaceDto,
  ): Promise<WorkSpaceEntity> {
    const slug = await this.workSpaceRepository.findBySlug(data.slug);
    if (slug) {
      throw new ConflictException('Slug already used');
    }

    const workspace = await this.workSpaceRepository.create(
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
