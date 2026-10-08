import axios from 'axios'
import api from '@/lib/api'

export interface TransferegovIntegration {
  id: string
  cnpj: string
  automatic_sync: boolean
  sync_interval_hours: number
  status: 'NOT_CONFIGURED' | 'READY' | 'SYNCING' | 'ERROR'
  last_attempt_at?: string | null
  last_success_at?: string | null
  next_sync_at?: string | null
  last_error?: string | null
}

export interface TransferegovRecord {
  id: string
  source_module: string
  entity_type: 'PROPOSTA' | 'INSTRUMENTO'
  external_id: string
  proposal_external_id?: string | null
  proposal_year?: number | null
  instrument_number?: string | null
  title?: string | null
  proponent_name?: string | null
  official_status?: string | null
  global_amount?: string | null
  collected_at: string
  imported_at?: string | null
  project?: { id: string; name: string } | null
}

export interface TransferegovRun {
  id: string
  trigger: string
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'PARTIAL' | 'FAILED'
  consulted: number
  created_count: number
  updated_count: number
  rejected_count: number
  error_message?: string | null
  created_at: string
}

export interface TransferegovConfiguration {
  integration: TransferegovIntegration | null
  institutional_cnpj: string | null
}

export function apiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  const response = error.response?.data as { message?: string | string[] } | undefined
  const message = response?.message
  return Array.isArray(message) ? message.join(' ') : message || fallback
}

export const transferegovService = {
  configuration: () => api.get<TransferegovConfiguration>('/integrations/transferegov').then((response) => response.data),
  configure: (data: { cnpj: string; automatic_sync: boolean; sync_interval_hours: number }) =>
    api.put<TransferegovIntegration>('/integrations/transferegov', data).then((response) => response.data),
  discover: () => api.post('/integrations/transferegov/discover').then((response) => response.data),
  sync: () => api.post('/integrations/transferegov/sync').then((response) => response.data),
  records: () => api.get<TransferegovRecord[]>('/integrations/transferegov/records').then((response) => response.data),
  history: () => api.get<TransferegovRun[]>('/integrations/transferegov/history').then((response) => response.data),
  importRecords: (recordIds: string[], projectId?: string) =>
    api.post('/integrations/transferegov/import', { record_ids: recordIds, ...(projectId ? { project_id: projectId } : {}) }).then((response) => response.data),
}
