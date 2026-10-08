import { BadGatewayException, BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common'
import { FiscalNote, FiscalNoteStatus, Prisma, TransactionType } from '@prisma/client'
import { isValidCpfCnpj, onlyDigits } from '@cidadao/shared'
import { randomUUID } from 'node:crypto'
import { timingSafeEqual } from 'node:crypto'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../documents/storage/storage.service'
import { FiscalNoteDto } from './dto/fiscal-note.dto'
import { FocusNfseClient, FocusRejectedError, FocusResult, FocusTenantConfig } from './focus-nfse.client'

const DRAFT_REPORT_STATUSES = ['RASCUNHO', 'PENDENTE_CORRECAO']

@Injectable()
export class FiscalNotesService {
  constructor(private prisma: PrismaService, private focus: FocusNfseClient, private storage: StorageService) {}

  async configStatus(tenantId: string) {
    const config = this.focus.config(tenantId)
    if (!config) return { configured: false, message: 'Configure a integração fiscal do instituto no servidor.' }
    const tenant = await this.prisma.tenant.findFirst({ where: { id: tenantId }, select: { cnpj: true } })
    const matches = onlyDigits(tenant?.cnpj ?? '') === config.cnpj
    return { configured: matches, environment: config.environment, issuer_cnpj: config.cnpj,
      issuer_city_code: config.municipio_ibge,
      webhook_configured: Boolean(config.webhook_secret),
      ...(!matches && { message: 'O CNPJ cadastrado no instituto deve coincidir com o CNPJ emissor da integração.' }) }
  }

  private async issuer(tenantId: string): Promise<FocusTenantConfig> {
    const config = this.focus.config(tenantId)
    if (!config) throw new ServiceUnavailableException('Integração de NFS-e não configurada para este instituto')
    const tenant = await this.prisma.tenant.findFirst({ where: { id: tenantId }, select: { cnpj: true } })
    if (onlyDigits(tenant?.cnpj ?? '') !== config.cnpj) {
      throw new BadRequestException('CNPJ do instituto e da credencial fiscal não coincidem')
    }
    return config
  }

  async list(tenantId: string, reportId: string) {
    await this.report(tenantId, reportId)
    return this.prisma.fiscalNote.findMany({ where: { tenant_id: tenantId, report_id: reportId },
      select: { id: true, transaction_id: true, status: true, environment: true, customer_name: true,
        amount: true, number: true, access_key: true, provider_message: true, created_at: true,
        issued_at: true, cancelled_at: true, cancellation_reason: true,
        xml_storage_key: true, pdf_storage_key: true }, orderBy: { created_at: 'desc' } })
  }

  private async report(tenantId: string, reportId: string) {
    const report = await this.prisma.accountabilityReport.findFirst({ where: { id: reportId, tenant_id: tenantId } })
    if (!report) throw new NotFoundException('Prestação de contas não encontrada')
    return report
  }

  private async note(tenantId: string, reportId: string, noteId: string) {
    const note = await this.prisma.fiscalNote.findFirst({ where: { id: noteId, report_id: reportId, tenant_id: tenantId } })
    if (!note) throw new NotFoundException('NFS-e não encontrada')
    return note
  }

  private async validateInput(tenantId: string, reportId: string, dto: FiscalNoteDto, config: FocusTenantConfig) {
    const report = await this.report(tenantId, reportId)
    if (!DRAFT_REPORT_STATUSES.includes(report.status)) throw new ConflictException('A prestação está fechada para inclusão de notas')
    if (!isValidCpfCnpj(dto.customer_document)) throw new BadRequestException('CPF/CNPJ do tomador inválido')
    const tx = await this.prisma.transaction.findFirst({ where: { id: dto.transaction_id, tenant_id: tenantId },
      select: { id: true, type: true, status: true, amount: true, date: true } })
    if (!tx || tx.type !== TransactionType.RECEITA || !['APROVADO', 'PAGO'].includes(tx.status)) {
      throw new BadRequestException('Vincule uma receita aprovada ou paga deste instituto')
    }
    const item = await this.prisma.accountabilityItem.findFirst({ where: { report_id: reportId, transaction_id: tx.id } })
    if (!item) throw new BadRequestException('Consolide a receita nesta prestação antes de emitir a nota')
    if (tx.amount.lte(0)) throw new BadRequestException('A receita deve ser maior que zero')
    const competence = new Date(`${dto.competence_date}T00:00:00.000Z`)
    if (Number.isNaN(competence.getTime()) || competence.toISOString().slice(0, 10) !== dto.competence_date) {
      throw new BadRequestException('Data de competência inválida')
    }
    if (competence < new Date(report.period_start.toISOString().slice(0, 10)) ||
      competence > new Date(report.period_end.toISOString().slice(0, 10))) {
      throw new BadRequestException('A competência deve pertencer ao período da prestação')
    }
    return { tx, competence, config }
  }

  private fields(dto: FiscalNoteDto, competence: Date) {
    return {
      customer_document: onlyDigits(dto.customer_document), customer_name: dto.customer_name.trim(),
      customer_city_code: dto.customer_city_code, customer_zip: dto.customer_zip,
      customer_street: dto.customer_street.trim(), customer_number: dto.customer_number.trim(),
      customer_district: dto.customer_district.trim(), customer_email: dto.customer_email || null,
      service_city_code: dto.service_city_code, service_code: dto.service_code,
      nbs_code: dto.nbs_code || null, service_description: dto.service_description.trim(),
      competence_date: competence, simples_code: dto.simples_code,
      special_regime_code: dto.special_regime_code, iss_code: dto.iss_code,
      iss_withholding_code: dto.iss_withholding_code, municipal_service_code: dto.municipal_service_code || null,
    }
  }

  async create(tenantId: string, reportId: string, userId: string, dto: FiscalNoteDto) {
    const config = await this.issuer(tenantId)
    const { tx, competence } = await this.validateInput(tenantId, reportId, dto, config)
    try {
      return await this.prisma.fiscalNote.create({ data: {
        tenant_id: tenantId, report_id: reportId, transaction_id: tx.id,
        reference: `amparo-${randomUUID()}`, issuer_cnpj: config.cnpj,
        issuer_city_code: config.municipio_ibge, environment: config.environment,
        amount: tx.amount, created_by: userId, ...this.fields(dto, competence),
      } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Esta receita já possui uma NFS-e nesta organização')
      }
      throw error
    }
  }

  async update(tenantId: string, reportId: string, noteId: string, dto: FiscalNoteDto) {
    const config = await this.issuer(tenantId)
    const note = await this.note(tenantId, reportId, noteId)
    if (!['RASCUNHO', 'REJEITADA'].includes(note.status) || dto.transaction_id !== note.transaction_id) {
      throw new ConflictException('Somente rascunhos ou notas rejeitadas podem ser corrigidos')
    }
    const { competence } = await this.validateInput(tenantId, reportId, dto, config)
    const changed = await this.prisma.fiscalNote.updateMany({ where: { id: note.id, tenant_id: tenantId, status: note.status }, data: {
      ...this.fields(dto, competence), status: 'RASCUNHO', provider_message: null,
      ...(note.status === 'REJEITADA' && { reference: `amparo-${randomUUID()}` }),
    } })
    if (changed.count !== 1) throw new ConflictException('A nota mudou de situação; atualize a página')
    return this.note(tenantId, reportId, noteId)
  }

  private payload(note: FiscalNote) {
    return {
      data_emissao: new Date().toISOString(), data_competencia: note.competence_date.toISOString().slice(0, 10),
      codigo_municipio_emissora: Number(note.issuer_city_code), cnpj_prestador: note.issuer_cnpj,
      codigo_opcao_simples_nacional: note.simples_code, regime_especial_tributacao: note.special_regime_code,
      ...(note.customer_document.length === 14 ? { cnpj_tomador: note.customer_document } : { cpf_tomador: note.customer_document }),
      razao_social_tomador: note.customer_name, codigo_municipio_tomador: Number(note.customer_city_code),
      cep_tomador: note.customer_zip, logradouro_tomador: note.customer_street,
      numero_tomador: note.customer_number, bairro_tomador: note.customer_district,
      ...(note.customer_email && { email_tomador: note.customer_email }),
      codigo_municipio_prestacao: Number(note.service_city_code), codigo_tributacao_nacional_iss: note.service_code,
      ...(note.municipal_service_code && { codigo_tributacao_municipal_iss: note.municipal_service_code }),
      ...(note.nbs_code && { codigo_nbs: note.nbs_code }),
      descricao_servico: note.service_description, valor_servico: Number(note.amount),
      tributacao_iss: Number(note.iss_code), tipo_retencao_iss: Number(note.iss_withholding_code),
    }
  }

  async issue(tenantId: string, reportId: string, noteId: string, userId: string) {
    const config = await this.issuer(tenantId)
    const note = await this.note(tenantId, reportId, noteId)
    if (note.environment !== config.environment || note.issuer_cnpj !== config.cnpj || note.issuer_city_code !== config.municipio_ibge) {
      throw new ConflictException('A configuração fiscal mudou; revise o rascunho com suporte')
    }
    const report = await this.report(tenantId, reportId)
    if (!DRAFT_REPORT_STATUSES.includes(report.status)) throw new ConflictException('Prestação fechada para emissão')
    const transaction = await this.prisma.transaction.findFirst({ where: { id: note.transaction_id, tenant_id: tenantId }, select: { type: true, status: true, amount: true } })
    if (!transaction || transaction.type !== TransactionType.RECEITA || !['APROVADO', 'PAGO'].includes(transaction.status) || !transaction.amount.equals(note.amount)) {
      throw new ConflictException('A receita foi alterada ou cancelada; confira o vínculo antes de emitir')
    }
    const item = await this.prisma.accountabilityItem.findFirst({ where: { report_id: reportId, transaction_id: note.transaction_id } })
    if (!item) throw new ConflictException('A receita não consta mais na prestação')
    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.fiscalNote.updateMany({ where: { id: noteId, tenant_id: tenantId, status: 'RASCUNHO' }, data: { status: 'ENVIANDO', provider_message: null } })
      if (claimed.count !== 1) throw new ConflictException('NFS-e já enviada ou em processamento')
      await tx.auditLog.create({ data: { tenant_id: tenantId, user_id: userId, action: 'NFSE_ENVIO', resource: 'FiscalNote', resource_id: noteId, new_value: { reference: note.reference, environment: note.environment } } })
    })
    try {
      const result = await this.focus.issue(config, note.reference, this.payload(note))
      await this.saveResult(noteId, config, result)
    } catch (error) {
      if (error instanceof FocusRejectedError) {
        await this.prisma.fiscalNote.update({ where: { id: noteId }, data: { status: 'RASCUNHO', provider_message: error.message } })
      } else {
        // Timeout/5xx pode ter sido recebido pelo provedor. Consultar pelo ref antes de reenviar.
        await this.prisma.fiscalNote.update({ where: { id: noteId }, data: { status: 'CONSULTA_PENDENTE', provider_message: 'Envio incerto. Consulte a referência antes de qualquer nova tentativa.' } })
      }
      throw error
    }
    return this.note(tenantId, reportId, noteId)
  }

  async sync(tenantId: string, reportId: string, noteId: string) {
    const config = await this.issuer(tenantId)
    const note = await this.note(tenantId, reportId, noteId)
    if (note.environment !== config.environment || note.issuer_cnpj !== config.cnpj) throw new ConflictException('Configuração fiscal mudou')
    if (note.status === 'RASCUNHO') throw new BadRequestException('Rascunho ainda não enviado')
    if (note.status === 'ENVIANDO' && Date.now() - note.updated_at.getTime() < 20000) {
      throw new ConflictException('Envio em andamento; consulte novamente em instantes')
    }
    const result = await this.focus.get(config, note.reference)
    await this.saveResult(noteId, config, result)
    return this.note(tenantId, reportId, noteId)
  }

  async cancel(tenantId: string, reportId: string, noteId: string, userId: string, justification: string) {
    const config = await this.issuer(tenantId)
    const note = await this.note(tenantId, reportId, noteId)
    if (note.status !== 'AUTORIZADA') throw new ConflictException('Somente NFS-e autorizada pode ser cancelada')
    if (note.environment !== config.environment || note.issuer_cnpj !== config.cnpj) {
      throw new ConflictException('Configuração fiscal mudou; confirme o emissor antes de cancelar')
    }
    const reason = justification.trim()
    if (reason.length < 15 || reason.length > 255) throw new BadRequestException('A justificativa deve ter entre 15 e 255 caracteres')
    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.fiscalNote.updateMany({ where: { id: noteId, tenant_id: tenantId, status: 'AUTORIZADA' }, data: {
        status: 'CANCELANDO', cancellation_reason: reason, cancel_requested_at: new Date(), provider_message: null,
      } })
      if (claimed.count !== 1) throw new ConflictException('Cancelamento já solicitado ou situação da nota alterada')
      await tx.auditLog.create({ data: { tenant_id: tenantId, user_id: userId, action: 'NFSE_CANCELAMENTO_SOLICITADO',
        resource: 'FiscalNote', resource_id: noteId, new_value: { reference: note.reference, justification: reason, environment: note.environment } } })
    })
    try {
      const result = await this.focus.cancel(config, note.reference, reason)
      await this.saveResult(noteId, config, result)
    } catch (error) {
      if (error instanceof FocusRejectedError) {
        await this.prisma.fiscalNote.update({ where: { id: noteId }, data: { status: 'AUTORIZADA', provider_message: error.message } })
      } else {
        await this.prisma.fiscalNote.update({ where: { id: noteId }, data: { status: 'CONSULTA_PENDENTE',
          provider_message: 'Cancelamento com resposta incerta. Consulte a referência antes de repetir a operação.' } })
      }
      throw error
    }
    return this.note(tenantId, reportId, noteId)
  }

  async webhook(tenantId: string, providedSecret: string | undefined, payload: unknown) {
    const config = this.focus.config(tenantId)
    const expected = config?.webhook_secret
    if (!config || !expected || !providedSecret || providedSecret.length !== expected.length ||
      !timingSafeEqual(Buffer.from(providedSecret), Buffer.from(expected))) {
      throw new UnauthorizedException('Webhook fiscal não autorizado')
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new BadRequestException('Payload fiscal inválido')
    const data = payload as FocusResult
    if (typeof data.ref !== 'string' || !data.ref || typeof data.status !== 'string' || !data.status) {
      throw new BadRequestException('Referência e situação fiscal são obrigatórias')
    }
    const note = await this.prisma.fiscalNote.findFirst({ where: { tenant_id: tenantId, reference: data.ref } })
    // Responde 2xx para referências desconhecidas sem expor registros e sem provocar retentativas inúteis.
    if (!note) return { received: true }
    await this.saveResult(note.id, config, data)
    await this.prisma.auditLog.create({ data: { tenant_id: tenantId, action: 'NFSE_WEBHOOK_RECEBIDO', resource: 'FiscalNote',
      resource_id: note.id, new_value: { reference: data.ref, status: data.status } } })
    await this.prisma.fiscalNote.update({ where: { id: note.id }, data: { webhook_received_at: new Date() } })
    return { received: true }
  }

  private async saveResult(noteId: string, config: FocusTenantConfig, data: FocusResult) {
    const current = await this.prisma.fiscalNote.findUniqueOrThrow({ where: { id: noteId } })
    if ((data.ref && data.ref !== current.reference) || (data.cnpj_prestador && onlyDigits(data.cnpj_prestador) !== config.cnpj)) {
      throw new BadGatewayException('Resposta fiscal não corresponde ao emissor ou à referência solicitada')
    }
    const mappedStatus: FiscalNoteStatus = data.status === 'autorizado' ? 'AUTORIZADA' :
      data.status === 'cancelado' || data.status === 'cancelada' ? 'CANCELADA' :
      data.status === 'erro_autorizacao' || data.status === 'rejeitado' ? 'REJEITADA' :
      data.status === 'processando_autorizacao' ? 'PROCESSANDO' : 'CONSULTA_PENDENTE'
    // Webhooks podem chegar fora de ordem; estados terminais nunca retrocedem.
    const status: FiscalNoteStatus = current.status === 'CANCELADA' ? 'CANCELADA' :
      current.status === 'AUTORIZADA' && !['CANCELADA'].includes(mappedStatus) ? 'AUTORIZADA' : mappedStatus
    const message = data.erros?.map((e) => e.mensagem ?? e.descricao).filter(Boolean).join('; ') || data.mensagem_sefaz || data.mensagem || null
    const note = await this.prisma.fiscalNote.update({ where: { id: noteId }, data: {
      status, provider_message: message?.slice(0, 1000) ?? null,
      access_key: data.chave_nfse ?? undefined,
      number: data.numero_nfse != null ? String(data.numero_nfse) : data.numero != null ? String(data.numero) : undefined,
      xml_path: data.caminho_xml_nota_fiscal ?? data.caminho_xml ?? undefined,
      danfse_path: data.caminho_danfse_pdf ?? data.caminho_danfse ?? undefined,
      ...(status === 'AUTORIZADA' && !current.issued_at && { issued_at: new Date() }),
      ...(status === 'CANCELADA' && !current.cancelled_at && { cancelled_at: new Date() }),
    } })
    if (status !== 'AUTORIZADA') return
    // A autorização é preservada mesmo se o arquivo ainda não estiver pronto. Nova consulta reprocessa o arquivo.
    const documents: Array<{ path: string | null; key: string | null; field: 'xml_storage_key' | 'pdf_storage_key'; ext: string; mime: string }> = [
      { path: note.xml_path, key: note.xml_storage_key, field: 'xml_storage_key', ext: 'xml', mime: 'xml' },
      { path: note.danfse_path, key: note.pdf_storage_key, field: 'pdf_storage_key', ext: 'pdf', mime: 'pdf' },
    ]
    for (const doc of documents) {
      if (!doc.path || doc.key) continue
      try {
        const bytes = await this.focus.download(config, doc.path)
        if (doc.mime === 'xml' && !bytes.toString('utf8', 0, 1000).includes('<?xml') && !bytes.toString('utf8', 0, 1000).includes('<NFSe')) continue
        if (doc.mime === 'pdf' && bytes.subarray(0, 4).toString() !== '%PDF') continue
        const key = `${note.tenant_id}/fiscal/${note.id}-${randomUUID()}.${doc.ext}`
        await this.storage.save(key, bytes)
        await this.prisma.fiscalNote.update({ where: { id: note.id }, data: { [doc.field]: key } })
      } catch { /* O estado autorizado permanece; o gestor pode consultar e arquivar depois. */ }
    }
  }

  async document(tenantId: string, reportId: string, noteId: string, kind: 'xml' | 'pdf') {
    const note = await this.note(tenantId, reportId, noteId)
    if (!['AUTORIZADA', 'CANCELADA'].includes(note.status)) throw new ConflictException('Nota ainda não autorizada')
    const key = kind === 'xml' ? note.xml_storage_key : note.pdf_storage_key
    if (!key) throw new NotFoundException('Arquivo ainda não arquivado; atualize a situação da NFS-e')
    return { stream: this.storage.readStream(key), filename: `nfse-${note.id}.${kind}`,
      mime: kind === 'xml' ? 'application/xml' : 'application/pdf' }
  }
}
