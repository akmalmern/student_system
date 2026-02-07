import { Matches } from 'class-validator';

// ✅ delete confirm uchun 5 xonali code
export class ConfirmCodeDto {
  @Matches(/^\d{5}$/)
  code!: string;
}
