import { FindByEmailEntity, UserEntity } from '../entities/auth.entity';

export abstract class AuthPort {
  abstract register(
    fullName: string,
    email: string,
    password: string,
  ): Promise<UserEntity>;

  abstract login(
    email: string,
    passwordHashed: string,
  ): Promise<UserEntity | null>;

  abstract findByEmail(email: string): Promise<FindByEmailEntity | null>;
}
