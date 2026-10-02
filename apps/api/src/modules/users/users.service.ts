import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { JwtPayload } from '../auth/types/jwt-payload'
import type { ChangePasswordDto, UpdateProfileDto } from './dto/user.dto'

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

  async updateMe(payload: JwtPayload, dto: UpdateProfileDto) {
    const previous = await this.prisma.user.findFirst({ where: { id: payload.sub, tenant_id: payload.tenantId, deleted_at: null } })
    if (!previous) throw new NotFoundException('Usuário não encontrado')
    const updated = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id: payload.sub }, data: dto, select: { id: true, name: true, email: true, phone: true, avatar_url: true } })
      await tx.auditLog.create({ data: { tenant_id: payload.tenantId, user_id: payload.sub, action: 'UPDATE_PROFILE', resource: 'User', resource_id: payload.sub, old_value: { name: previous.name, phone: previous.phone, avatar_url: previous.avatar_url }, new_value: { name: dto.name, phone: dto.phone ?? null, avatar_url: dto.avatar_url ?? null } } })
      return user
    })
    return updated
  }

  async changePassword(payload: JwtPayload, dto: ChangePasswordDto) {
    if (dto.current_password === dto.new_password) throw new BadRequestException('A nova senha deve ser diferente da atual')
    const user = await this.prisma.user.findFirst({ where: { id: payload.sub, tenant_id: payload.tenantId, deleted_at: null } })
    if (!user || !(await bcrypt.compare(dto.current_password, user.password_hash))) throw new ForbiddenException('Senha atual incorreta')
    const passwordHash = await bcrypt.hash(dto.new_password, 12)
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { password_hash: passwordHash } })
      await tx.refreshToken.updateMany({ where: { user_id: user.id, revoked_at: null }, data: { revoked_at: new Date() } })
      await tx.auditLog.create({ data: { tenant_id: payload.tenantId, user_id: user.id, action: 'CHANGE_PASSWORD', resource: 'User', resource_id: user.id } })
    })
    return { message: 'Senha alterada. Entre novamente em todos os dispositivos.' }
  }

  private async isLastAdmin(tx: Prisma.TransactionClient, tenantId: string, userId: string) {
    const admins = await tx.user.findMany({
      where: { tenant_id: tenantId, deleted_at: null, status: 'ACTIVE', user_roles: { some: {} } },
      select: { id: true, user_roles: { select: { role: { select: { permissions: true } } } } },
    })
    const adminIds = admins.filter((user) => user.user_roles.some(({ role }) => Array.isArray(role.permissions) && role.permissions.includes('*'))).map((user) => user.id)
    return adminIds.length === 1 && adminIds[0] === userId
  }

  async setRoles(actor: JwtPayload, userId: string, roleIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({ where: { id: userId, tenant_id: actor.tenantId, deleted_at: null } })
      if (!user) throw new NotFoundException('Usuário não encontrado')
      const roles = await tx.role.findMany({ where: { id: { in: roleIds }, tenant_id: actor.tenantId } })
      if (roles.length !== new Set(roleIds).size) throw new BadRequestException('Um ou mais papéis não pertencem à organização')
      const retainsAdmin = roles.some((role) => Array.isArray(role.permissions) && role.permissions.includes('*'))
      if (!retainsAdmin && await this.isLastAdmin(tx, actor.tenantId, userId)) throw new BadRequestException('Não é possível remover o último administrador')
      await tx.userRole.deleteMany({ where: { user_id: userId } })
      if (roleIds.length) await tx.userRole.createMany({ data: roleIds.map((roleId) => ({ user_id: userId, role_id: roleId, granted_by: actor.sub })) })
      await tx.auditLog.create({ data: { tenant_id: actor.tenantId, user_id: actor.sub, action: 'SET_ROLES', resource: 'User', resource_id: userId, new_value: { role_ids: roleIds } } })
      return tx.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, status: true, user_roles: { include: { role: { select: { id: true, name: true, permissions: true } } } } },
      })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  }

  async deactivate(actor: JwtPayload, userId: string) {
    if (actor.sub === userId) throw new BadRequestException('Você não pode desativar sua própria conta')
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({ where: { id: userId, tenant_id: actor.tenantId, deleted_at: null } })
      if (!user) throw new NotFoundException('Usuário não encontrado')
      if (await this.isLastAdmin(tx, actor.tenantId, userId)) throw new BadRequestException('Não é possível remover o último administrador')
      const now = new Date()
      await tx.refreshToken.updateMany({ where: { user_id: userId, revoked_at: null }, data: { revoked_at: now } })
      const updated = await tx.user.update({ where: { id: userId }, data: { status: 'INACTIVE', deleted_at: now }, select: { id: true, status: true, deleted_at: true } })
      await tx.auditLog.create({ data: { tenant_id: actor.tenantId, user_id: actor.sub, action: 'DEACTIVATE', resource: 'User', resource_id: userId } })
      return updated
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
  }
}
