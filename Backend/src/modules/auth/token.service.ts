import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';

type Role = 'ADMIN' | 'STUDENT';

@Injectable()
export class TokenService {
  signAccess(payload: { sub: string; role: Role }): string {
    const secret = process.env.JWT_ACCESS_SECRET as Secret;
    const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ??
      '15m') as SignOptions['expiresIn'];

    return jwt.sign(payload, secret, { expiresIn });
  }

  signRefresh(payload: { sub: string; role: Role }): string {
    const secret = process.env.JWT_REFRESH_SECRET as Secret;
    const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ??
      '7d') as SignOptions['expiresIn'];

    return jwt.sign(payload, secret, { expiresIn });
  }

  verifyRefresh(token: string): { sub: string; role: Role } {
    const secret = process.env.JWT_REFRESH_SECRET as Secret;

    return jwt.verify(token, secret) as { sub: string; role: Role };
  }
}
