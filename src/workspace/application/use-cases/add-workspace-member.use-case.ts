import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkSpacePort } from '../../domain/ports/workspace.port';
import { AuthPort } from 'src/auth/domain/ports/auth.port';

@Injectable()
export class AddWorkSpaceMemberUseCase {
  constructor(
    private readonly workSpaceRepository: WorkSpacePort,
    private readonly authRepository: AuthPort,
  ) {}

  async execute(workSpaceId: string, inviterId: string, invitedEmail: string) {
    const user = await this.authRepository.findByEmail(invitedEmail);

    if (!user) throw new NotFoundException('User not found');
    const invitedId = user.id;

    const workSpace =
      await this.workSpaceRepository.findWorkSpaceById(workSpaceId);
    if (!workSpace) throw new NotFoundException('WorkSpace not found');

    const IsAlreadyMember = workSpace.members.some(
      (m) => m.userId === invitedId,
    );

    if (IsAlreadyMember)
      throw new ConflictException('You are already member of this WorkSpace');

    const inviter = workSpace.members.find((m) => m.userId === inviterId);

    if (!inviter)
      throw new NotFoundException('You do not belong to this WorkSpace');

    if (inviter.role === 'OWNER' || inviter.role === 'ADMIN') {
      const workspaceMember = await this.workSpaceRepository.addWorkSpaceMember(
        workSpaceId,
        invitedId,
      );
      return workspaceMember;
    }

    throw new ForbiddenException('You do not have permission to add members');
  }
}
