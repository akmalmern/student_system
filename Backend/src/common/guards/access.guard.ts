import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';

import type { AuthUser } from '../types/auth-user.type';

@Injectable()
export class AccessGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: AuthUser;
    }>();

    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
      throw new UnauthorizedException('Access token topilmadi');

    const token = auth.slice('Bearer '.length);
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET topilmadi');

    try {
      const payload = jwt.verify(token, secret) as AuthUser;
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Access token yaroqsiz/eskirgan');
    }
  }
}
