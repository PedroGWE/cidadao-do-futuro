import { BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { createHash } from 'crypto'
import { Prisma, TransferegovEntityType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { ConfigureTransferegovDto, ImportTransferegovDto } from './dto/transferegov.dto'
import { OfficialRecord, TransferegovClient } from './transferegov.client'

const SOURCE = 'TRANSFEREGOV_PUBLIC_API'
const MODULE = 'GESTAO_PARCERIAS'
const TRACKED_FIELDS = ['official_status', 'global_amount', 'signed_at', 'valid_until'] as const

export function normalizeCnpj(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeCnpj(value)
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false
  const digit = (length: number) => {
    let sum = 0
    let weight = length - 7
    for (let i = 0; i < length; i += 1) {
      sum += Number(cnpj[i]) * weight--
      if (weight < 2) weight = 9
    }
    const result = 11 - (sum % 11)
    return result > 9 ? 0 : result
  }
  return digit(12) === Number(cnpj[12]) && digit(13) === Number(cnpj[13])
}

function asString(value: unknown): string | null {
  return value === null || value === undefined || value === '' ? null : String(value)
}

function asDate(value: unknown): Date | null {
  const text = asString(value)
  if (!text) return null
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date
}

function asDecimal(value: unknown): Prisma.Decimal | null {
  if (value === null || value === undefined || value === '') return null
  try { return new Prisma.Decimal(String(value)) } catch { return null }
}

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

@Injectable()
export class TransferegovService implements OnModuleInit, OnModuleDestroy {
  private scheduler?: NodeJS.Timeout

  constructor(private readonly prisma: PrismaService, private readonly client: TransferegovClient) {}

  async onModuleInit() {
    await this.prisma.transferegovIntegration.updateMany({
      where: { status: 'SYNCING', last_attempt_at: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
      data: { status: 'ERROR', last_error: 'Execução anterior interrompida; uma nova tentativa pode ser iniciada.' },
    })
    this.scheduler = setInterval(() => void this.runDue(), 15 * 60 * 1000)
    this.scheduler.unref()
    void this.runDue()
  }

  onModuleDestroy() { if (this.scheduler) clearInterval(this.scheduler) }

  async getConfiguration(tenantId: string) {
    const [integration, tenant, profile] = await Promise.all([
      this.prisma.transferegovIntegration.findUnique({ where: { tenant_id: tenantId } }),
      this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { cnpj: true } }),
      this.prisma.organizationProfile.findUnique({ where: { tenant_id: tenantId }, select: { documento: true, tipo_documento: true } }),
    ])
    const institutionalCnpj = tenant?.cnpj ?? (profile?.tipo_documento === 'CNPJ' ? profile.documento : null)
    return { integration, institutional_cnpj: institutionalCnpj ? normalizeCnpj(institutionalCnpj) : null }
  }

  async configure(tenantId: string, dto: ConfigureTransferegovDto) {
    const cnpj = normalizeCnpj(dto.cnpj)
    if (!isValidCnpj(cnpj)) throw new BadRequestException('Informe um CNPJ válido com 14 dígitos.')
    const interval = dto.sync_interval_hours ?? 24
    const next = dto.automatic_sync ? new Date(Date.now() + interval * 3600000) : null
    return this.prisma.transferegovIntegration.upsert({
      where: { tenant_id: tenantId },
      create: { tenant_id: tenantId, cnpj, automatic_sync: dto.automatic_sync, sync_interval_hours: interval, next_sync_at: next },
      update: { cnpj, automatic_sync: dto.automatic_sync, sync_interval_hours: interval, next_sync_at: next, status: 'READY', last_error: null },
    })
  }

  async discover(tenantId: string, userId: string) {
    const run = await this.startRun(tenantId, 'DISCOVERY')
    await this.execute(run.id, tenantId, userId)
    const finished = await this.prisma.transferegovSyncRun.findFirst({ where: { id: run.id, tenant_id: tenantId } })
    if (finished?.status === 'FAILED') throw new BadRequestException(finished.error_message)
    return { run: finished, records: await this.listRecords(tenantId) }
  }

  async enqueue(tenantId: string, trigger: string, userId?: string) {
    const run = await this.startRun(tenantId, trigger)
    setImmediate(() => void this.execute(run.id, tenantId, userId))
    return run
  }

  async listRecords(tenantId: string) {
    return this.prisma.transferegovRecord.findMany({
      where: { tenant_id: tenantId },
      include: { project: { select: { id: true, name: true } }, changes: { orderBy: { detected_at: 'desc' }, take: 20 } },
      orderBy: [{ proposal_year: 'desc' }, { collected_at: 'desc' }],
    })
  }

  history(tenantId: string) {
    return this.prisma.transferegovSyncRun.findMany({ where: { tenant_id: tenantId }, orderBy: { created_at: 'desc' }, take: 50 })
  }

  async linkRecord(tenantId: string, recordId: string, projectId: string) {
    const [record, project] = await Promise.all([
      this.prisma.transferegovRecord.findFirst({ where: { id: recordId, tenant_id: tenantId } }),
      this.prisma.project.findFirst({ where: { id: projectId, tenant_id: tenantId, deleted_at: null } }),
    ])
    if (!record || !project) throw new NotFoundException('Registro externo ou projeto não encontrado nesta organização.')
    return this.prisma.transferegovRecord.update({ where: { id: record.id }, data: { project_id: project.id, imported_at: new Date() } })
  }

  async importRecords(tenantId: string, userId: string, dto: ImportTransferegovDto) {
    const records = await this.prisma.transferegovRecord.findMany({ where: { tenant_id: tenantId, id: { in: dto.record_ids } } })
    if (records.length !== new Set(dto.record_ids).size) throw new NotFoundException('Um ou mais registros não pertencem a esta organização.')
    let targetProjectId = dto.project_id
    if (targetProjectId) {
      const exists = await this.prisma.project.count({ where: { id: targetProjectId, tenant_id: tenantId, deleted_at: null } })
      if (!exists) throw new NotFoundException('Projeto de destino não encontrado nesta organização.')
    }
    const result: Array<{ record_id: string; project_id: string }> = []
    for (const record of records.sort((a, b) => a.entity_type === 'PROPOSTA' ? -1 : b.entity_type === 'PROPOSTA' ? 1 : 0)) {
      let projectId = targetProjectId ?? record.project_id
      if (!projectId && record.proposal_external_id) {
        projectId = (await this.prisma.transferegovRecord.findFirst({
          where: { tenant_id: tenantId, proposal_external_id: record.proposal_external_id, project_id: { not: null } },
          select: { project_id: true },
        }))?.project_id ?? null
      }
      if (!projectId) {
        const project = await this.prisma.project.create({
          data: {
            tenant_id: tenantId,
            created_by: userId,
            name: record.title ?? `Registro Transferegov ${record.external_id}`,
            description: 'Projeto vinculado a dados públicos oficiais do Transferegov. Campos operacionais internos permanecem independentes.',
            type: 'OUTROS',
            status: 'RASCUNHO',
            code: `TG-${record.entity_type === 'PROPOSTA' ? 'P' : 'I'}-${record.external_id}`,
            tags: ['Transferegov'],
            members: { create: { user_id: userId, role: 'GESTOR' } },
          },
        })
        projectId = project.id
      }
      await this.prisma.transferegovRecord.update({ where: { id: record.id }, data: { project_id: projectId, imported_at: new Date() } })
      if (record.proposal_external_id) {
        await this.prisma.transferegovRecord.updateMany({
          where: { tenant_id: tenantId, proposal_external_id: record.proposal_external_id, project_id: null },
          data: { project_id: projectId, imported_at: new Date() },
        })
      }
      result.push({ record_id: record.id, project_id: projectId })
      targetProjectId ??= projectId
    }
    return result
  }

  private async startRun(tenantId: string, trigger: string) {
    const integration = await this.prisma.transferegovIntegration.findUnique({ where: { tenant_id: tenantId } })
    if (!integration) throw new BadRequestException('Configure o CNPJ da integração antes de consultar.')
    const claimed = await this.prisma.transferegovIntegration.updateMany({
      where: { id: integration.id, status: { not: 'SYNCING' } },
      data: { status: 'SYNCING', last_attempt_at: new Date(), last_error: null },
    })
    if (!claimed.count) throw new ConflictException('Já existe uma sincronização em andamento para esta organização.')
    return this.prisma.transferegovSyncRun.create({ data: { tenant_id: tenantId, integration_id: integration.id, trigger, status: 'RUNNING', started_at: new Date() } })
  }

  private async execute(runId: string, tenantId: string, userId?: string) {
    const integration = await this.prisma.transferegovIntegration.findUnique({ where: { tenant_id: tenantId } })
    if (!integration) return
    let consulted = 0, created = 0, updated = 0, ignored = 0, rejected = 0
    try {
      const [proposals, referenceDate] = await Promise.all([this.client.proposalsByCnpj(integration.cnpj), this.client.referenceDate()])
      const partnerships: OfficialRecord[] = []
      for (const proposal of proposals) {
        const id = asString(proposal.id_proposta)
        if (!id) { rejected += 1; continue }
        partnerships.push(...await this.client.partnershipsByProposal(id))
      }
      for (const [type, records] of [['PROPOSTA', proposals], ['INSTRUMENTO', partnerships]] as const) {
        for (const raw of records) {
          consulted += 1
          const outcome = await this.upsertOfficial(tenantId, type, raw, referenceDate, userId)
          if (outcome === 'created') created += 1
          else if (outcome === 'updated') updated += 1
          else if (outcome === 'ignored') ignored += 1
          else rejected += 1
        }
      }
      const now = new Date()
      await this.prisma.$transaction([
        this.prisma.transferegovSyncRun.update({ where: { id: runId }, data: { status: rejected ? 'PARTIAL' : 'SUCCEEDED', completed_at: now, source_reference_at: referenceDate, consulted, created_count: created, updated_count: updated, ignored_count: ignored, rejected_count: rejected } }),
        this.prisma.transferegovIntegration.update({ where: { id: integration.id }, data: { status: 'READY', last_success_at: now, last_error: null, next_sync_at: integration.automatic_sync ? new Date(now.getTime() + integration.sync_interval_hours * 3600000) : null } }),
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await this.prisma.$transaction([
        this.prisma.transferegovSyncRun.update({ where: { id: runId }, data: { status: 'FAILED', completed_at: new Date(), consulted, created_count: created, updated_count: updated, ignored_count: ignored, rejected_count: rejected, error_message: message } }),
        this.prisma.transferegovIntegration.update({ where: { id: integration.id }, data: { status: 'ERROR', last_error: message, next_sync_at: integration.automatic_sync ? new Date(Date.now() + 3600000) : null } }),
      ])
    }
  }

  private async upsertOfficial(tenantId: string, type: TransferegovEntityType, raw: OfficialRecord, referenceDate: Date | null, userId?: string) {
    const externalId = asString(type === 'PROPOSTA' ? raw.id_proposta : raw.id_parceria)
    if (!externalId) return 'rejected' as const
    const proposalId = asString(raw.id_proposta) ?? (type === 'PROPOSTA' ? externalId : null)
    const mapped = {
      proposal_external_id: proposalId,
      program_external_id: asString(raw.id_programa),
      proposal_number: null,
      proposal_year: raw.ano_proposta == null ? null : Number(raw.ano_proposta),
      instrument_number: type === 'INSTRUMENTO' ? asString(raw.cd_parceria) : null,
      instrument_type: type === 'INSTRUMENTO' ? asString(raw.tp_origem) : null,
      title: asString(raw.ds_objeto),
      proponent_name: asString(raw.nm_ente_recebedor),
      proponent_cnpj: asString(raw.cnpj_ente_recebedor),
      grantor_name: asString(raw.nm_unidade_gestora),
      program_name: null,
      official_status: asString(type === 'PROPOSTA' ? raw.situacao_proposta : raw.in_situacao_parceria),
      global_amount: type === 'PROPOSTA' ? asDecimal(raw.nr_vlr_total) : null,
      signed_at: type === 'INSTRUMENTO' ? asDate(raw.dh_assinatura) : null,
      valid_from: null,
      valid_until: null,
      official_url: null,
    }
    const hash = createHash('sha256').update(JSON.stringify(raw)).digest('hex')
    const where = { tenant_id_source_source_module_entity_type_external_id: { tenant_id: tenantId, source: SOURCE, source_module: MODULE, entity_type: type, external_id: externalId } }
    const existing = await this.prisma.transferegovRecord.findUnique({ where })
    if (existing?.content_hash === hash) {
      await this.prisma.transferegovRecord.update({ where: { id: existing.id }, data: { collected_at: new Date(), last_success_at: new Date(), source_reference_at: referenceDate } })
      return 'ignored' as const
    }
    if (!existing) {
      await this.prisma.transferegovRecord.create({ data: { tenant_id: tenantId, source: SOURCE, source_module: MODULE, entity_type: type, external_id: externalId, ...mapped, source_reference_at: referenceDate, content_hash: hash, raw_data: json(raw) } })
      await this.notify(tenantId, userId, 'TRANSFEREGOV_NEW_RECORD', 'Novo registro encontrado no Transferegov', `${type === 'PROPOSTA' ? 'Proposta' : 'Instrumento'} ${externalId} localizado para o CNPJ configurado.`, externalId, referenceDate)
      return 'created' as const
    }
    for (const field of TRACKED_FIELDS) {
      const before = existing[field]
      const after = mapped[field]
      if (String(before ?? '') !== String(after ?? '')) {
        await this.prisma.transferegovChange.create({ data: { tenant_id: tenantId, record_id: existing.id, field_name: field, old_value: before == null ? Prisma.JsonNull : json(String(before)), new_value: after == null ? Prisma.JsonNull : json(String(after)) } })
        await this.notify(tenantId, userId, `TRANSFEREGOV_${field.toUpperCase()}_CHANGED`, 'Alteração detectada no Transferegov', `O campo ${field} do registro ${externalId} foi alterado na fonte oficial.`, externalId, referenceDate)
      }
    }
    await this.prisma.transferegovRecord.update({ where: { id: existing.id }, data: { ...mapped, source_reference_at: referenceDate, collected_at: new Date(), last_success_at: new Date(), content_hash: hash, raw_data: json(raw) } })
    return 'updated' as const
  }

  private notify(tenantId: string, userId: string | undefined, type: string, title: string, body: string, externalId: string, referenceDate: Date | null) {
    return this.prisma.notification.create({ data: { tenant_id: tenantId, user_id: userId, type, title, body, data: json({ origin: 'TRANSFEREGOV', external_id: externalId, reference_date: referenceDate?.toISOString() ?? null, nature: 'SEMEVO_CALCULATED_ALERT' }) } })
  }

  private async runDue() {
    const due = await this.prisma.transferegovIntegration.findMany({ where: { automatic_sync: true, status: { not: 'SYNCING' }, OR: [{ next_sync_at: null }, { next_sync_at: { lte: new Date() } }] }, select: { tenant_id: true } })
    for (const item of due) {
      try { await this.enqueue(item.tenant_id, 'SCHEDULED') } catch { /* outra instância pode ter obtido o bloqueio */ }
    }
  }
}
