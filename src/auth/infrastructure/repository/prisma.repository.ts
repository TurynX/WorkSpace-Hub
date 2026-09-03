import { AuthPort } from '../../domain/ports/auth.port';
import { PrismaService } from '../../../lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  FindByEmailEntity,
  UserEntity,
} from 'src/auth/domain/entities/auth.entity';
import { User } from '@prisma/client';

@Injectable()
export class AuthRepository implements AuthPort {
  constructor(private readonly prisma: PrismaService) {}

  private userEntity(user: User): UserEntity {
    return new UserEntity(user.id, user.fullName, user.email);
  }

  async register(
    fullName: string,
    email: string,
    hashedPassword: string,
  ): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
      },
    });

    return this.userEntity(user);
  }

  async login(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return this.userEntity(user);
  }

  async findByEmail(email: string): Promise<FindByEmailEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return new FindByEmailEntity(
      user.id,
      user.fullName,
      user.email,
      user.passwordHash,
    );
  }
}
