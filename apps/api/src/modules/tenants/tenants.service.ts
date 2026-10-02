import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import type { JwtPayload } from '../auth/types/jwt-payload'
import type { UpdateTenantDto } from './dto/update-tenant.dto'
import type { InviteUserDto } from './dto/invite-user.dto'
import type { AcceptInviteDto } from './dto/accept-invite.dto'
import type { CreateRoleDto, UpdateRoleDto } from '../users/dto/user.dto'

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findMe(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        organizations: {
          select: {
            id: true,
            legal_name: true,
            trade_name: true,
            cnpj: true,
            type: true,
            mission: true,
            address: true,
          },
        },
      },
    })
    if (!tenant) throw new NotFoundException()
    return tenant
  }

  async update(tenantId: string, dto: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.logo_url !== undefined && { logo_url: dto.logo_url }),
        ...(dto.cnpj !== undefined && { cnpj: dto.cnpj }),
        ...(dto.settings && { settings: dto.settings as object }),
      },
    })
  }

  async listRoles(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenant_id: tenantId },
      select: { id: true, name: true, description: true, is_system: true, permissions: true },
      orderBy: { name: 'asc' },
    })
  }

  async createRole(actor: JwtPayload, dto: CreateRoleDto) {
    if (dto.permissions.includes('*')) throw new BadRequestException('A permissão global é reservada ao papel de administrador do sistema')
    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.create({ data: { tenant_id: actor.tenantId, name: dto.name, description: dto.description, permissions: dto.permissions } })
      await tx.auditLog.create({ data: { tenant_id: actor.tenantId, user_id: actor.sub, action: 'CREATE', resource: 'Role', resource_id: role.id, new_value: { name: dto.name, description: dto.description ?? null, permissions: dto.permissions } } })
      return role
    })
  }

  async updateRole(actor: JwtPayload, id: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findFirst({ where: { id, tenant_id: actor.tenantId } })
    if (!role) throw new NotFoundException('Papel não encontrado')
    if (role.is_system) throw new BadRequestException('Papéis do sistema não podem ser alterados')
    if (dto.permissions?.includes('*')) throw new BadRequestException('A permissão global é reservada ao papel de administrador do sistema')
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.role.update({ where: { id }, data: dto })
      await tx.auditLog.create({ data: { tenant_id: actor.tenantId, user_id: actor.sub, action: 'UPDATE', resource: 'Role', resource_id: id, old_value: { name: role.name, description: role.description, permissions: role.permissions }, new_value: { name: dto.name ?? null, description: dto.description ?? null, permissions: dto.permissions ?? null } } })
      return updated
    })
  }

  async deleteRole(actor: JwtPayload, id: string) {
    const role = await this.prisma.role.findFirst({ where: { id, tenant_id: actor.tenantId }, include: { _count: { select: { user_roles: true, user_invites: true } } } })
    if (!role) throw new NotFoundException('Papel não encontrado')
    if (role.is_system) throw new BadRequestException('Papéis do sistema não podem ser excluídos')
    if (role._count.user_roles || role._count.user_invites) throw new BadRequestException('Remova usuários e convites deste papel antes de excluí-lo')
    return this.prisma.$transaction(async (tx) => {
      await tx.role.delete({ where: { id } })
      await tx.auditLog.create({ data: { tenant_id: actor.tenantId, user_id: actor.sub, action: 'DELETE', resource: 'Role', resource_id: id, old_value: { name: role.name, permissions: role.permissions } } })
      return { success: true }
    })
  }

  async invite(tenantId: string, inviterId: string, dto: InviteUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { tenant_id_email: { tenant_id: tenantId, email: dto.email } },
    })
    if (existing) throw new ConflictException('Usuário já pertence ao tenant')

    if (dto.roleId) {
      const role = await this.prisma.role.findFirst({
        where: { id: dto.roleId, tenant_id: tenantId },
        select: { id: true },
      })
      if (!role) throw new BadRequestException('Papel não pertence à organização')
    }

    const pendingInvite = await this.prisma.userInvite.findUnique({
      where: { tenant_id_email: { tenant_id: tenantId, email: dto.email } },
    })
    if (pendingInvite && pendingInvite.status === 'PENDING' && pendingInvite.expires_at > new Date()) {
      throw new ConflictException('Convite já enviado e ainda válido')
    }

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    if (pendingInvite) {
      await this.prisma.userInvite.update({
        where: { id: pendingInvite.id },
        data: { token_hash: tokenHash, expires_at: expiresAt, status: 'PENDING' },
      })
    } else {
      await this.prisma.userInvite.create({
        data: {
          tenant_id: tenantId,
          email: dto.email,
          role_id: dto.roleId ?? null,
          token_hash: tokenHash,
          invited_by: inviterId,
          expires_at: expiresAt,
        },
      })
    }

    return { token, email: dto.email, expiresAt }
  }

  async listInvites(tenantId: string) {
    return this.prisma.userInvite.findMany({
      where: { tenant_id: tenantId, status: 'PENDING' },
      select: {
        id: true,
        email: true,
        status: true,
        expires_at: true,
        created_at: true,
        role: { select: { id: true, name: true } },
        inviter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    })
  }

  async revokeInvite(tenantId: string, inviteId: string) {
    const invite = await this.prisma.userInvite.findFirst({
      where: { id: inviteId, tenant_id: tenantId },
    })
    if (!invite) throw new NotFoundException()
    return this.prisma.userInvite.update({
      where: { id: inviteId },
      data: { status: 'REVOKED' },
    })
  }

  async acceptInvite(dto: AcceptInviteDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex')
    const invite = await this.prisma.userInvite.findUnique({ where: { token_hash: tokenHash } })

    if (!invite || invite.status !== 'PENDING' || invite.expires_at < new Date()) {
      throw new BadRequestException('Convite inválido ou expirado')
    }

    const existing = await this.prisma.user.findUnique({
      where: { tenant_id_email: { tenant_id: invite.tenant_id, email: invite.email } },
    })
    if (existing) throw new ConflictException('Usuário já registrado neste tenant')

    const passwordHash = await bcrypt.hash(dto.password, 12)

    return this.prisma.$transaction(async (tx) => {
      const consumed = await tx.userInvite.updateMany({
        where: { id: invite.id, status: 'PENDING', expires_at: { gt: new Date() } },
        data: { status: 'ACCEPTED', accepted_at: new Date() },
      })
      if (consumed.count !== 1) throw new BadRequestException('Convite já utilizado ou expirado')
      return tx.user.create({
        data: {
          tenant_id: invite.tenant_id,
          email: invite.email,
          name: dto.name,
          password_hash: passwordHash,
          status: 'ACTIVE',
          ...(invite.role_id && { user_roles: { create: { role_id: invite.role_id } } }),
        },
        select: { id: true, name: true, email: true, tenant_id: true },
      })
    })
  }

  async getStats(tenantId: string) {
    const [users, projects, activeProjects] = await Promise.all([
      this.prisma.user.count({ where: { tenant_id: tenantId, deleted_at: null } }),
      this.prisma.project.count({ where: { tenant_id: tenantId, deleted_at: null } }),
      this.prisma.project.count({
        where: { tenant_id: tenantId, deleted_at: null, status: 'EM_EXECUCAO' },
      }),
    ])
    return { users, projects, activeProjects }
  }
}
