import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  WORKSPACE_PORT,
  type WorkSpacePort,
} from 'src/workspace/domain/ports/workspace.port';

@Injectable()
export class DeleteWorkSpaceUseCase {
  constructor(
    @Inject(WORKSPACE_PORT) private readonly workSpaceRepository: WorkSpacePort,
  ) {}

  async execute(workSpaceId: string, userId: string) {
    const workSpace =
      await this.workSpaceRepository.findWorkSpaceById(workSpaceId);

    if (!workSpace) throw new NotFoundException('WorkSpace does not exists');

    const user = workSpace.members.find((m) => m.userId === userId);

    if (!user)
      throw new ForbiddenException('You do not belong to this WorkSpace');

    if (user.role !== 'OWNER')
      throw new ForbiddenException(
        'You do not have permission to delete this WorkSpace',
      );

    return await this.workSpaceRepository.deleteWorkSpace(workSpaceId);
  }
}
