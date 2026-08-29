import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateProjectDTO, UpdateProjectDTO } from '../dtos/project.dto';
import { CreateProjectUseCase } from 'src/project/application/use-cases/create-project.use-case';
import { GetAllProjectFromWorkSpaceUseCase } from 'src/project/application/use-cases/get-all-project-from-workspace.use-case';
import { GetProjectByIdUseCase } from 'src/project/application/use-cases/get-project-by-id.use-case';
import { UpdateProjectUseCase } from 'src/project/application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from 'src/project/application/use-cases/delete-project.use-case';
import { AuthGuard } from 'src/auth/application/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('workspace')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly getAllProjectFromWorkSpaceUseCase: GetAllProjectFromWorkSpaceUseCase,
    private readonly getProjectByIdUseCase: GetProjectByIdUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
  ) {}

  @Post(':workspaceId/project/create')
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @Body() data: CreateProjectDTO,
    @Param('workspaceId') workspaceId: string,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');

    const project = await this.createProjectUseCase.execute(
      data,
      workspaceId,
      userId,
    );

    return { message: 'Project created successfully', data: project };
  }

  @Get(':workspaceId/projects')
  @HttpCode(HttpStatus.OK)
  async getAllProjectFromWorkSpace(
    @Req() req: Request,
    @Param('workspaceId') workspaceId: string,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');

    const projects = await this.getAllProjectFromWorkSpaceUseCase.execute(
      workspaceId,
      userId,
    );

    return { data: projects };
  }

  @Get(':workspaceId/project/:id')
  @HttpCode(HttpStatus.OK)
  async getProjectById(@Req() req: Request, @Param('id') projectId: string) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');

    const project = await this.getProjectByIdUseCase.execute(userId, projectId);

    return { data: project };
  }

  @Patch(':workspaceId/project/:id/update')
  @HttpCode(HttpStatus.OK)
  async updateProject(
    @Body() data: UpdateProjectDTO,
    @Req() req: Request,
    @Param('id') projectId: string,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');

    const project = await this.updateProjectUseCase.execute(
      userId,
      projectId,
      data,
    );

    return { message: 'Project updated successfully', data: project };
  }
  @Delete(':workspaceId/project/:id/delete')
  @HttpCode(HttpStatus.OK)
  async deleteProject(@Req() req: Request, @Param('id') projectId: string) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');

    const project = await this.deleteProjectUseCase.execute(userId, projectId);

    return { message: 'Project deleted successfully', data: project };
  }
}
