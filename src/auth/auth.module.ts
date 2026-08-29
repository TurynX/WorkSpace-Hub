import { Module } from '@nestjs/common';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AUTH_PORT } from './domain/ports/auth.port';
import { AuthRepository } from './infrastructure/repository/prisma.repository';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './application/guards/auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY! || 'superultrasecretekey123456',
      signOptions: { expiresIn: '100d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    RegisterUserUseCase,
    LoginUseCase,
    AuthGuard,

    {
      provide: AUTH_PORT,
      useClass: AuthRepository,
    },
  ],

  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
