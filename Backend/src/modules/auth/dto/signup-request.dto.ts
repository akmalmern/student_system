// import {
//   IsEmail,
//   IsOptional,
//   IsString,
//   MaxLength,
//   MinLength,
// } from 'class-validator';

// // ✅ signup request: emailga kod yuborish uchun
// export class SignupRequestDto {
//   @IsEmail()
//   email!: string;

//   @IsString()
//   @MinLength(8)
//   @MaxLength(72)
//   password!: string;

//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   firstName!: string;

//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   lastName!: string;

//   @IsOptional()
//   @IsString()
//   @MinLength(7)
//   @MaxLength(20)
//   phone?: string;
// }
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupRequestDto {
  @ApiProperty({ example: 'student03@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Student12345!' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: 'Akmal' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({ example: 'Aliyev' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @ApiPropertyOptional({ example: '998901234567' })
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone?: string;
}
