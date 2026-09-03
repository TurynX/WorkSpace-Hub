export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly email: string,
  ) {}
}

export class FindByEmailEntity {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly hashedPassword: string,
  ) {}
}
