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

  async invite(tenantId: string, inviterId: string, dto: InviteUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { tenant_id_email: { tenant_id: tenantId, email: dto.email } },
    })
    if (existing) throw new ConflictException('Usuário já pertence ao tenant')

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

    const user = await this.prisma.user.create({
      data: {
        tenant_id: invite.tenant_id,
        email: invite.email,
        name: dto.name,
        password_hash: passwordHash,
        status: 'ACTIVE',
        ...(invite.role_id && {
          user_roles: { create: { role_id: invite.role_id } },
        }),
      },
      select: { id: true, name: true, email: true, tenant_id: true },
    })

    await this.prisma.userInvite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED', accepted_at: new Date() },
    })

    return user
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
