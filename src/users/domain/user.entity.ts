import { Role } from '../../common/enums/role.enum';

export class User {
  constructor(
    public readonly id: string | null,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: Role,
    public readonly createdAt: Date | null = null,
  ) {}
}