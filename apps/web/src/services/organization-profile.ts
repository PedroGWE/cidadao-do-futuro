import api from '@/lib/api'
import type { OrganizationProfileInput } from '@cidadao/shared'

export interface OrganizationProfileData {
  profile: {
    nome_organizacao: string
    tipo_organizacao: string | null
    tipo_documento: 'CPF' | 'CNPJ' | null
    documento: string | null
    abrangencia: string | null
    areas_atuacao: string[]
    municipio: string | null
    uf: string | null
    telefone: string | null
    email: string | null
  } | null
  percentualCompletude: number
  pendencias: { campos: string[]; documentos: string[] }
}

export const organizationProfileService = {
  get: (): Promise<OrganizationProfileData> =>
    api.get('/organization-profile').then((r) => r.data),

  save: (input: OrganizationProfileInput): Promise<OrganizationProfileData> =>
    api.put('/organization-profile', input).then((r) => r.data),
}
