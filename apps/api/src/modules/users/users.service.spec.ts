import { BadRequestException } from '@nestjs/common'
import { UsersService } from './users.service'

describe('UsersService administration safety', () => {
  const actor = { sub: 'admin-1', tenantId: 'tenant-a', email: 'admin@example.org', permissions: ['*'] }

  function setup(options?: { roles?: Array<{ id: string; tenant_id: string; permissions: string[] }>; admins?: string[] }) {
    const roles = options?.roles ?? []
    const admins = options?.admins ?? ['admin-1']
    const tx = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'admin-1', tenant_id: 'tenant-a' }),
        findMany: jest.fn().mockResolvedValue(admins.map((id) => ({ id, user_roles: [{ role: { permissions: ['*'] } }] }))),
        findUnique: jest.fn().mockResolvedValue({ id: 'admin-1' }),
      },
      role: { findMany: jest.fn().mockResolvedValue(roles) },
      userRole: { deleteMany: jest.fn(), createMany: jest.fn() },
      auditLog: { create: jest.fn() },
    }
    const prisma = { $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)) }
    return { service: new UsersService(prisma as never), tx }
  }

  it('impede remover o papel do último administrador', async () => {
    const { service, tx } = setup()
    await expect(service.setRoles(actor, 'admin-1', [])).rejects.toBeInstanceOf(BadRequestException)
    expect(tx.userRole.deleteMany).not.toHaveBeenCalled()
  })

  it('permite remover o papel quando existe outro administrador', async () => {
    const { service, tx } = setup({ admins: ['admin-1', 'admin-2'] })
    await service.setRoles(actor, 'admin-1', [])
    expect(tx.userRole.deleteMany).toHaveBeenCalledWith({ where: { user_id: 'admin-1' } })
  })

  it('rejeita papel de outra organização', async () => {
    const { service, tx } = setup({ roles: [] })
    await expect(service.setRoles(actor, 'admin-1', ['role-from-tenant-b'])).rejects.toBeInstanceOf(BadRequestException)
    expect(tx.userRole.deleteMany).not.toHaveBeenCalled()
  })
})
