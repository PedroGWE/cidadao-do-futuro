import { OrganizationDocumentStatus } from '@prisma/client'
import { DocumentsService, statusForValidity } from '../documents.service'

const NOW = new Date('2026-07-05T12:00:00Z')

describe('statusForValidity', () => {
  it('retorna VALIDO quando não há data de validade', () => {
    expect(statusForValidity(null, NOW)).toBe(OrganizationDocumentStatus.VALIDO)
  })

  it('retorna VALIDO quando a validade é futura', () => {
    expect(statusForValidity(new Date('2026-12-31'), NOW)).toBe(OrganizationDocumentStatus.VALIDO)
  })

  it('retorna VENCIDO quando a validade já passou', () => {
    expect(statusForValidity(new Date('2026-01-01'), NOW)).toBe(OrganizationDocumentStatus.VENCIDO)
  })
})

describe('DocumentsService.refreshExpired', () => {
  it('marca como VENCIDO apenas documentos VALIDOs do tenant com validade passada', async () => {
    const prisma = {
      institutionalDocument: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    }
    const service = new DocumentsService(prisma as any, {} as any)

    await service.refreshExpired('tenant-a', NOW)

    expect(prisma.institutionalDocument.updateMany).toHaveBeenCalledWith({
      where: {
        tenant_id: 'tenant-a',
        status: OrganizationDocumentStatus.VALIDO,
        valid_until: { lt: NOW },
      },
      data: { status: OrganizationDocumentStatus.VENCIDO },
    })
  })
})

describe('DocumentsService.summary', () => {
  it('calcula pendentes como tipos sem documento enviado', async () => {
    const prisma = {
      institutionalDocCategory: { count: jest.fn().mockResolvedValue(4) },
      institutionalDocType: { count: jest.fn().mockResolvedValue(13) },
      institutionalDocument: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        count: jest
          .fn()
          .mockResolvedValueOnce(5) // VALIDO
          .mockResolvedValueOnce(2), // VENCIDO
      },
    }
    const service = new DocumentsService(prisma as any, {} as any)

    await expect(service.summary('tenant-a')).resolves.toEqual({
      validos: 5,
      vencidos: 2,
      pendentes: 6,
    })
  })
})
