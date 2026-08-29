import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginDto, RegisterUserDto } from '../dtos/auth.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const result = await this.registerUserUseCase.execute(
      registerUserDto.fullName,
      registerUserDto.email,
      registerUserDto.password,
    );
    return {
      message: 'User registered successfully',
      data: result,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.loginUseCase.execute(
      loginDto.email,
      loginDto.password,
    );
    return {
      message: 'User logged in successfully',
      data: result,
    };
  }
}
