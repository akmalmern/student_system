import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// ✅ PrismaService global bo‘lsin: hamma modul ishlata oladi
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
