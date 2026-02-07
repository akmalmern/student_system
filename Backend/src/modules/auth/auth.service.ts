import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import type { Role } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { generate5DigitCode } from '../../common/utils/code.util';
import { TokenService } from './token.service';

const CODE_EXPIRE_MINUTES = 10;

// ✅ code expire vaqt hisoblash
function expiresAfterMinutes(mins: number): Date {
  return new Date(Date.now() + mins * 60_000);
}
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

function lockUntilDate(): Date {
  return new Date(Date.now() + LOCK_MINUTES * 60_000);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly tokens: TokenService,
  ) {}

  // ✅ 1) Signup request: user pending yaratamiz + emailga kod yuboramiz
  async signupRequest(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const code = generate5DigitCode();
    const codeHash = await bcrypt.hash(code, 10);

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // ✅ Agar oldin verified bo‘lsa, qaytadan signup qilmasin
    if (existing?.isEmailVerified) {
      throw new BadRequestException('Bu email allaqachon ro‘yxatdan o‘tgan');
    }

    if (!existing) {
      await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone ?? null,
          role: 'STUDENT' as Role,
          isEmailVerified: false,
          emailVerifyCodeHash: codeHash,
          emailVerifyCodeExpiresAt: expiresAfterMinutes(CODE_EXPIRE_MINUTES),
        },
      });
    } else {
      // ✅ pending user bo‘lsa, data + kodni yangilaymiz
      await this.prisma.user.update({
        where: { email: dto.email },
        data: {
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone ?? null,
          emailVerifyCodeHash: codeHash,
          emailVerifyCodeExpiresAt: expiresAfterMinutes(CODE_EXPIRE_MINUTES),
        },
      });
    }

    await this.mail.sendCode(dto.email, 'Signup tasdiqlash kodi', code);
    return { ok: true };
  }

  // ✅ 2) Signup verify: kod to‘g‘ri bo‘lsa email verified bo‘ladi
  async signupVerify(dto: { email: string; code: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new BadRequestException('User topilmadi');

    if (user.isEmailVerified) return { ok: true };

    if (!user.emailVerifyCodeHash || !user.emailVerifyCodeExpiresAt) {
      throw new BadRequestException('Kod topilmadi');
    }

    if (user.emailVerifyCodeExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Kod eskirgan');
    }

    const ok = await bcrypt.compare(dto.code, user.emailVerifyCodeHash);
    if (!ok) throw new BadRequestException('Kod noto‘g‘ri');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyCodeHash: null,
        emailVerifyCodeExpiresAt: null,
      },
    });

    return { ok: true };
  }

  //   // ✅ 3) Signin: access token return, refresh token cookie’da
  //   async signin(dto: { email: string; password: string }) {
  //     const user = await this.prisma.user.findUnique({
  //       where: { email: dto.email },
  //     });
  //     if (!user) throw new UnauthorizedException('Email yoki parol noto‘g‘ri');

  //     if (!user.isEmailVerified)
  //       throw new ForbiddenException('Email tasdiqlanmagan');

  //     const passOk = await bcrypt.compare(dto.password, user.passwordHash);
  //     if (!passOk) throw new UnauthorizedException('Email yoki parol noto‘g‘ri');

  //     const payload = { sub: user.id, role: user.role };
  //     const accessToken = this.tokens.signAccess(payload);
  //     const refreshToken = this.tokens.signRefresh(payload);

  //     // ✅ refresh token DB’da hash bo‘lib saqlanadi
  //     await this.prisma.user.update({
  //       where: { id: user.id },
  //       data: { refreshTokenHash: await bcrypt.hash(refreshToken, 12) },
  //     });

  //     return { accessToken, refreshToken };
  //   }

  async signin(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // ✅ email enumeration: baribir "noto‘g‘ri" qaytaramiz
    if (!user) throw new UnauthorizedException('Email yoki parol noto‘g‘ri');

    // ✅ lock bo‘lsa tekshiramiz
    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      throw new ForbiddenException(
        `Account vaqtincha bloklangan. ${LOCK_MINUTES} daqiqadan keyin urinib ko‘ring.`,
      );
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Email tasdiqlanmagan');
    }

    const passOk = await bcrypt.compare(dto.password, user.passwordHash);

    // ❌ parol noto‘g‘ri bo‘lsa — counter oshiramiz
    if (!passOk) {
      const nextFailed = user.failedLoginCount + 1;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: nextFailed,
          lockUntil: nextFailed >= MAX_FAILED ? lockUntilDate() : null,
        },
      });

      throw new UnauthorizedException('Email yoki parol noto‘g‘ri');
    }

    // ✅ to‘g‘ri bo‘lsa — counter reset
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockUntil: null },
    });

    // ✅ tokenlar
    const payload = { sub: user.id, role: user.role };
    const accessToken = this.tokens.signAccess(payload);
    const refreshToken = this.tokens.signRefresh(payload);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await bcrypt.hash(refreshToken, 12) },
    });

    return { accessToken, refreshToken };
  }

  // ✅ 4) Refresh: rotate qilish (yangi refresh + access)
  async refresh(refreshToken: string) {
    const payload = this.tokens.verifyRefresh(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user?.refreshTokenHash)
      throw new UnauthorizedException('Refresh token yaroqsiz');

    const ok = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!ok) throw new UnauthorizedException('Refresh token yaroqsiz');

    const newAccess = this.tokens.signAccess({ sub: user.id, role: user.role });
    const newRefresh = this.tokens.signRefresh({
      sub: user.id,
      role: user.role,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await bcrypt.hash(newRefresh, 12) },
    });

    return { accessToken: newAccess, refreshToken: newRefresh };
  }

  // ✅ 5) Logout: DB refresh hashni tozalash
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    return { ok: true };
  }

  // ✅ 6) Forgot password: emailga 5 xonali kod yuborish
  async forgotPassword(email: string) {
    // ✅ email enumeration bo‘lmasin: har doim ok qaytaramiz
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isEmailVerified) return { ok: true };

    const code = generate5DigitCode();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetCodeHash: await bcrypt.hash(code, 10),
        resetCodeExpiresAt: expiresAfterMinutes(CODE_EXPIRE_MINUTES),
      },
    });

    await this.mail.sendCode(email, 'Parol tiklash kodi', code);
    return { ok: true };
  }

  // ✅ 7) Reset password: code + newPassword
  async resetPassword(dto: {
    email: string;
    code: string;
    newPassword: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new BadRequestException('User topilmadi');

    if (!user.resetCodeHash || !user.resetCodeExpiresAt)
      throw new BadRequestException('Kod topilmadi');
    if (user.resetCodeExpiresAt.getTime() < Date.now())
      throw new BadRequestException('Kod eskirgan');

    const ok = await bcrypt.compare(dto.code, user.resetCodeHash);
    if (!ok) throw new BadRequestException('Kod noto‘g‘ri');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, 12),
        resetCodeHash: null,
        resetCodeExpiresAt: null,
        // ✅ xavfsizlik: parol o‘zgarsa refresh tokenlar bekor bo‘lsin
        refreshTokenHash: null,
      },
    });

    return { ok: true };
  }
}
