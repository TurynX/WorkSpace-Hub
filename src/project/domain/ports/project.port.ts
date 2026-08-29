import { ProjectEntity } from 'src/project/domain/entities/project.entity';
import {
  CreateProjectDTO,
  UpdateProjectDTO,
} from 'src/project/infrastructure/dtos/project.dto';

export interface ProjectPort {
  create(data: CreateProjectDTO, workspaceId: string): Promise<ProjectEntity>;
  getProjectFromWorkSpace(workspaceId: string): Promise<ProjectEntity[]>;
  getProjectById(projectId: string): Promise<ProjectEntity | null>;
  update(
    projectId: string,
    data: UpdateProjectDTO,
  ): Promise<ProjectEntity | null>;
  delete(projectId: string): Promise<ProjectEntity | null>;
}

export const PROJECT_PORT = Symbol('PROJECT_PORT');
