import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { generate5DigitCode } from '../../common/utils/code.util';
import { omitUndefined } from '../../common/utils/omit-undefined.util';
import fs from 'fs/promises';
import path from 'path';

const CODE_EXPIRE_MINUTES = 10;
function expiresAfterMinutes(mins: number): Date {
  return new Date(Date.now() + mins * 60_000);
}
function getLocalFilenameFromUrl(imageUrl: string): string | null {
  // Bizning format: http://host/uploads/filename.jpg
  const dir = process.env.UPLOAD_DIR ?? 'uploads';
  const marker = `/${dir}/`;
  const idx = imageUrl.indexOf(marker);

  if (idx === -1) return null;
  return imageUrl.slice(idx + marker.length); // filename
}

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ✅ current user profil
  me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        imageUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ✅ PATCH profil update
  updateMe(
    userId: string,
    dto: { firstName?: string; lastName?: string; phone?: string },
  ) {
    const data = omitUndefined({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    });

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        imageUrl: true,
        updatedAt: true,
      },
    });
  }

  // ✅ imageUrl update

  async updateImage(userId: string, newImageUrl: string) {
    const dir = process.env.UPLOAD_DIR ?? 'uploads';

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { imageUrl: true },
    });

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { imageUrl: newImageUrl },
      select: { id: true, imageUrl: true },
    });

    // ✅ eski faylni o‘chirish (faqat local uploads bo‘lsa)
    const oldUrl = existing?.imageUrl;
    if (oldUrl) {
      const filename = getLocalFilenameFromUrl(oldUrl);
      if (filename) {
        // path traversal’ni oldini olish: faqat basename
        const safeName = path.basename(filename);
        const fullPath = path.join(process.cwd(), dir, safeName);

        try {
          await fs.unlink(fullPath);
        } catch {
          // fayl topilmasa yoki o‘chmasa — crash qilmaymiz
        }
      }
    }

    return updated;
  }

  // ✅ delete request: emailga kod yuborish
  async requestDelete(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User topilmadi');

    const code = generate5DigitCode();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deleteCodeHash: await bcrypt.hash(code, 10),
        deleteCodeExpiresAt: expiresAfterMinutes(CODE_EXPIRE_MINUTES),
      },
    });

    await this.mail.sendCode(user.email, 'Account o‘chirish kodi', code);
    return { ok: true };
  }

  // ✅ delete confirm: kod to‘g‘ri bo‘lsa account o‘chadi
  async confirmDelete(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User topilmadi');

    if (!user.deleteCodeHash || !user.deleteCodeExpiresAt)
      throw new BadRequestException('Kod topilmadi');
    if (user.deleteCodeExpiresAt.getTime() < Date.now())
      throw new BadRequestException('Kod eskirgan');

    const ok = await bcrypt.compare(code, user.deleteCodeHash);
    if (!ok) throw new BadRequestException('Kod noto‘g‘ri');

    await this.prisma.user.delete({ where: { id: userId } });
    return { ok: true };
  }
}
