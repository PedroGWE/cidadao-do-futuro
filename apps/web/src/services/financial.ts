import api from '@/lib/api'

export type TransactionType = 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA' | 'DEVOLUCAO'
export type TransactionStatus = 'PENDENTE' | 'APROVADO' | 'PAGO' | 'CANCELADO' | 'ESTORNADO'

export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  description: string
  amount: number
  date: string
  due_date?: string
  paid_at?: string
  payment_method?: string
  reference_number?: string
  category?: string
  tags: string[]
  created_at: string
  project?: { id: string; name: string; code: string }
  cost_center?: { id: string; name: string; code: string }
  creator?: { id: string; name: string }
  approver?: { id: string; name: string }
  _count: { invoices: number; payment_orders: number }
}

export interface TransactionsPage {
  data: Transaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FinancialSummary {
  receitas: number
  despesas: number
  saldo: number
  pendentes: number
}

export interface CreateTransactionInput {
  type: TransactionType
  description: string
  amount: number
  date: string
  due_date?: string
  project_id?: string
  category?: string
  payment_method?: string
  reference_number?: string
}

export const financialService = {
  summary: (params?: Record<string, string>): Promise<FinancialSummary> =>
    api.get('/financial/summary', { params }).then((r) => r.data),

  list: (params?: Record<string, string | number>): Promise<TransactionsPage> =>
    api.get('/financial/transactions', { params }).then((r) => r.data),

  get: (id: string): Promise<Transaction> =>
    api.get(`/financial/transactions/${id}`).then((r) => r.data),

  create: (dto: CreateTransactionInput): Promise<Transaction> =>
    api.post('/financial/transactions', dto).then((r) => r.data),

  approve: (id: string) => api.patch(`/financial/transactions/${id}/approve`).then((r) => r.data),

  markPaid: (id: string) => api.patch(`/financial/transactions/${id}/pay`).then((r) => r.data),

  cancel: (id: string) => api.patch(`/financial/transactions/${id}/cancel`).then((r) => r.data),
}
