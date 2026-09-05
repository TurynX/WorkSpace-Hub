import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateWorkSpaceUseCase } from 'src/workspace/application/use-cases/create-workspace.use-case';
import {
  AddWorkSpaceMemberDto,
  CreateWorkSpaceDto,
  UpdateWorkSpaceDto,
  UpdateWorkSpaceMemberDto,
} from 'src/workspace/infrastructure/dtos/workspace-dto';
import { WorkSpaceEntity } from 'src/workspace/domain/entities/workspace.entity';
import { AuthGuard } from 'src/auth/application/guards/auth.guard';
import { type Request } from 'express';
import { GetWorkSpaceBelongingToUserUseCase } from 'src/workspace/application/use-cases/get-workspace.use-case';
import { GetWorkSpaceByIdUseCase } from 'src/workspace/application/use-cases/get-workspace-by-id.use-case';
import { UpdateWorkSpaceUseCase } from 'src/workspace/application/use-cases/update-workspace.use-case';
import { DeleteWorkSpaceUseCase } from 'src/workspace/application/use-cases/delete-workspace.use-case';
import { GetWorkSpaceMembersUseCase } from 'src/workspace/application/use-cases/get-workspace-members.use-case';
import { UpdateWorkSpaceMemberUseCase } from 'src/workspace/application/use-cases/update-workspace-member.use-case';
import { AddWorkSpaceMemberUseCase } from 'src/workspace/application/use-cases/add-workspace-member.use-case';
import { DeleteWorkSpaceMemberUseCase } from 'src/workspace/application/use-cases/delete-workspace-member.use-case';

@UseGuards(AuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(
    private readonly createWorkSpaceUseCase: CreateWorkSpaceUseCase,
    private readonly getWorkSpaceUseCase: GetWorkSpaceBelongingToUserUseCase,
    private readonly findWorkSpaceByIdUseCase: GetWorkSpaceByIdUseCase,
    private readonly updateWorkSpaceUseCase: UpdateWorkSpaceUseCase,
    private readonly deleteWorkSpaceUseCase: DeleteWorkSpaceUseCase,
    private readonly getWorkSpaceMembersUseCase: GetWorkSpaceMembersUseCase,
    private readonly updateWorkSpaceMemberUseCase: UpdateWorkSpaceMemberUseCase,
    private readonly addWorkSpaceMemberUseCase: AddWorkSpaceMemberUseCase,
    private readonly deleteWorkSpaceMemberUseCase: DeleteWorkSpaceMemberUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Req() req: Request, @Body() data: CreateWorkSpaceDto) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('userId not provided');
    const workSpace = await this.createWorkSpaceUseCase.execute(userId, data);

    return { message: 'WorkSpace created successfully', data: workSpace };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findUserBelong(@Req() req: Request) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('userId not provided');

    const workspace = await this.getWorkSpaceUseCase.execute(userId);

    if (!workspace) {
      throw new InternalServerErrorException('Failed to retrieve workspaces');
    }

    return { message: 'Workspaces found successfully', data: workspace };
  }

  @Get(':workspaceId')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('workspaceId') workSpaceId: string) {
    const workSpace = await this.findWorkSpaceByIdUseCase.execute(workSpaceId);

    if (!workSpace) {
      throw new NotFoundException('Workspace not found');
    }
    return { message: 'Workspace found successfully', data: workSpace };
  }

  @Put(':workspaceId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() req: Request,
    @Body() data: UpdateWorkSpaceDto,
    @Param('workspaceId') workspaceId: string,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('userId not provided');

    const workSpace = await this.updateWorkSpaceUseCase.execute(
      workspaceId,
      userId,
      data,
    );

    return { message: 'Workspace updated successfully', data: workSpace };
  }

  @Delete(':workspaceId')
  @HttpCode(HttpStatus.OK)
  async delete(@Req() req: Request, @Param('workspaceId') workspaceId: string) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('userId not provided');

    const workSpace = await this.deleteWorkSpaceUseCase.execute(
      workspaceId,
      userId,
    );

    if (!workSpace) {
      throw new InternalServerErrorException('Failed to delete workspace');
    }

    return { message: 'WorkSpace deleted successfully', data: workSpace };
  }

  @Post(':workspaceId/members/add')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Req() req: Request,
    @Param('workspaceId') workSpaceId: string,
    @Body() dto: AddWorkSpaceMemberDto,
  ) {
    const inviterId = req['user'].sub;
    if (!inviterId) throw new UnauthorizedException('userId not provided');
    const invitedEmail = dto.email;

    const member = await this.addWorkSpaceMemberUseCase.execute(
      workSpaceId,
      inviterId,
      invitedEmail,
    );

    return { message: 'Member added successfully', data: member };
  }

  @Get(':workspaceId/members')
  @HttpCode(HttpStatus.OK)
  async get(@Req() req: Request, @Param('workspaceId') workspaceId: string) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('userId not provided');

    const members = await this.getWorkSpaceMembersUseCase.execute(
      workspaceId,
      userId,
    );

    return { message: 'Workspace members found successfully', data: members };
  }

  @Patch(':workspaceId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async updateMember(
    @Req() req: Request,
    @Body() data: UpdateWorkSpaceMemberDto,
    @Param('workspaceId') workSpaceId: string,
    @Param('memberId') memberId: string,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('userId not provided');
    const role = data.role;

    const member = await this.updateWorkSpaceMemberUseCase.execute(
      workSpaceId,
      userId,
      memberId,
      role,
    );

    return { message: 'Member updated successfully', data: member };
  }

  @Delete(':workspaceId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async deleteMember(
    @Req() req: Request,
    @Param('workspaceId') workSpaceId: string,
    @Param('memberId') memberId: string,
  ) {
    const requesterId = req['user'].sub;
    if (!requesterId) throw new UnauthorizedException('userId not provided');

    const member = await this.deleteWorkSpaceMemberUseCase.execute(
      workSpaceId,
      requesterId,
      memberId,
    );

    return { message: 'Member deleted successfully', data: member };
  }
}
