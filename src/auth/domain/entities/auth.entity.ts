export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly passwordHashed: string,
  ) {}
}
