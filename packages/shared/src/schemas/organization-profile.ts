import { z } from 'zod'
import { isValidCpfCnpj, onlyDigits } from '../utils/br-documents'

// ============================================================
// Perfil da Organização para Editais (dados básicos)
// ============================================================

export const ORGANIZATION_TYPES = [
  'EXECUTOR_PROJETOS_SOCIAIS',
  'OSC',
  'INSTITUTO',
  'FUNDACAO',
  'ASSOCIACAO',
] as const

export const ABRANGENCIAS = ['MUNICIPAL', 'ESTADUAL', 'NACIONAL', 'INTERNACIONAL'] as const

export const ORGANIZATION_TYPE_LABELS: Record<(typeof ORGANIZATION_TYPES)[number], string> = {
  EXECUTOR_PROJETOS_SOCIAIS: 'Executor de Projetos Sociais',
  OSC: 'OSC',
  INSTITUTO: 'Instituto',
  FUNDACAO: 'Fundação',
  ASSOCIACAO: 'Associação',
}

export const ABRANGENCIA_LABELS: Record<(typeof ABRANGENCIAS)[number], string> = {
  MUNICIPAL: 'Municipal',
  ESTADUAL: 'Estadual',
  NACIONAL: 'Nacional',
  INTERNACIONAL: 'Internacional',
}

export const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
] as const

export const organizationProfileSchema = z.object({
  nome_organizacao: z
    .string()
    .trim()
    .min(1, 'Informe o nome da organização')
    .max(100, 'Máximo de 100 caracteres'),
  tipo_organizacao: z.enum(ORGANIZATION_TYPES, {
    errorMap: () => ({ message: 'Selecione o tipo de organização' }),
  }),
  documento: z
    .string()
    .transform(onlyDigits)
    .refine((v) => v === '' || isValidCpfCnpj(v), 'CPF ou CNPJ inválido')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  abrangencia: z.enum(ABRANGENCIAS).optional(),
  areas_atuacao: z.array(z.string().trim().min(1)).max(20).default([]),
  municipio: z.string().trim().max(120).optional().or(z.literal('').transform(() => undefined)),
  uf: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === '' || (UFS as readonly string[]).includes(v), 'UF inválida')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  telefone: z
    .string()
    .transform(onlyDigits)
    .refine((v) => v === '' || (v.length >= 10 && v.length <= 11), 'Telefone inválido')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  email: z
    .string()
    .trim()
    .refine((v) => v === '' || z.string().email().safeParse(v).success, 'E-mail inválido')
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export type OrganizationProfileInput = z.infer<typeof organizationProfileSchema>

/** Deriva CPF|CNPJ pelo tamanho do documento (apenas números). */
export function documentTypeFor(documento?: string | null): 'CPF' | 'CNPJ' | null {
  if (!documento) return null
  const d = onlyDigits(documento)
  if (d.length === 11) return 'CPF'
  if (d.length === 14) return 'CNPJ'
  return null
}
