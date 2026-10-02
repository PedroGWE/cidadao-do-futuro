import { z } from 'zod'
import { ABRANGENCIAS } from './organization-profile'

// ============================================================
// Buscar Editais — DTO normalizado e schemas
// ============================================================

export const EDITAL_FONTES = ['PNCP', 'MANUAL'] as const
export type EditalFonte = (typeof EDITAL_FONTES)[number]

export const SAVED_EDITAL_STATUSES = [
  'SALVO',
  'EM_PREPARACAO',
  'INSCRITO',
  'APROVADO',
  'REPROVADO',
  'ENCERRADO',
] as const
export type SavedEditalStatus = (typeof SAVED_EDITAL_STATUSES)[number]

export const SAVED_EDITAL_STATUS_LABELS: Record<SavedEditalStatus, string> = {
  SALVO: 'Salvo',
  EM_PREPARACAO: 'Em preparação',
  INSCRITO: 'Inscrito',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
  ENCERRADO: 'Encerrado',
}

/** DTO normalizado de edital, independente da fonte. */
export interface EditalDTO {
  externalId: string
  fonte: EditalFonte
  titulo: string
  orgao: string | null
  descricao: string | null
  valorTotal: number | null
  dataAbertura: string | null
  dataEncerramento: string | null
  abrangencia: (typeof ABRANGENCIAS)[number] | null
  uf: string | null
  areaTematica: string | null
  linkOficial: string | null
  requisitosDocumentais: string[]
}

export interface EditalMatch {
  matchScore: number
  motivos: string[]
}

export type EditalComScore = EditalDTO & EditalMatch

export const searchEditaisQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  uf: z.string().trim().toUpperCase().length(2).optional().or(z.literal('').transform(() => undefined)),
  area: z.string().trim().max(100).optional().or(z.literal('').transform(() => undefined)),
  abrangencia: z.enum(ABRANGENCIAS).optional().or(z.literal('').transform(() => undefined)),
  encerra_ate: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Data inválida')
    .or(z.literal('').transform(() => undefined)),
  page: z.coerce.number().int().min(1).default(1),
})
export type SearchEditaisQuery = z.infer<typeof searchEditaisQuerySchema>

export const manualEditalSchema = z.object({
  titulo: z.string().trim().min(3).max(300),
  orgao: z.string().trim().max(200).optional().or(z.literal('').transform(() => undefined)),
  descricao: z.string().trim().max(5000).optional().or(z.literal('').transform(() => undefined)),
  valor_total: z.coerce.number().nonnegative().optional(),
  data_abertura: z.string().optional().refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Data inválida'),
  data_encerramento: z.string().optional().refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Data inválida'),
  abrangencia: z.enum(ABRANGENCIAS).optional(),
  uf: z.string().trim().toUpperCase().length(2).optional().or(z.literal('').transform(() => undefined)),
  area_tematica: z.string().trim().max(100).optional().or(z.literal('').transform(() => undefined)),
  link_oficial: z.string().trim().url('URL inválida').optional().or(z.literal('').transform(() => undefined)),
  requisitos_documentais: z.array(z.string().trim().min(1).max(200)).max(50).default([]),
})
export type ManualEditalInput = z.infer<typeof manualEditalSchema>

export const saveEditalSchema = z.object({
  fonte: z.enum(EDITAL_FONTES),
  external_id: z.string().trim().min(1).max(200),
  titulo: z.string().trim().min(1).max(300),
  orgao: z.string().trim().max(200).optional(),
  data_encerramento: z
    .string()
    .optional()
    .nullable()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Data inválida'),
})
export type SaveEditalInput = z.infer<typeof saveEditalSchema>

export const patchSavedEditalSchema = z.object({
  status: z.enum(SAVED_EDITAL_STATUSES).optional(),
  notas: z.string().trim().max(2000).optional().or(z.literal('').transform(() => undefined)),
})
export type PatchSavedEditalInput = z.infer<typeof patchSavedEditalSchema>
