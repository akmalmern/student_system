import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listStudents(params: { q?: string; page: number; limit: number }) {
    const skip = (params.page - 1) * params.limit;

    const where = params.q?.trim()
      ? {
          role: Role.STUDENT,
          OR: [
            { email: { contains: params.q, mode: 'insensitive' as const } },
            { firstName: { contains: params.q, mode: 'insensitive' as const } },
            { lastName: { contains: params.q, mode: 'insensitive' as const } },
            { phone: { contains: params.q, mode: 'insensitive' as const } },
          ],
        }
      : { role: Role.STUDENT };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { page: params.page, limit: params.limit, total, items };
  }

  deleteStudent(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
