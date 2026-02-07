import type { CookieOptions } from 'express';

function isProd(): boolean {
  return String(process.env.NODE_ENV ?? 'development') === 'production';
}

function baseCookieOptions(): CookieOptions {
  const secure = isProd()
    ? true
    : String(process.env.COOKIE_SECURE ?? 'false') === 'true';
  const sameSite = isProd() ? ('none' as const) : ('lax' as const);

  return { secure, sameSite };
}

export function refreshCookieOptions(): CookieOptions {
  const days = Number(process.env.REFRESH_COOKIE_MAX_AGE_DAYS ?? 7);
  const maxAge = days * 24 * 60 * 60 * 1000; // ms

  return {
    ...baseCookieOptions(),
    httpOnly: true,
    path: '/auth/refresh',
    maxAge,
  };
}
