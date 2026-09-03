import { ProjectEntity } from 'src/project/domain/entities/project.entity';
import {
  CreateProjectDTO,
  UpdateProjectDTO,
} from 'src/project/infrastructure/dtos/project.dto';

export abstract class ProjectPort {
  abstract create(data: CreateProjectDTO, workspaceId: string): Promise<ProjectEntity>;
  abstract getProjectFromWorkSpace(workspaceId: string): Promise<ProjectEntity[]>;
  abstract getProjectById(projectId: string): Promise<ProjectEntity | null>;
  abstract update(
    projectId: string,
    data: UpdateProjectDTO,
  ): Promise<ProjectEntity | null>;
  abstract delete(projectId: string): Promise<ProjectEntity | null>;
}
