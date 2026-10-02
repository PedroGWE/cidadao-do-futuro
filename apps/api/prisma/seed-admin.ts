import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

function generatePassword(length = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*-_+='
  const bytes = crypto.randomBytes(length)
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length]
  }
  return password
}

async function main() {
  const tenantSlug = process.env.ADMIN_TENANT_SLUG
  const tenantName = process.env.ADMIN_TENANT_NAME
  const adminEmail = process.env.ADMIN_EMAIL
  const adminName = process.env.ADMIN_NAME || 'Administrador'
  if (!tenantSlug || !tenantName || !adminEmail) {
    throw new Error('Defina ADMIN_TENANT_SLUG, ADMIN_TENANT_NAME e ADMIN_EMAIL')
  }

  let tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        slug: tenantSlug,
        type: 'OSC',
        status: 'ACTIVE',
        plan: 'ENTERPRISE',
      },
    })
    console.log(`✅ Tenant "${tenantSlug}" criado`)
  } else {
    console.log(`ℹ️ Tenant "${tenantSlug}" já existe`)
  }

  let role = await prisma.role.findUnique({
    where: { tenant_id_name: { tenant_id: tenant.id, name: 'ADMIN' } },
  })
  if (!role) {
    role = await prisma.role.create({
      data: {
        tenant_id: tenant.id,
        name: 'ADMIN',
        is_system: true,
        permissions: ['*'],
      },
    })
  }

  const existingUser = await prisma.user.findUnique({
    where: { tenant_id_email: { tenant_id: tenant.id, email: adminEmail } },
  })

  if (existingUser) {
    await prisma.userRole.upsert({
      where: { user_id_role_id: { user_id: existingUser.id, role_id: role.id } },
      create: { user_id: existingUser.id, role_id: role.id },
      update: {},
    })
    console.log(`ℹ️ Usuário "${adminEmail}" já existe; senha preservada`)
    return
  } else {
    const password = generatePassword()
    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: {
        tenant_id: tenant.id,
        name: adminName,
        email: adminEmail,
        password_hash: passwordHash,
        status: 'ACTIVE',
        user_roles: { create: { role_id: role.id } },
      },
    })
    console.log(`✅ Usuário "${adminEmail}" criado`)
    console.log(`Tenant slug: ${tenantSlug}`)
    console.log(`E-mail: ${adminEmail}`)
    console.log(`Senha: ${password}`)
    console.log('Salve a senha em local seguro; ela não será exibida novamente.')
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
