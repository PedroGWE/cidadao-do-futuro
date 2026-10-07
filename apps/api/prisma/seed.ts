import { PrismaClient } from '@prisma/client'
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
  await seedDocumentDefaults()
  console.log('✅ Cadastros padrão provisionados sem dados fictícios')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
