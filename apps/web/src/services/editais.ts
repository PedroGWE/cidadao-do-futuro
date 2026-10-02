import api from '@/lib/api'
import type { EditalComScore, SavedEditalStatus, SearchEditaisQuery } from '@cidadao/shared'

export interface EditaisSearchResult {
  data: EditalComScore[]
  total: number
  page: number
  totalPages: number
  dadosDesatualizados: boolean
}

export interface ChecklistItem {
  requisito: string
  doc_type_id: string | null
  doc_type_name: string | null
  status: 'VALIDO' | 'VENCIDO' | 'PENDENTE' | 'NAO_MAPEADO'
}

export interface EditalDetail extends EditalComScore {
  checklist: ChecklistItem[]
  saved: { id: string; status: SavedEditalStatus; notas: string | null } | null
}

export interface SavedEdital {
  id: string
  edital_ref: string
  fonte: 'PNCP' | 'MANUAL'
  external_id: string | null
  titulo: string
  orgao: string | null
  data_encerramento: string | null
  status: SavedEditalStatus
  notas: string | null
}

export const editaisService = {
  search: (params: Partial<SearchEditaisQuery>): Promise<EditaisSearchResult> =>
    api.get('/editais/search', { params }).then((r) => r.data),

  detail: (fonte: string, externalId: string): Promise<EditalDetail> =>
    api.get(`/editais/${fonte}/${encodeURIComponent(externalId)}`).then((r) => r.data),

  save: (input: {
    fonte: string
    external_id: string
    titulo: string
    orgao?: string
    data_encerramento?: string | null
  }): Promise<SavedEdital> => api.post('/editais/saved', input).then((r) => r.data),

  listSaved: (): Promise<SavedEdital[]> => api.get('/editais/saved').then((r) => r.data),

  patchSaved: (id: string, input: { status?: SavedEditalStatus; notas?: string }): Promise<SavedEdital> =>
    api.patch(`/editais/saved/${id}`, input).then((r) => r.data),
}
