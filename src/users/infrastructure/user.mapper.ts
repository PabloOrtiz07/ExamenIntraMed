import { User } from '../domain/user.entity';
import { UserOrmEntity } from './user.orm-entity';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return new User(orm.id, orm.email, orm.passwordHash, orm.role, orm.createdAt);
  }

  static toOrm(user: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    if (user.id) orm.id = user.id;
    orm.email = user.email;
    orm.passwordHash = user.passwordHash;
    orm.role = user.role;
    return orm;
  }
}