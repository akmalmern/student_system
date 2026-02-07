import { Module } from '@nestjs/common';

import { MailModule } from '../mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Module({
  imports: [MailModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
})
export class AuthModule {}
