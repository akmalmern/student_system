import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { refreshCookieOptions } from '../../common/utils/cookie.util';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessGuard } from '../../common/guards/access.guard';
import { AuthService } from './auth.service';

import { SignupRequestDto } from './dto/signup-request.dto';
import { SignupVerifyDto } from './dto/signup-verify.dto';
import { SigninDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @ApiOperation({ summary: 'Signup request (emailga 5 xonali kod yuboradi)' })
  @ApiResponse({ status: 201, description: 'OK' })
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('signup/request')
  signupRequest(@Body() dto: SignupRequestDto) {
    return this.auth.signupRequest(dto);
  }

  @ApiOperation({ summary: 'Signup verify (kodni tekshiradi)' })
  @Post('signup/verify')
  signupVerify(@Body() dto: SignupVerifyDto) {
    return this.auth.signupVerify(dto);
  }

  @ApiOperation({
    summary: 'Signin (access token qaytadi, refresh cookie yoziladi)',
  })
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('signin')
  async signin(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.auth.signin(dto);

    // ✅ refresh_token cookie
    res.cookie('refresh_token', refreshToken, refreshCookieOptions());
    return { accessToken };
  }

  @ApiOperation({
    summary: 'Refresh (refresh cookie orqali yangi access beradi)',
  })
  @Post('refresh')
  async refresh(@Res({ passthrough: true }) res: Response) {
    // ✅ cookie-parser orqali cookie o‘qiladi
    const req = res.req as unknown as {
      cookies?: Record<string, string | undefined>;
    };
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new Error('refresh_token cookie topilmadi');

    const next = await this.auth.refresh(refreshToken);
    res.cookie('refresh_token', next.refreshToken, refreshCookieOptions());
    return { accessToken: next.accessToken };
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout (refresh token bekor qilinadi)' })
  @UseGuards(AccessGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: { sub: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(user.sub);

    // ✅ cookie tozalash
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return { ok: true };
  }

  // ✅ forgot-password: 1 daqiqada 3 ta
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async reset(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const out = await this.auth.resetPassword(dto);
    // ✅ resetdan keyin refresh cookie ham tozalansin
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return out;
  }
}
