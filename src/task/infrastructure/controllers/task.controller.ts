import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/application/guards/auth.guard';
import type { Request } from 'express';
import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/task-dto';
import { CreateTaskUseCase } from 'src/task/application/use-cases/create-task.use-case';
import { GetAllTaskUseCase } from 'src/task/application/use-cases/get-all-task.use-case';
import { GetTaskByIdUseCase } from 'src/task/application/use-cases/get-task-by-id.use-case';
import { UpdateTaskUseCase } from 'src/task/application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from 'src/task/application/use-cases/delete-task.use-case';

@UseGuards(AuthGuard)
@Controller()
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getAllTaskUseCase: GetAllTaskUseCase,
    private readonly getTaskUseCase: GetTaskByIdUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}
  @Post('project/:projectId/task/create')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Body() data: CreateTaskDTO,
    @Param('projectId') projectId: string,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');

    const task = await this.createTaskUseCase.execute(data, projectId, userId);

    if (!task) throw new InternalServerErrorException('Error creating task');

    return { data: task };
  }

  @Get('project/:projectId/tasks')
  @HttpCode(HttpStatus.OK)
  async getAllTask(@Param('projectId') projectId: string, @Req() req: Request) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');

    const task = await this.getAllTaskUseCase.execute(projectId, userId);

    if (!task) throw new InternalServerErrorException('Error getting task');

    return { data: task };
  }

  @Get('project/:projectId/task/:taskId')
  @HttpCode(HttpStatus.OK)
  async getTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');

    const task = await this.getTaskUseCase.execute(projectId, taskId, userId);

    if (!task) throw new InternalServerErrorException('Error getting task');

    return { data: task };
  }

  @Put('project/:projectId/task/:taskId/update')
  @HttpCode(HttpStatus.OK)
  async updateTask(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() data: UpdateTaskDTO,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');

    const task = await this.updateTaskUseCase.execute(
      projectId,
      taskId,
      data,
      userId,
    );

    if (!task) throw new InternalServerErrorException('Error updating task');

    return { data: task };
  }

  @Delete('project/:projectId/task/:taskId/delete')
  @HttpCode(HttpStatus.OK)
  async deleteTask(
    @Req() req: Request,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');

    const task = await this.deleteTaskUseCase.execute(
      projectId,
      taskId,
      userId,
    );

    if (!task) throw new InternalServerErrorException('Error deleting task');

    return { data: task };
  }
}
