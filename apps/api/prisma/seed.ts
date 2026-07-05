import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { DEFAULT_DOCUMENT_CATEGORIES } from '../src/modules/documents/default-documents'

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
  const existing = await prisma.tenant.findUnique({ where: { slug: 'demo' } })
  if (existing) {
    console.log('Tenant demo já existe. Pulando criação base.')
    await seedDocumentDefaults()
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

  await seedDocumentDefaults()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
