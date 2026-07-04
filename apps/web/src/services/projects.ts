import api from '@/lib/api'

export type ProjectStatus =
  | 'RASCUNHO' | 'CAPTACAO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'SUSPENSO' | 'CANCELADO'

export type ProjectType =
  | 'CULTURAL' | 'ESPORTIVO' | 'EDUCACIONAL' | 'ASSISTENCIA_SOCIAL' | 'SAUDE' | 'AMBIENTAL'

export interface Project {
  id: string
  code: string
  name: string
  description?: string
  type: ProjectType
  status: ProjectStatus
  start_date?: string
  end_date?: string
  total_budget?: number
  approved_budget?: number
  tags: string[]
  created_at: string
  updated_at: string
  manager?: { id: string; name: string; email: string }
  _count: { members: number; tasks: number; phases: number }
}

export interface ProjectsPage {
  data: Project[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateProjectInput {
  name: string
  description?: string
  type: ProjectType
  code?: string
  start_date?: string
  end_date?: string
  total_budget?: number
}

export const projectsService = {
  list: (params?: Record<string, string | number>): Promise<ProjectsPage> =>
    api.get('/projects', { params }).then((r) => r.data),

  get: (id: string) => api.get(`/projects/${id}`).then((r) => r.data),

  create: (dto: CreateProjectInput) => api.post('/projects', dto).then((r) => r.data),

  update: (id: string, dto: Partial<CreateProjectInput> & { status?: ProjectStatus }) =>
    api.patch(`/projects/${id}`, dto).then((r) => r.data),

  remove: (id: string) => api.delete(`/projects/${id}`),

  phases: (id: string) => api.get(`/projects/${id}/phases`).then((r) => r.data),

  tasks: (id: string, params?: Record<string, string>) =>
    api.get(`/projects/${id}/tasks`, { params }).then((r) => r.data),

  members: (id: string) => api.get(`/projects/${id}/members`).then((r) => r.data),
}
