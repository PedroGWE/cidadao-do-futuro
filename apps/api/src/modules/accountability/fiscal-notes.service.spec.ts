import { Prisma } from '@prisma/client'
import { FiscalNotesService } from './fiscal-notes.service'
import { PrismaService } from '../prisma/prisma.service'
import { FocusNfseClient } from './focus-nfse.client'
import { StorageService } from '../documents/storage/storage.service'

const config = { token: 'secret', cnpj: '11222333000181', municipio_ibge: '5300108', environment: 'HOMOLOGACAO' as const,
  webhook_secret: 'segredo-de-webhook-com-mais-de-32-caracteres' }

function setup() {
  const note = { id: 'note-1', tenant_id: 'tenant-a', report_id: 'report-1', transaction_id: 'tx-1',
    reference: 'amparo-reference', status: 'RASCUNHO', environment: 'HOMOLOGACAO', issuer_cnpj: config.cnpj,
    issuer_city_code: config.municipio_ibge, amount: new Prisma.Decimal(100),
    competence_date: new Date('2026-10-07'), customer_document: '11222333000181',
    customer_name: 'Tomador', customer_city_code: '5300108', customer_zip: '70000000',
    customer_street: 'Rua teste', customer_number: '1', customer_district: 'Centro', customer_email: null,
    service_city_code: '5300108', service_code: '010701', nbs_code: null, service_description: 'Serviço de teste',
    simples_code: '1', special_regime_code: '0', iss_code: '1', iss_withholding_code: '1', municipal_service_code: null }
  const db = {
    tenant: { findFirst: jest.fn().mockResolvedValue({ cnpj: config.cnpj }) },
    accountabilityReport: { findFirst: jest.fn().mockResolvedValue({ id: 'report-1', status: 'RASCUNHO' }) },
    transaction: { findFirst: jest.fn().mockResolvedValue({ type: 'RECEITA', status: 'APROVADO', amount: new Prisma.Decimal(100) }) },
    accountabilityItem: { findFirst: jest.fn().mockResolvedValue({ id: 'item-1' }) },
    fiscalNote: { findFirst: jest.fn().mockResolvedValue(note), updateMany: jest.fn().mockResolvedValue({ count: 1 }), update: jest.fn(),
      findUniqueOrThrow: jest.fn().mockResolvedValue(note) },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
    $transaction: jest.fn(),
  }
  db.$transaction.mockImplementation(async (callback) => callback(db))
  const focus = { config: jest.fn().mockReturnValue(config), issue: jest.fn(), get: jest.fn(), cancel: jest.fn() }
  const storage = { save: jest.fn(), readStream: jest.fn() }
  const service = new FiscalNotesService(db as unknown as PrismaService, focus as unknown as FocusNfseClient, storage as unknown as StorageService)
  return { db, focus, service }
}

describe('NFS-e: controle de emissão', () => {
  it('não consulta nota de outra organização', async () => {
    const { db, service, focus } = setup()
    db.fiscalNote.findFirst.mockResolvedValue(null)
    await expect(service.issue('tenant-b', 'report-1', 'note-1', 'user-1')).rejects.toThrow()
    expect(focus.issue).not.toHaveBeenCalled()
    expect(db.fiscalNote.findFirst).toHaveBeenCalledWith({ where: { id: 'note-1', report_id: 'report-1', tenant_id: 'tenant-b' } })
  })

  it('impede segundo POST ao provedor se a nota já foi reivindicada', async () => {
    const { db, service, focus } = setup()
    db.fiscalNote.updateMany.mockResolvedValue({ count: 0 })
    await expect(service.issue('tenant-a', 'report-1', 'note-1', 'user-1')).rejects.toThrow('já enviada')
    expect(focus.issue).not.toHaveBeenCalled()
  })

  it('em timeout preserva referência e exige consulta antes de novo envio', async () => {
    const { db, service, focus } = setup()
    focus.issue.mockRejectedValue(new Error('timeout'))
    await expect(service.issue('tenant-a', 'report-1', 'note-1', 'user-1')).rejects.toThrow('timeout')
    expect(db.fiscalNote.update).toHaveBeenCalledWith({ where: { id: 'note-1' }, data: expect.objectContaining({ status: 'CONSULTA_PENDENTE' }) })
    expect(db.fiscalNote.updateMany).toHaveBeenCalledTimes(1)
  })

  it('cancela somente nota autorizada com justificativa e registra auditoria', async () => {
    const { db, service, focus } = setup()
    const authorized = { ...await db.fiscalNote.findFirst(), status: 'AUTORIZADA', issued_at: new Date(), cancelled_at: null }
    db.fiscalNote.findFirst.mockResolvedValue(authorized)
    db.fiscalNote.findUniqueOrThrow.mockResolvedValue({ ...authorized, status: 'CANCELANDO' })
    db.fiscalNote.update.mockResolvedValue({ ...authorized, status: 'CANCELADA' })
    focus.cancel.mockResolvedValue({ status: 'cancelado', ref: authorized.reference, cnpj_prestador: config.cnpj })
    await service.cancel('tenant-a', 'report-1', 'note-1', 'user-1', 'Emissão realizada com dados incorretos')
    expect(focus.cancel).toHaveBeenCalledWith(config, authorized.reference, 'Emissão realizada com dados incorretos')
    expect(db.auditLog.create).toHaveBeenCalledWith({ data: expect.objectContaining({ action: 'NFSE_CANCELAMENTO_SOLICITADO' }) })
  })

  it('recusa webhook sem o segredo específico do instituto', async () => {
    const { service } = setup()
    await expect(service.webhook('tenant-a', 'segredo-incorreto', { ref: 'amparo-reference', status: 'autorizado' }))
      .rejects.toThrow('não autorizado')
  })

  it('não regride nota autorizada quando chega webhook antigo de processamento', async () => {
    const { db, service } = setup()
    const authorized = { ...await db.fiscalNote.findFirst(), status: 'AUTORIZADA', issued_at: new Date(), cancelled_at: null }
    db.fiscalNote.findFirst.mockResolvedValue(authorized)
    db.fiscalNote.findUniqueOrThrow.mockResolvedValue(authorized)
    db.fiscalNote.update.mockResolvedValue(authorized)
    await service.webhook('tenant-a', config.webhook_secret, { ref: authorized.reference, status: 'processando_autorizacao', cnpj_prestador: config.cnpj })
    expect(db.fiscalNote.update).toHaveBeenNthCalledWith(1, { where: { id: authorized.id }, data: expect.objectContaining({ status: 'AUTORIZADA' }) })
    expect(db.auditLog.create).toHaveBeenCalledWith({ data: expect.objectContaining({ action: 'NFSE_WEBHOOK_RECEBIDO' }) })
  })

  it('recusa webhook cujo CNPJ não corresponde ao emissor do instituto', async () => {
    const { db, service } = setup()
    const authorized = { ...await db.fiscalNote.findFirst(), status: 'PROCESSANDO', issued_at: null, cancelled_at: null }
    db.fiscalNote.findFirst.mockResolvedValue(authorized)
    db.fiscalNote.findUniqueOrThrow.mockResolvedValue(authorized)
    await expect(service.webhook('tenant-a', config.webhook_secret,
      { ref: authorized.reference, status: 'autorizado', cnpj_prestador: '00999999000199' })).rejects.toThrow('não corresponde')
  })
})
