import api from '@/lib/api'

export type ProjectStatus =
  | 'RASCUNHO' | 'CAPTACAO' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'SUSPENSO' | 'CANCELADO'

export type ProjectType =
  | 'CULTURAL' | 'ESPORTIVO' | 'EDUCACIONAL' | 'ASSISTENCIA_SOCIAL' | 'SAUDE' | 'AMBIENTAL' | 'OUTROS'

export interface Project {
  id: string
  code: string
  name: string
  description?: string
  type: ProjectType
  status: ProjectStatus
  start_date?: string
  end_date?: string
  total_budget?: number | string
  approved_budget?: number | string
  tags: string[]
  created_at: string
  updated_at: string
  manager?: { id: string; name: string; email: string }
  _count: { members: number; tasks: number; phases: number }
  task_progress?: { total: number; completed: number; overdue: number }
}

export interface ProjectTask {
  id: string
  title: string
  description?: string
  phase_id?: string
  due_date?: string
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA' | 'BLOQUEADA'
  priority: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
  phase?: { id: string; name: string }
  assignee?: { id: string; name: string }
}

export interface ProjectPhase {
  id: string
  name: string
  order: number
  start_date?: string
  end_date?: string
  status: 'NAO_INICIADA' | 'EM_ANDAMENTO' | 'CONCLUIDA'
  _count?: { tasks: number }
}

export interface ProjectIndicator {
  id: string
  name: string
  description?: string
  unit?: string
  baseline?: number | string
  target?: number | string
  current_value?: number | string
  frequency?: 'DIARIO' | 'SEMANAL' | 'MENSAL' | 'TRIMESTRAL' | 'ANUAL'
  last_updated?: string
}

export interface ProjectOverview {
  projects: { total: number; executing: number; completed: number; planning: number }
  budget: { planned: number; approved: number }
  tasks: { total: number; completed: number; open: number; overdue: number }
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
  overview: (): Promise<ProjectOverview> => api.get('/projects/overview').then((r) => r.data),

  list: (params?: Record<string, string | number>): Promise<ProjectsPage> =>
    api.get('/projects', { params }).then((r) => r.data),

  get: (id: string) => api.get(`/projects/${id}`).then((r) => r.data),

  create: (dto: CreateProjectInput) => api.post('/projects', dto).then((r) => r.data),

  update: (id: string, dto: Partial<CreateProjectInput> & { status?: ProjectStatus }) =>
    api.patch(`/projects/${id}`, dto).then((r) => r.data),

  remove: (id: string) => api.delete(`/projects/${id}`),

  phases: (id: string) => api.get(`/projects/${id}/phases`).then((r) => r.data),

  createPhase: (id: string, dto: { name: string; order: number; start_date?: string; end_date?: string }) =>
    api.post(`/projects/${id}/phases`, dto).then((r) => r.data),

  indicators: (id: string): Promise<ProjectIndicator[]> => api.get(`/projects/${id}/indicators`).then((r) => r.data),

  createIndicator: (id: string, dto: { name: string; description?: string; unit?: string; baseline?: number; target?: number; current_value?: number; frequency?: ProjectIndicator['frequency'] }) =>
    api.post(`/projects/${id}/indicators`, dto).then((r) => r.data),

  updateIndicator: (id: string, indicatorId: string, current_value: number) =>
    api.patch(`/projects/${id}/indicators/${indicatorId}`, { current_value }).then((r) => r.data),

  tasks: (id: string, params?: Record<string, string>) =>
    api.get(`/projects/${id}/tasks`, { params }).then((r) => r.data),

  createTask: (id: string, dto: { title: string; phase_id?: string; due_date?: string; priority?: ProjectTask['priority'] }) =>
    api.post(`/projects/${id}/tasks`, dto).then((r) => r.data),

  updateTask: (id: string, taskId: string, dto: { status?: ProjectTask['status'] }) =>
    api.patch(`/projects/${id}/tasks/${taskId}`, dto).then((r) => r.data),

  members: (id: string) => api.get(`/projects/${id}/members`).then((r) => r.data),
}
