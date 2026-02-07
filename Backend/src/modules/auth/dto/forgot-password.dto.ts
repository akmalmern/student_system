import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

// ✅ forgot password: emailga kod yuboriladi
export class ForgotPasswordDto {
  @ApiProperty({ example: 'student03@gmail.com' })
  @IsEmail()
  email!: string;
}
