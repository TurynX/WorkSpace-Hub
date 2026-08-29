import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { AUTH_PORT, type AuthPort } from '../../domain/ports/auth.port';
import * as argon2 from 'argon2';

@Injectable()
export class RegisterUserUseCase {
  constructor(@Inject(AUTH_PORT) private readonly authPort: AuthPort) {}

  async execute(fullName: string, email: string, password: string) {
    const existUser = await this.authPort.findByEmail(email);
    if (existUser) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await argon2.hash(password);
    const user = await this.authPort.register(fullName, email, hashedPassword);
    const { passwordHashed, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
