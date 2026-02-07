import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type AppRole = 'ADMIN' | 'STUDENT';

// ✅ @Roles('ADMIN') kabi ishlatiladi
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
