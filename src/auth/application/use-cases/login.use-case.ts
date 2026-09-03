import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPort } from '../../domain/ports/auth.port';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authPort: AuthPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string) {
    const userExist = await this.authPort.findByEmail(email);
    if (!userExist) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await argon2.verify(
      userExist.hashedPassword,
      password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.authPort.login(email, password);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    return { user, token };
  }
}
