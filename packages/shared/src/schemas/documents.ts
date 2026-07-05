import { z } from 'zod'

// ============================================================
// Documentos Institucionais (repositório do tenant)
// ============================================================

export const DOCUMENT_ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'] as const
export const DOCUMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export const institutionalDocStatusSchema = z.enum(['PENDENTE', 'VALIDO', 'VENCIDO'])
export type InstitutionalDocStatus = z.infer<typeof institutionalDocStatusSchema>

export const uploadInstitutionalDocSchema = z.object({
  // multipart envia campos como string; aceita '' como ausente
  valid_until: z
    .string()
    .trim()
    .transform((v) => (v === '' ? undefined : v))
    .optional()
    .refine((v) => v === undefined || !Number.isNaN(Date.parse(v)), {
      message: 'Data de validade inválida',
    }),
})
export type UploadInstitutionalDocInput = z.infer<typeof uploadInstitutionalDocSchema>

export const queryInstitutionalDocsSchema = z.object({
  status: institutionalDocStatusSchema.optional(),
  category_id: z.string().optional(),
})
export type QueryInstitutionalDocsInput = z.infer<typeof queryInstitutionalDocsSchema>

export function isAllowedDocumentMime(mime: string): boolean {
  return (DOCUMENT_ALLOWED_MIMES as readonly string[]).includes(mime)
}
