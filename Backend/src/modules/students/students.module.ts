import { Module } from '@nestjs/common';

import { MailModule } from '../mail/mail.module';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [MailModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
