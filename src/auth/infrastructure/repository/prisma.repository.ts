import { AuthPort } from '../../domain/ports/auth.port';
import { PrismaService } from '../../../lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/auth/domain/entities/auth.entity';

@Injectable()
export class AuthRepository implements AuthPort {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    fullName: string,
    email: string,
    passwordHashed: string,
  ): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: passwordHashed,
      },
    });

    return new UserEntity(user.id, user.fullName, user.email, passwordHashed);
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

    return new UserEntity(
      user.id,
      user.fullName,
      user.email,
      user.passwordHash,
    );
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return new UserEntity(
      user.id,
      user.fullName,
      user.email,
      user.passwordHash,
    );
  }
}
