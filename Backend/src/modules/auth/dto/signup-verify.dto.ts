import { IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// ✅ signup verify: 5 xonali kod tekshirish
export class SignupVerifyDto {
  @ApiProperty({ example: 'student03@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '1234' })
  @Matches(/^\d{5}$/)
  code!: string;
}
