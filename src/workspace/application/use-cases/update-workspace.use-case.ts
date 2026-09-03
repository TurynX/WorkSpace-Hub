import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkSpacePort } from 'src/workspace/domain/ports/workspace.port';
import { UpdateWorkSpaceDto } from 'src/workspace/infrastructure/dtos/workspace-dto';

@Injectable()
export class UpdateWorkSpaceUseCase {
  constructor(private readonly workSpaceRepositoty: WorkSpacePort) {}

  async execute(workSpaceId: string, userId: string, dto: UpdateWorkSpaceDto) {
    const workSpaceExist =
      await this.workSpaceRepositoty.findWorkSpaceById(workSpaceId);

    if (!workSpaceExist)
      throw new NotFoundException('WorkSpace does not exists');

    const user = workSpaceExist.members.find((m) => m.userId === userId);

    if (!user)
      throw new ForbiddenException('You do not belong to this WorkSpace');

    if (user.role !== 'OWNER' && user.role !== 'ADMIN')
      throw new ForbiddenException(
        'You do not have permission to update this WorkSpace',
      );

    const workSpace = await this.workSpaceRepositoty.updateWorkSpace(
      workSpaceId,
      dto.name!,
      dto.slug!,
    );
    return workSpace;
  }
}
