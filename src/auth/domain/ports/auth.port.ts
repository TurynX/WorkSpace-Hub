import { UserEntity } from '../entities/auth.entity';

export interface AuthPort {
  register(
    fullName: string,
    email: string,
    password: string,
  ): Promise<UserEntity>;

  login(email: string, password: string): Promise<UserEntity | null>;

  findByEmail(email: string): Promise<UserEntity | null>;
}

export const AUTH_PORT = Symbol('AUTH_PORT');
