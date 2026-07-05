import { useState } from 'react'
import { GetServerSideProps } from 'next'
import useSWR, { mutate } from 'swr'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, TrendingUp, TrendingDown, Wallet, Clock } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { PageSpinner } from '@/components/ui/Spinner'
import { financialService, type Transaction, type TransactionType } from '@/services/financial'

const TYPES: TransactionType[] = ['RECEITA', 'DESPESA', 'TRANSFERENCIA', 'DEVOLUCAO']

const schema = z.object({
  type: z.enum(['RECEITA', 'DESPESA', 'TRANSFERENCIA', 'DEVOLUCAO']),
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  date: z.string().min(1, 'Obrigatório'),
  due_date: z.string().optional(),
  category: z.string().optional(),
  payment_method: z.string().optional(),
  reference_number: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function SummaryCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string
}) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(value)}</p>
      </div>
    </div>
  )
}

export default function FinanceiroPage() {
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const params: Record<string, string | number> = { page, limit: 20 }
  if (typeFilter) params.type = typeFilter
  if (statusFilter) params.status = statusFilter

  const txKey = ['/financial/transactions', params] as const
  const { data, isLoading } = useSWR(txKey, () => financialService.list(params), { keepPreviousData: true })
  const { data: summary } = useSWR('/financial/summary', () => financialService.summary())

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  async function onSubmit(dto: FormData) {
    await financialService.create(dto)
    mutate(txKey)
    mutate('/financial/summary')
    reset()
    setModalOpen(false)
  }

  return (
    <DashboardLayout>
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard label="Receitas" value={summary.receitas} icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
          <SummaryCard label="Despesas" value={summary.despesas} icon={TrendingDown} color="bg-red-50 text-red-500" />
          <SummaryCard label="Saldo" value={summary.saldo} icon={Wallet} color="bg-brand-50 text-brand-600" />
          <SummaryCard label="Pendentes" value={summary.pendentes} icon={Clock} color="bg-amber-50 text-amber-600" />
        </div>
      )}

      {/* Filters + New */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          <select className="input w-40" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}>
            <option value="">Todos os tipos</option>
            {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase().replace('_', ' ')}</option>)}
          </select>
          <select className="input w-40" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">Todos os status</option>
            {['PENDENTE', 'APROVADO', 'PAGO', 'CANCELADO'].map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />Nova transação
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <PageSpinner />
      ) : !data?.data.length ? (
        <div className="card flex flex-col items-center justify-center h-48">
          <p className="text-sm text-gray-400">Nenhuma transação encontrada.</p>
        </div>
      ) : (
        <>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Data', 'Descrição', 'Tipo', 'Status', 'Projeto', 'Valor', 'Ações'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((tx: Transaction) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{tx.description}</p>
                      {tx.category && <p className="text-xs text-gray-400 mt-0.5">{tx.category}</p>}
                    </td>
                    <td className="px-4 py-3"><Badge value={tx.type} /></td>
                    <td className="px-4 py-3"><Badge value={tx.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{tx.project?.name ?? '—'}</td>
                    <td className={`px-4 py-3 font-semibold whitespace-nowrap ${tx.type === 'RECEITA' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'RECEITA' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {tx.status === 'PENDENTE' && (
                          <>
                            <button
                              onClick={() => financialService.approve(tx.id).then(() => mutate(txKey))}
                              className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                            >Aprovar</button>
                            <button
                              onClick={() => financialService.cancel(tx.id).then(() => mutate(txKey))}
                              className="text-xs px-2 py-1 rounded bg-red-50 text-red-500 hover:bg-red-100"
                            >Cancelar</button>
                          </>
                        )}
                        {tx.status === 'APROVADO' && (
                          <button
                            onClick={() => financialService.markPaid(tx.id).then(() => { mutate(txKey); mutate('/financial/summary') })}
                            className="text-xs px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100"
                          >Marcar pago</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>{data.total} transações</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
                <span className="px-3 py-1">{page} / {data.totalPages}</span>
                <button className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40" disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)}>Próximo</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Nova Transação */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Nova transação">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo *</label>
              <select className="input" {...register('type')}>
                <option value="">Selecione...</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <label className="label">Valor (R$) *</label>
              <input type="number" step="0.01" className="input" placeholder="0,00" {...register('amount')} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Descrição *</label>
            <input className="input" placeholder="Ex: Pagamento de fornecedor" {...register('description')} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data *</label>
              <input type="date" className="input" {...register('date')} />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="label">Vencimento</label>
              <input type="date" className="input" {...register('due_date')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Categoria</label>
              <input className="input" placeholder="Ex: Material" {...register('category')} />
            </div>
            <div>
              <label className="label">Forma de pagamento</label>
              <input className="input" placeholder="Ex: PIX, TED" {...register('payment_method')} />
            </div>
          </div>

          <div>
            <label className="label">Nº de referência</label>
            <input className="input" placeholder="NF, boleto, contrato..." {...register('reference_number')} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => { setModalOpen(false); reset() }}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.req.cookies['refresh_token']) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}
