import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// ✅ reset password: code + new password
export class ResetPasswordDto {
  @ApiProperty({ example: 'student03@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '1234' })
  @Matches(/^\d{5}$/)
  code!: string;

  @ApiProperty({ example: 'new password' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string;
}
