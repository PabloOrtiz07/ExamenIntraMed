import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

export class SignUpResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'pablo@test.com' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.REGULAR })
  role!: Role;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT to send as "Authorization: Bearer <token>"' })
  accessToken!: string;
}