import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateProfessorDto } from './dto/create-professor.dto'
import type { UpdateProfessorDto } from './dto/update-professor.dto'
import type { QueryProfessoresDto } from './dto/query-professores.dto'
import type { CreateVinculoProfessorDto } from './dto/create-vinculo-professor.dto'
import type { UpdateRemuneracaoDto } from './dto/update-remuneracao.dto'

const PROFESSOR_SELECT = {
  id: true,
  nome_completo: true,
  cpf: true,
  email: true,
  telefone: true,
  tipo_vinculo: true,
  status: true,
  disciplinas: true,
  data_admissao: true,
  projetos: {
    select: {
      id: true,
      status: true,
      carga_horaria_semanal: true,
      project: { select: { id: true, name: true } },
    },
    where: { status: 'ATIVO' },
  },
  _count: { select: { projetos: true, historico: true } },
  created_at: true,
  updated_at: true,
} satisfies Prisma.ProfessorSelect

@Injectable()
export class ProfessoresService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, q: QueryProfessoresDto) {
    const page = q.page ?? 1
    const limit = q.limit ?? 20
    const where: Prisma.ProfessorWhereInput = {
      tenant_id: tenantId,
      ...(q.status && { status: q.status }),
      ...(q.tipo_vinculo && { tipo_vinculo: q.tipo_vinculo }),
      ...(q.project_id && {
        projetos: { some: { project_id: q.project_id, status: 'ATIVO' } },
      }),
      ...(q.disciplina && {
        disciplinas: { has: q.disciplina },
      }),
      ...(q.search && {
        OR: [
          { nome_completo: { contains: q.search, mode: 'insensitive' } },
          { cpf: { contains: q.search } },
          { email: { contains: q.search, mode: 'insensitive' } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      this.prisma.professor.findMany({
        where,
        select: PROFESSOR_SELECT,
        orderBy: { nome_completo: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.professor.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(tenantId: string, id: string) {
    const p = await this.prisma.professor.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        projetos: {
          include: { project: { select: { id: true, name: true, status: true } } },
          orderBy: { data_inicio: 'desc' },
        },
        historico: {
          orderBy: { data_vigencia: 'desc' },
        },
      },
    })
    if (!p) throw new NotFoundException('Professor não encontrado')
    return p
  }

  async findOnePublic(tenantId: string, id: string) {
    const p = await this.findOne(tenantId, id)
    // Remove dados financeiros para usuários sem permissão
    const { dados_bancarios: _db, historico: _h, ...rest } = p as typeof p & {
      dados_bancarios?: unknown
      historico?: unknown[]
    }
    return rest
  }

  async create(tenantId: string, userId: string, dto: CreateProfessorDto) {
    const existing = await this.prisma.professor.findUnique({
      where: { tenant_id_cpf: { tenant_id: tenantId, cpf: dto.cpf } },
      select: { id: true },
    })
    if (existing) throw new ConflictException('CPF já cadastrado neste tenant')

    const professor = await this.prisma.professor.create({
      data: {
        tenant_id: tenantId,
        created_by: userId,
        nome_completo: dto.nome_completo,
        cpf: dto.cpf,
        rg: dto.rg ?? null,
        data_nascimento: dto.data_nascimento ? new Date(dto.data_nascimento) : null,
        telefone: dto.telefone ?? null,
        email: dto.email ?? null,
        foto_url: dto.foto_url ?? null,
        cep: dto.cep ?? null,
        logradouro: dto.logradouro ?? null,
        numero: dto.numero ?? null,
        complemento: dto.complemento ?? null,
        bairro: dto.bairro ?? null,
        cidade: dto.cidade ?? null,
        uf: dto.uf ?? null,
        formacao_academica: dto.formacao_academica ?? null,
        especializacao: dto.especializacao ?? null,
        disciplinas: dto.disciplinas ?? [],
        tipo_vinculo: dto.tipo_vinculo,
        forma_pagamento: dto.forma_pagamento ?? null,
        dados_bancarios: (dto.dados_bancarios as Prisma.InputJsonValue) ?? null,
        dia_pagamento: dto.dia_pagamento ?? null,
        comprovante_formacao_url: dto.comprovante_formacao_url ?? null,
        certificados_urls: dto.certificados_urls ?? [],
        contrato_url: dto.contrato_url ?? null,
        status: dto.status ?? 'ATIVO',
        data_admissao: dto.data_admissao ? new Date(dto.data_admissao) : null,
        observacoes: dto.observacoes ?? null,
      },
      select: PROFESSOR_SELECT,
    })

    if (dto.valor_hora_aula !== undefined || dto.valor_mensal !== undefined) {
      await this.prisma.historicoProfessor.create({
        data: {
          professor_id: professor.id,
          valor_hora_aula: dto.valor_hora_aula ?? null,
          valor_mensal: dto.valor_mensal ?? null,
          data_vigencia: new Date(),
          created_by: userId,
        },
      })
    }

    return professor
  }

  async update(tenantId: string, id: string, dto: UpdateProfessorDto) {
    await this.assertBelongsToTenant(id, tenantId)

    if (dto.cpf) {
      const existing = await this.prisma.professor.findFirst({
        where: { tenant_id: tenantId, cpf: dto.cpf, NOT: { id } },
        select: { id: true },
      })
      if (existing) throw new ConflictException('CPF já cadastrado por outro professor')
    }

    return this.prisma.professor.update({
      where: { id },
      data: {
        ...(dto.nome_completo && { nome_completo: dto.nome_completo }),
        ...(dto.cpf && { cpf: dto.cpf }),
        ...(dto.rg !== undefined && { rg: dto.rg ?? null }),
        ...(dto.data_nascimento !== undefined && { data_nascimento: dto.data_nascimento ? new Date(dto.data_nascimento) : null }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone ?? null }),
        ...(dto.email !== undefined && { email: dto.email ?? null }),
        ...(dto.foto_url !== undefined && { foto_url: dto.foto_url ?? null }),
        ...(dto.cep !== undefined && { cep: dto.cep ?? null }),
        ...(dto.logradouro !== undefined && { logradouro: dto.logradouro ?? null }),
        ...(dto.numero !== undefined && { numero: dto.numero ?? null }),
        ...(dto.complemento !== undefined && { complemento: dto.complemento ?? null }),
        ...(dto.bairro !== undefined && { bairro: dto.bairro ?? null }),
        ...(dto.cidade !== undefined && { cidade: dto.cidade ?? null }),
        ...(dto.uf !== undefined && { uf: dto.uf ?? null }),
        ...(dto.formacao_academica !== undefined && { formacao_academica: dto.formacao_academica ?? null }),
        ...(dto.especializacao !== undefined && { especializacao: dto.especializacao ?? null }),
        ...(dto.disciplinas !== undefined && { disciplinas: dto.disciplinas }),
        ...(dto.tipo_vinculo && { tipo_vinculo: dto.tipo_vinculo }),
        ...(dto.forma_pagamento !== undefined && { forma_pagamento: dto.forma_pagamento ?? null }),
        ...(dto.dados_bancarios !== undefined && { dados_bancarios: (dto.dados_bancarios as Prisma.InputJsonValue) ?? Prisma.JsonNull }),
        ...(dto.dia_pagamento !== undefined && { dia_pagamento: dto.dia_pagamento ?? null }),
        ...(dto.comprovante_formacao_url !== undefined && { comprovante_formacao_url: dto.comprovante_formacao_url ?? null }),
        ...(dto.certificados_urls !== undefined && { certificados_urls: dto.certificados_urls }),
        ...(dto.contrato_url !== undefined && { contrato_url: dto.contrato_url ?? null }),
        ...(dto.status && { status: dto.status }),
        ...(dto.data_admissao !== undefined && { data_admissao: dto.data_admissao ? new Date(dto.data_admissao) : null }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes ?? null }),
      },
      select: PROFESSOR_SELECT,
    })
  }

  async remove(tenantId: string, id: string) {
    await this.assertBelongsToTenant(id, tenantId)
    const activeVinculos = await this.prisma.professorProjeto.count({
      where: { professor_id: id, status: 'ATIVO' },
    })
    if (activeVinculos > 0) {
      throw new ConflictException(
        'Professor possui vínculos ativos com projetos. Desvincule-o primeiro.',
      )
    }
    await this.prisma.professor.update({
      where: { id },
      data: { status: 'DESLIGADO', data_desligamento: new Date() },
    })
  }

  // ── Vínculos com projetos ─────────────────────────────────────

  async listVinculos(tenantId: string, professorId: string) {
    await this.assertBelongsToTenant(professorId, tenantId)
    return this.prisma.professorProjeto.findMany({
      where: { professor_id: professorId },
      include: { project: { select: { id: true, name: true, status: true } } },
      orderBy: { data_inicio: 'desc' },
    })
  }

  async addVinculo(tenantId: string, professorId: string, dto: CreateVinculoProfessorDto) {
    await this.assertBelongsToTenant(professorId, tenantId)
    await this.assertProjectBelongsToTenant(dto.project_id, tenantId)

    const existing = await this.prisma.professorProjeto.findUnique({
      where: {
        professor_id_project_id: {
          professor_id: professorId,
          project_id: dto.project_id,
        },
      },
      select: { id: true },
    })
    if (existing) throw new ConflictException('Professor já vinculado a este projeto')

    return this.prisma.professorProjeto.create({
      data: {
        professor_id: professorId,
        project_id: dto.project_id,
        data_inicio: new Date(dto.data_inicio),
        data_fim: dto.data_fim ? new Date(dto.data_fim) : null,
        status: dto.status ?? 'ATIVO',
        carga_horaria_semanal: dto.carga_horaria_semanal ?? null,
        dias_horarios: (dto.dias_horarios as Prisma.InputJsonValue) ?? null,
      },
      include: { project: { select: { id: true, name: true } } },
    })
  }

  async updateVinculo(
    tenantId: string,
    professorId: string,
    vinculoId: string,
    dto: Partial<CreateVinculoProfessorDto>,
  ) {
    await this.assertBelongsToTenant(professorId, tenantId)
    const vinculo = await this.prisma.professorProjeto.findFirst({
      where: { id: vinculoId, professor_id: professorId },
      select: { id: true },
    })
    if (!vinculo) throw new NotFoundException('Vínculo não encontrado')
    return this.prisma.professorProjeto.update({
      where: { id: vinculoId },
      data: {
        ...(dto.data_inicio && { data_inicio: new Date(dto.data_inicio) }),
        ...(dto.data_fim !== undefined && { data_fim: dto.data_fim ? new Date(dto.data_fim) : null }),
        ...(dto.status && { status: dto.status }),
        ...(dto.carga_horaria_semanal !== undefined && { carga_horaria_semanal: dto.carga_horaria_semanal ?? null }),
        ...(dto.dias_horarios !== undefined && { dias_horarios: (dto.dias_horarios as Prisma.InputJsonValue) ?? Prisma.JsonNull }),
      },
      include: { project: { select: { id: true, name: true } } },
    })
  }

  async removeVinculo(tenantId: string, professorId: string, vinculoId: string) {
    await this.assertBelongsToTenant(professorId, tenantId)
    await this.prisma.professorProjeto.deleteMany({
      where: { id: vinculoId, professor_id: professorId },
    })
  }

  // ── Remuneração (histórico imutável) ─────────────────────────

  async listHistorico(tenantId: string, professorId: string) {
    await this.assertBelongsToTenant(professorId, tenantId)
    return this.prisma.historicoProfessor.findMany({
      where: { professor_id: professorId },
      orderBy: { data_vigencia: 'desc' },
    })
  }

  async addHistorico(
    tenantId: string,
    professorId: string,
    userId: string,
    dto: UpdateRemuneracaoDto,
  ) {
    await this.assertBelongsToTenant(professorId, tenantId)
    return this.prisma.historicoProfessor.create({
      data: {
        professor_id: professorId,
        valor_hora_aula: dto.valor_hora_aula ?? null,
        valor_mensal: dto.valor_mensal ?? null,
        data_vigencia: new Date(dto.data_vigencia),
        motivo: dto.motivo ?? null,
        created_by: userId,
      },
    })
  }

  // ── Private ───────────────────────────────────────────────────

  private async assertBelongsToTenant(id: string, tenantId: string) {
    const p = await this.prisma.professor.findFirst({
      where: { id, tenant_id: tenantId },
      select: { id: true },
    })
    if (!p) throw new NotFoundException('Professor não encontrado')
  }

  private async assertProjectBelongsToTenant(projectId: string, tenantId: string) {
    const p = await this.prisma.project.findFirst({
      where: { id: projectId, tenant_id: tenantId, deleted_at: null },
      select: { id: true },
    })
    if (!p) throw new ForbiddenException('Projeto não pertence ao tenant')
  }
}
