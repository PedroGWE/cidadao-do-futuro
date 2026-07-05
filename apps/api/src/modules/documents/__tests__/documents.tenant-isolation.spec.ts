import { NotFoundException } from '@nestjs/common'
import { DocumentsService } from '../documents.service'

/**
 * Isolamento multi-tenant: toda leitura/escrita é filtrada por tenant_id,
 * então um tenant nunca enxerga ou altera documentos de outro.
 */
describe('DocumentsService — isolamento multi-tenant', () => {
  function makePrisma() {
    return {
      institutionalDocCategory: {
        count: jest.fn().mockResolvedValue(4),
        findMany: jest.fn().mockResolvedValue([]),
      },
      institutionalDocType: { count: jest.fn().mockResolvedValue(0) },
      institutionalDocument: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        count: jest.fn().mockResolvedValue(0),
        findFirst: jest.fn().mockResolvedValue(null),
      },
    }
  }

  it('list filtra categorias e documentos pelo tenant autenticado', async () => {
    const prisma = makePrisma()
    const service = new DocumentsService(prisma as any, {} as any)

    await service.list('tenant-a', {})

    const args = prisma.institutionalDocCategory.findMany.mock.calls[0][0]
    expect(args.where.tenant_id).toBe('tenant-a')
    // documentos aninhados também são filtrados por tenant (defesa em profundidade)
    expect(args.select.types.select.documents.where).toEqual({ tenant_id: 'tenant-a' })
  })

  it('remove nega acesso a documento de outro tenant', async () => {
    const prisma = makePrisma()
    const service = new DocumentsService(prisma as any, {} as any)

    await expect(service.remove('tenant-b', 'doc-do-tenant-a')).rejects.toBeInstanceOf(
      NotFoundException,
    )
    expect(prisma.institutionalDocument.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'doc-do-tenant-a', tenant_id: 'tenant-b' } }),
    )
  })

  it('download nega acesso a documento de outro tenant', async () => {
    const prisma = makePrisma()
    const service = new DocumentsService(prisma as any, {} as any)

    await expect(service.getDownload('tenant-b', 'doc-do-tenant-a')).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })
})
