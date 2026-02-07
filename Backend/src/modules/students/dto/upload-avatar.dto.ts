import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file!: any; // swagger uchun binary ko‘rsatish; runtime’da ishlatilmaydi
}
