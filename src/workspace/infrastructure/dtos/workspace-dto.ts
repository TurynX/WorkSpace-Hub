import { WorkspaceRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateWorkSpaceDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  slug: string;
}

export class UpdateWorkSpaceDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  slug: string;
}

export class UpdateWorkSpaceMemberDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}

export class AddWorkSpaceMemberDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
