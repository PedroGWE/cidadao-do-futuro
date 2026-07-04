import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.tenant.findUnique({ where: { slug: 'demo' } })
  if (existing) {
    console.log('Seed já executado. Pulando.')
    return
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Organização Demo',
      slug: 'demo',
      type: 'OSC',
      status: 'ACTIVE',
      plan: 'PROFESSIONAL',
    },
  })

  const adminRole = await prisma.role.create({
    data: {
      tenant_id: tenant.id,
      name: 'ADMIN',
      is_system: true,
      permissions: ['*'],
    },
  })

  await prisma.user.create({
    data: {
      tenant_id: tenant.id,
      name: 'Admin Demo',
      email: 'admin@demo.com',
      password_hash: await bcrypt.hash('Admin@123', 12),
      status: 'ACTIVE',
      user_roles: { create: { role_id: adminRole.id } },
    },
  })

  console.log('✅ Seed criado:')
  console.log('   Tenant slug: demo')
  console.log('   Email: admin@demo.com')
  console.log('   Senha: Admin@123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
