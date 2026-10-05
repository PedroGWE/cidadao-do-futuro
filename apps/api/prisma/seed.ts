import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { DEFAULT_DOCUMENT_CATEGORIES } from '../src/modules/documents/default-documents'
import { seedDemoData } from './demo-data'

const prisma = new PrismaClient()

/** Provisiona categorias/tipos padrão de documentos institucionais (idempotente). */
async function seedDocumentDefaults() {
  const tenants = await prisma.tenant.findMany({ select: { id: true, slug: true } })
  for (const tenant of tenants) {
    const count = await prisma.institutionalDocCategory.count({ where: { tenant_id: tenant.id } })
    if (count > 0) continue
    for (const cat of DEFAULT_DOCUMENT_CATEGORIES) {
      await prisma.institutionalDocCategory.create({
        data: {
          tenant_id: tenant.id,
          name: cat.name,
          order: cat.order,
          types: {
            create: cat.types.map((t) => ({
              name: t.name,
              required: t.required ?? false,
              default_validity_days: t.default_validity_days ?? null,
            })),
          },
        },
      })
    }
    console.log(`   Documentos padrão criados para tenant "${tenant.slug}"`)
  }
}

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED_IN_PRODUCTION !== 'true') {
    throw new Error('O seed de demonstração em produção exige ALLOW_DEMO_SEED_IN_PRODUCTION=true.')
  }

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    create: {
      name: 'Organização Demo',
      slug: 'demo',
      type: 'OSC',
      status: 'ACTIVE',
      plan: 'PROFESSIONAL',
    },
    update: { name: 'Organização Demo', status: 'ACTIVE' },
  })

  const adminRole = await prisma.role.upsert({
    where: { tenant_id_name: { tenant_id: tenant.id, name: 'ADMIN' } },
    create: {
      tenant_id: tenant.id,
      name: 'ADMIN',
      is_system: true,
      permissions: ['*'],
    },
    update: { is_system: true, permissions: ['*'] },
  })

  const user = await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: tenant.id, email: 'admin@demo.com' } },
    create: {
      tenant_id: tenant.id,
      name: 'Admin Demo',
      email: 'admin@demo.com',
      password_hash: await bcrypt.hash('Admin@123', 12),
      status: 'ACTIVE',
    },
    update: { name: 'Admin Demo', status: 'ACTIVE' },
  })

  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: user.id, role_id: adminRole.id } },
    create: { user_id: user.id, role_id: adminRole.id },
    update: {},
  })

  await seedDemoData(prisma, tenant.id, user.id)

  console.log('✅ Seed criado:')
  console.log('   Tenant slug: demo')
  console.log('   Email: admin@demo.com')
  console.log('   Senha inicial (somente para usuário novo): Admin@123')

  await seedDocumentDefaults()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
