import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

// ✅ login
export class SigninDto {
  @ApiProperty({ example: 'student03@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Example001!' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
