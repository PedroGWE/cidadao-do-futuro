import api from '@/lib/api'
import type { ProfessorStatus, TipoVinculo, FormaPagamento } from '@cidadao/shared'

export interface Professor {
  id: string
  nome_completo: string
  cpf: string
  email: string | null
  telefone: string | null
  tipo_vinculo: TipoVinculo
  status: ProfessorStatus
  disciplinas: string[]
  data_admissao: string | null
  projetos: ProfessorVinculo[]
  _count: { projetos: number; historico: number }
  created_at: string
  updated_at: string
}

export interface ProfessorVinculo {
  id: string
  status: ProfessorStatus
  carga_horaria_semanal: number | null
  project: { id: string; name: string }
}

export interface ProfessoresPage {
  data: Professor[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface HistoricoRemuneracao {
  id: string
  professor_id: string
  valor_hora_aula: number | null
  valor_mensal: number | null
  data_vigencia: string
  motivo: string | null
  created_at: string
}

export interface VinculoProfessorProjeto {
  id: string
  professor_id: string
  project_id: string
  data_inicio: string
  data_fim: string | null
  status: ProfessorStatus
  carga_horaria_semanal: number | null
  project: { id: string; name: string; status: string }
}

export const professoresService = {
  list: (params?: Record<string, string | number>): Promise<ProfessoresPage> =>
    api.get('/professores', { params }).then((r) => r.data),

  get: (id: string): Promise<Professor & { historico?: HistoricoRemuneracao[] }> =>
    api.get(`/professores/${id}`).then((r) => r.data),

  create: (dto: Record<string, unknown>): Promise<Professor> =>
    api.post('/professores', dto).then((r) => r.data),

  update: (id: string, dto: Record<string, unknown>): Promise<Professor> =>
    api.patch(`/professores/${id}`, dto).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/professores/${id}`),

  // Vínculos
  listVinculos: (id: string): Promise<VinculoProfessorProjeto[]> =>
    api.get(`/professores/${id}/vinculos`).then((r) => r.data),

  addVinculo: (id: string, dto: Record<string, unknown>): Promise<VinculoProfessorProjeto> =>
    api.post(`/professores/${id}/vinculos`, dto).then((r) => r.data),

  // Histórico de remuneração
  listHistorico: (id: string): Promise<HistoricoRemuneracao[]> =>
    api.get(`/professores/${id}/historico`).then((r) => r.data),

  addHistorico: (id: string, dto: Record<string, unknown>): Promise<HistoricoRemuneracao> =>
    api.post(`/professores/${id}/historico`, dto).then((r) => r.data),
}
