import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { JwtPayload } from '../auth/types/jwt-payload'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findMe(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar_url: true,
        status: true,
        email_verified_at: true,
        last_login_at: true,
        created_at: true,
        tenant: { select: { id: true, name: true, slug: true, type: true, plan: true, status: true } },
        user_roles: { include: { role: { select: { id: true, name: true, permissions: true } } } },
      },
    })
    if (!user) throw new NotFoundException()
    return user
  }

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenant_id: tenantId, deleted_at: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar_url: true,
        status: true,
        last_login_at: true,
        created_at: true,
        user_roles: { include: { role: { select: { id: true, name: true } } } },
      },
      orderBy: { name: 'asc' },
    })
  }
}
