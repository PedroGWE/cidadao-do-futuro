import type { EditalDTO, SearchEditaisQuery } from '@cidadao/shared'

export interface ProviderContext {
  tenantId: string
}

/**
 * Contrato de fonte de editais. Novas integrações (fundações, institutos,
 * outras APIs públicas) implementam esta interface e são registradas no
 * array EDITAL_PROVIDERS — o resto do sistema não muda.
 */
export interface EditalProvider {
  readonly fonte: string
  search(filters: SearchEditaisQuery, ctx: ProviderContext): Promise<EditalDTO[]>
  getById(externalId: string, ctx: ProviderContext): Promise<EditalDTO | null>
}

export const EDITAL_PROVIDERS = Symbol('EDITAL_PROVIDERS')
