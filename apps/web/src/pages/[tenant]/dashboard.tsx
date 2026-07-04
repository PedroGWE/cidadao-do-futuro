import { GetServerSideProps } from 'next'
import useSWR from 'swr'
import { FolderKanban, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { projectsService } from '@/services/projects'
import { financialService } from '@/services/financial'

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export default function DashboardPage() {
  const { data: projects, isLoading: loadingProjects } = useSWR(
    '/projects?limit=5',
    () => projectsService.list({ limit: 5, page: 1 }),
  )

  const { data: summary, isLoading: loadingSummary } = useSWR(
    '/financial/summary',
    () => financialService.summary(),
  )

  const { data: recentTx, isLoading: loadingTx } = useSWR(
    '/financial/transactions?limit=5',
    () => financialService.list({ limit: 5, page: 1 }),
  )

  return (
    <DashboardLayout>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <FolderKanban className="h-4 w-4 text-brand-600" />
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Projetos</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{projects?.total ?? '—'}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Receitas</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary ? formatCurrency(summary.receitas) : '—'}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Despesas</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary ? formatCurrency(summary.despesas) : '—'}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-brand-600" />
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Saldo</p>
          </div>
          <p className={`text-2xl font-bold ${summary && summary.saldo < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {summary ? formatCurrency(summary.saldo) : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projetos recentes */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Projetos recentes</h3>
          {loadingProjects ? (
            <PageSpinner />
          ) : !projects?.data.length ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum projeto cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {projects.data.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.code ? `${p.code} · ` : ''}{p._count.tasks} tarefas · {p._count.members} membros
                    </p>
                  </div>
                  <Badge value={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transações recentes */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Transações recentes</h3>
          {loadingTx ? (
            <PageSpinner />
          ) : !recentTx?.data.length ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhuma transação registrada.</p>
          ) : (
            <div className="space-y-3">
              {recentTx.data.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{tx.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.date)}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'RECEITA' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'RECEITA' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.req.cookies['refresh_token']) {
    return { redirect: { destination: '/auth/login', permanent: false } }
  }
  return { props: {} }
}
