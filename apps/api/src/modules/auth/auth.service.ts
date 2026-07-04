import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import type { Env } from '../../config/env'
import type { JwtPayload } from './types/jwt-payload'
import type { LoginDto } from './dto/login.dto'
import type { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService<Env>,
  ) {}

  async login(dto: LoginDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } })
    if (!tenant || tenant.deleted_at) throw new NotFoundException('Tenant não encontrado')

    const user = await this.prisma.user.findUnique({
      where: { tenant_id_email: { tenant_id: tenant.id, email: dto.email } },
      include: {
        user_roles: { include: { role: { select: { permissions: true } } } },
      },
    })
    if (!user || user.deleted_at) throw new UnauthorizedException('Credenciais inválidas')
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Conta suspensa ou inativa')

    const valid = await bcrypt.compare(dto.password, user.password_hash)
    if (!valid) throw new UnauthorizedException('Credenciais inválidas')

    const permissions = this.extractPermissions(user.user_roles)
    const tokens = await this.generateTokens(user.id, tenant.id, user.email, permissions)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    })

    return { ...tokens, user: this.sanitizeUser(user) }
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } })
    if (existing) throw new BadRequestException('Slug já utilizado')

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.tenantName,
        slug: dto.tenantSlug,
        type: dto.tenantType,
        status: 'TRIAL',
      },
    })

    const adminRole = await this.prisma.role.create({
      data: {
        tenant_id: tenant.id,
        name: 'ADMIN',
        is_system: true,
        permissions: ['*'],
      },
    })

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const user = await this.prisma.user.create({
      data: {
        tenant_id: tenant.id,
        name: dto.name,
        email: dto.email,
        password_hash: passwordHash,
        status: 'ACTIVE',
        user_roles: { create: { role_id: adminRole.id } },
      },
    })

    const tokens = await this.generateTokens(user.id, tenant.id, user.email, ['*'])
    return { ...tokens, user: this.sanitizeUser(user) }
  }

  async refresh(tokenRaw: string) {
    const tokenHash = this.hashToken(tokenRaw)
    const stored = await this.prisma.refreshToken.findUnique({ where: { token_hash: tokenHash } })

    if (!stored || stored.revoked_at || stored.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: stored.user_id },
      include: { user_roles: { include: { role: { select: { permissions: true } } } } },
    })
    if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException()

    const tenant = await this.prisma.tenant.findUnique({ where: { id: user.tenant_id } })
    if (!tenant || tenant.status === 'INACTIVE') throw new UnauthorizedException()

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked_at: new Date() },
    })

    const permissions = this.extractPermissions(user.user_roles)
    return this.generateTokens(user.id, user.tenant_id, user.email, permissions)
  }

  async revokeToken(tokenRaw: string) {
    const tokenHash = this.hashToken(tokenRaw)
    await this.prisma.refreshToken.updateMany({
      where: { token_hash: tokenHash, revoked_at: null },
      data: { revoked_at: new Date() },
    })
  }

  private async generateTokens(
    userId: string,
    tenantId: string,
    email: string,
    permissions: string[],
  ) {
    const payload: JwtPayload = { sub: userId, tenantId, email, permissions }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      }),
      this.generateRefreshToken(userId),
    ])

    return { accessToken, refreshToken }
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const raw = crypto.randomBytes(64).toString('hex')
    const hash = this.hashToken(raw)
    const expiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN')!
    const days = parseInt(expiresIn) || 7
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    await this.prisma.refreshToken.create({
      data: { user_id: userId, token_hash: hash, expires_at: expiresAt },
    })

    return raw
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  private extractPermissions(userRoles: Array<{ role: { permissions: unknown } }>): string[] {
    const perms = new Set<string>()
    for (const { role } of userRoles) {
      const rolePerms = role.permissions as string[]
      rolePerms.forEach((p) => perms.add(p))
    }
    return [...perms]
  }

  private sanitizeUser(user: { id: string; name: string; email: string; tenant_id: string }) {
    return { id: user.id, name: user.name, email: user.email, tenantId: user.tenant_id }
  }
}
