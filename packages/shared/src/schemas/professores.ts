import { z } from 'zod'

export const TIPO_VINCULOS = ['VOLUNTARIO', 'CLT', 'AUTONOMO_PJ', 'PRESTADOR_SERVICO'] as const
export type TipoVinculo = (typeof TIPO_VINCULOS)[number]

export const PROFESSOR_STATUSES = ['ATIVO', 'INATIVO', 'AFASTADO', 'DESLIGADO'] as const
export type ProfessorStatus = (typeof PROFESSOR_STATUSES)[number]

export const FORMAS_PAGAMENTO = ['PIX', 'TRANSFERENCIA', 'DINHEIRO', 'BOLETO'] as const
export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number]

export const TIPO_VINCULO_LABELS: Record<TipoVinculo, string> = {
  VOLUNTARIO: 'Voluntário',
  CLT: 'CLT',
  AUTONOMO_PJ: 'Autônomo / PJ',
  PRESTADOR_SERVICO: 'Prestador de Serviço',
}

export const PROFESSOR_STATUS_LABELS: Record<ProfessorStatus, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  AFASTADO: 'Afastado',
  DESLIGADO: 'Desligado',
}

export const createProfessorSchema = z.object({
  nome_completo: z.string().min(2).max(200),
  cpf: z.string().min(11).max(14),
  rg: z.string().optional().nullable(),
  data_nascimento: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('').transform(() => undefined)),
  cep: z.string().max(8).optional().nullable(),
  logradouro: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().max(2).optional().nullable(),
  formacao_academica: z.string().optional().nullable(),
  especializacao: z.string().optional().nullable(),
  disciplinas: z.array(z.string()).default([]),
  tipo_vinculo: z.enum(TIPO_VINCULOS),
  forma_pagamento: z.enum(FORMAS_PAGAMENTO).optional().nullable(),
  dia_pagamento: z.coerce.number().int().min(1).max(31).optional().nullable(),
  valor_hora_aula: z.coerce.number().min(0).optional().nullable(),
  valor_mensal: z.coerce.number().min(0).optional().nullable(),
  comprovante_formacao_url: z.string().optional().nullable(),
  contrato_url: z.string().optional().nullable(),
  status: z.enum(PROFESSOR_STATUSES).default('ATIVO'),
  data_admissao: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
})
export type CreateProfessorInput = z.infer<typeof createProfessorSchema>

export const createVinculoProfessorSchema = z.object({
  project_id: z.string().min(1, 'Selecione um projeto'),
  data_inicio: z.string().min(1, 'Data de início obrigatória'),
  data_fim: z.string().optional().nullable(),
  status: z.enum(PROFESSOR_STATUSES).default('ATIVO'),
  carga_horaria_semanal: z.coerce.number().int().min(1).optional().nullable(),
})
export type CreateVinculoProfessorInput = z.infer<typeof createVinculoProfessorSchema>

export const updateRemuneracaoSchema = z.object({
  valor_hora_aula: z.coerce.number().min(0).optional(),
  valor_mensal: z.coerce.number().min(0).optional(),
  data_vigencia: z.string().min(1, 'Data de vigência obrigatória'),
  motivo: z.string().optional(),
})
export type UpdateRemuneracaoInput = z.infer<typeof updateRemuneracaoSchema>
