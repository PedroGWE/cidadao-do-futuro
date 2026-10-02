import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { createHash } from 'node:crypto'
import { OrganizationDocumentStatus } from '@prisma/client'
import type {
  EditalComScore,
  EditalDTO,
  EditalFonte,
  ManualEditalInput,
  PatchSavedEditalInput,
  SaveEditalInput,
  SearchEditaisQuery,
} from '@cidadao/shared'
import { PrismaService } from '../prisma/prisma.service'
import { DocumentsService } from '../documents/documents.service'
import { CacheService } from './cache/cache.service'
import { EDITAL_PROVIDERS, type EditalProvider } from './providers/edital-provider'
import { manualToDTO } from './providers/manual.provider'
import { computeMatch, type MatchProfile } from './match'

const SEARCH_TTL_SECONDS = 6 * 60 * 60 // 6h
const STALE_TTL_SECONDS = 7 * 24 * 60 * 60 // fallback quando a fonte externa cai
const PAGE_SIZE = 20

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

@Injectable()
export class EditaisService {
  private readonly logger = new Logger(EditaisService.name)

  constructor(
    private prisma: PrismaService,
    private documents: DocumentsService,
    private cache: CacheService,
    @Inject(EDITAL_PROVIDERS) private providers: EditalProvider[],
  ) {}

  // ----------------------------------------------------------
  // Busca agregada
  // ----------------------------------------------------------

  private searchCacheKey(tenantId: string, q: SearchEditaisQuery): string {
    const { page: _page, ...filters } = q
    const hash = createHash('sha1').update(JSON.stringify(filters)).digest('hex')
    return `editais:search:${tenantId}:${hash}`
  }

  /** Busca nos providers com cache de 6h e fallback para o último resultado bom. */
  private async fetchFromProviders(
    tenantId: string,
    query: SearchEditaisQuery,
  ): Promise<{ editais: EditalDTO[]; dadosDesatualizados: boolean }> {
    const key = this.searchCacheKey(tenantId, query)

    const cached = await this.cache.get<EditalDTO[]>(key)
    if (cached) return { editais: cached, dadosDesatualizados: false }

    const ctx = { tenantId }
    const results = await Promise.allSettled(this.providers.map((p) => p.search(query, ctx)))

    const editais: EditalDTO[] = []
    let algumaFalha = false
    for (const [i, result] of results.entries()) {
      if (result.status === 'fulfilled') {
        editais.push(...result.value)
      } else {
        algumaFalha = true
        this.logger.warn(
          `Provider ${this.providers[i].fonte} falhou: ${(result.reason as Error)?.message}`,
        )
      }
    }

    if (algumaFalha && editais.length === 0) {
      // indisponibilidade total: cai para o último resultado bom
      const stale = await this.cache.get<EditalDTO[]>(`${key}:stale`)
      if (stale) return { editais: stale, dadosDesatualizados: true }
      return { editais: [], dadosDesatualizados: true }
    }

    await this.cache.set(key, editais, SEARCH_TTL_SECONDS)
    await this.cache.set(`${key}:stale`, editais, STALE_TTL_SECONDS)
    return { editais, dadosDesatualizados: algumaFalha }
  }

  private applyFilters(editais: EditalDTO[], q: SearchEditaisQuery): EditalDTO[] {
    return editais.filter((e) => {
      if (q.q) {
        const needle = normalizeText(q.q)
        const haystack = normalizeText(`${e.titulo} ${e.orgao ?? ''} ${e.descricao ?? ''}`)
        if (!haystack.includes(needle)) return false
      }
      if (q.uf && e.uf && e.uf !== q.uf) return false
      if (q.area) {
        const area = normalizeText(q.area)
        if (!e.areaTematica || !normalizeText(e.areaTematica).includes(area)) return false
      }
      if (q.abrangencia && e.abrangencia && e.abrangencia !== q.abrangencia) return false
      if (q.encerra_ate && e.dataEncerramento) {
        if (new Date(e.dataEncerramento) > new Date(q.encerra_ate)) return false
      }
      return true
    })
  }

  private async getMatchProfile(tenantId: string): Promise<MatchProfile | null> {
    const profile = await this.prisma.organizationProfile.findUnique({
      where: { tenant_id: tenantId },
      select: { abrangencia: true, uf: true, areas_atuacao: true },
    })
    return profile
  }

  async search(tenantId: string, query: SearchEditaisQuery) {
    const [{ editais, dadosDesatualizados }, profile] = await Promise.all([
      this.fetchFromProviders(tenantId, query),
      this.getMatchProfile(tenantId),
    ])

    const filtered = this.applyFilters(editais, query)
    const scored: EditalComScore[] = filtered.map((e) => ({ ...e, ...computeMatch(e, profile) }))

    scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
      const da = a.dataEncerramento ? new Date(a.dataEncerramento).getTime() : Infinity
      const db = b.dataEncerramento ? new Date(b.dataEncerramento).getTime() : Infinity
      return da - db
    })

    const page = query.page ?? 1
    const start = (page - 1) * PAGE_SIZE
    return {
      data: scored.slice(start, start + PAGE_SIZE),
      total: scored.length,
      page,
      totalPages: Math.max(1, Math.ceil(scored.length / PAGE_SIZE)),
      dadosDesatualizados,
    }
  }

  // ----------------------------------------------------------
  // Detalhe + checklist de documentos
  // ----------------------------------------------------------

  async getDetail(tenantId: string, fonte: string, externalId: string) {
    const provider = this.providers.find((p) => p.fonte === fonte.toUpperCase())
    if (!provider) throw new NotFoundException('Fonte de edital desconhecida')

    const detailKey = `editais:detail:${fonte}:${externalId}`
    let edital = await this.cache.get<EditalDTO>(detailKey)
    if (!edital) {
      edital = await provider.getById(externalId, { tenantId })
      if (edital) await this.cache.set(detailKey, edital, SEARCH_TTL_SECONDS)
    }
    if (!edital) throw new NotFoundException('Edital não encontrado')

    const [profile, checklist, saved] = await Promise.all([
      this.getMatchProfile(tenantId),
      this.buildChecklist(tenantId, edital.requisitosDocumentais),
      this.prisma.savedEdital.findUnique({
        where: {
          tenant_id_edital_ref: {
            tenant_id: tenantId,
            edital_ref: `${edital.fonte}:${edital.externalId}`,
          },
        },
        select: { id: true, status: true, notas: true },
      }),
    ])

    return { ...edital, ...computeMatch(edital, profile), checklist, saved }
  }

  /** Cruza requisitos do edital com o repositório de documentos do tenant. */
  async buildChecklist(tenantId: string, requisitos: string[]) {
    if (requisitos.length === 0) return []

    await this.documents.refreshExpired(tenantId)
    const types = await this.prisma.institutionalDocType.findMany({
      where: { category: { tenant_id: tenantId } },
      select: {
        id: true,
        name: true,
        documents: { where: { tenant_id: tenantId }, select: { status: true }, take: 1 },
      },
    })

    return requisitos.map((requisito) => {
      const req = normalizeText(requisito)
      const type = types.find((t) => {
        const name = normalizeText(t.name)
        return name.includes(req) || req.includes(name)
      })
      const docStatus = type?.documents[0]?.status
      return {
        requisito,
        doc_type_id: type?.id ?? null,
        doc_type_name: type?.name ?? null,
        status: type
          ? docStatus === OrganizationDocumentStatus.VALIDO
            ? 'VALIDO'
            : docStatus === OrganizationDocumentStatus.VENCIDO
              ? 'VENCIDO'
              : 'PENDENTE'
          : 'NAO_MAPEADO',
      }
    })
  }

  // ----------------------------------------------------------
  // Meus editais (funil)
  // ----------------------------------------------------------

  async saveEdital(tenantId: string, input: SaveEditalInput) {
    const ref = `${input.fonte}:${input.external_id}`
    return this.prisma.savedEdital.upsert({
      where: { tenant_id_edital_ref: { tenant_id: tenantId, edital_ref: ref } },
      create: {
        tenant_id: tenantId,
        edital_ref: ref,
        fonte: input.fonte as EditalFonte,
        external_id: input.external_id,
        edital_id: input.fonte === 'MANUAL' ? input.external_id : null,
        titulo: input.titulo,
        orgao: input.orgao ?? null,
        data_encerramento: input.data_encerramento ? new Date(input.data_encerramento) : null,
      },
      update: {
        titulo: input.titulo,
        orgao: input.orgao ?? null,
        data_encerramento: input.data_encerramento ? new Date(input.data_encerramento) : null,
      },
    })
  }

  listSaved(tenantId: string) {
    return this.prisma.savedEdital.findMany({
      where: { tenant_id: tenantId },
      orderBy: [{ status: 'asc' }, { data_encerramento: 'asc' }],
    })
  }

  async patchSaved(tenantId: string, id: string, input: PatchSavedEditalInput) {
    const saved = await this.prisma.savedEdital.findFirst({
      where: { id, tenant_id: tenantId },
      select: { id: true },
    })
    if (!saved) throw new NotFoundException('Edital salvo não encontrado')

    return this.prisma.savedEdital.update({
      where: { id: saved.id },
      data: {
        ...(input.status && { status: input.status }),
        ...(input.notas !== undefined && { notas: input.notas ?? null }),
      },
    })
  }

  // ----------------------------------------------------------
  // CRUD manual (admins)
  // ----------------------------------------------------------

  listManual(tenantId: string) {
    return this.prisma.edital.findMany({
      where: { fonte: 'MANUAL', OR: [{ tenant_id: null }, { tenant_id: tenantId }] },
      orderBy: { created_at: 'desc' },
    })
  }

  async createManual(tenantId: string, userId: string, input: ManualEditalInput) {
    const edital = await this.prisma.edital.create({
      data: {
        tenant_id: tenantId,
        fonte: 'MANUAL',
        titulo: input.titulo,
        orgao: input.orgao ?? null,
        descricao: input.descricao ?? null,
        valor_total: input.valor_total ?? null,
        data_abertura: input.data_abertura ? new Date(input.data_abertura) : null,
        data_encerramento: input.data_encerramento ? new Date(input.data_encerramento) : null,
        abrangencia: input.abrangencia ?? null,
        uf: input.uf ?? null,
        area_tematica: input.area_tematica ?? null,
        link_oficial: input.link_oficial ?? null,
        requisitos_documentais: input.requisitos_documentais,
        created_by: userId,
      },
    })
    return manualToDTO(edital)
  }

  async updateManual(tenantId: string, id: string, input: ManualEditalInput) {
    const existing = await this.prisma.edital.findFirst({
      where: { id, fonte: 'MANUAL', tenant_id: tenantId },
      select: { id: true },
    })
    if (!existing) throw new NotFoundException('Edital não encontrado')

    const edital = await this.prisma.edital.update({
      where: { id },
      data: {
        titulo: input.titulo,
        orgao: input.orgao ?? null,
        descricao: input.descricao ?? null,
        valor_total: input.valor_total ?? null,
        data_abertura: input.data_abertura ? new Date(input.data_abertura) : null,
        data_encerramento: input.data_encerramento ? new Date(input.data_encerramento) : null,
        abrangencia: input.abrangencia ?? null,
        uf: input.uf ?? null,
        area_tematica: input.area_tematica ?? null,
        link_oficial: input.link_oficial ?? null,
        requisitos_documentais: input.requisitos_documentais,
      },
    })
    return manualToDTO(edital)
  }

  async removeManual(tenantId: string, id: string) {
    const existing = await this.prisma.edital.findFirst({
      where: { id, fonte: 'MANUAL', tenant_id: tenantId },
      select: { id: true },
    })
    if (!existing) throw new NotFoundException('Edital não encontrado')

    await this.prisma.savedEdital.deleteMany({ where: { edital_id: id } })
    await this.prisma.edital.delete({ where: { id } })
    return { success: true }
  }
}
