import { useState } from 'react'
import { GetServerSideProps } from 'next'
import useSWR, { mutate } from 'swr'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, FolderKanban } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { PageSpinner } from '@/components/ui/Spinner'
import { projectsService, type Project, type ProjectType, type ProjectStatus } from '@/services/projects'

const PROJECT_TYPES: ProjectType[] = [
  'CULTURAL', 'ESPORTIVO', 'EDUCACIONAL', 'ASSISTENCIA_SOCIAL', 'SAUDE', 'AMBIENTAL',
]

const PROJECT_STATUSES: ProjectStatus[] = [
  'RASCUNHO', 'CAPTACAO', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO', 'SUSPENSO', 'CANCELADO',
]

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  type: z.enum(['CULTURAL', 'ESPORTIVO', 'EDUCACIONAL', 'ASSISTENCIA_SOCIAL', 'SAUDE', 'AMBIENTAL']),
  description: z.string().optional(),
  code: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  total_budget: z.coerce.number().positive().optional(),
})

type FormData = z.infer<typeof schema>

const TYPE_LABELS: Record<ProjectType, string> = {
  CULTURAL: 'Cultural',
  ESPORTIVO: 'Esportivo',
  EDUCACIONAL: 'Educacional',
  ASSISTENCIA_SOCIAL: 'Assistência Social',
  SAUDE: 'Saúde',
  AMBIENTAL: 'Ambiental',
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  RASCUNHO: 'Rascunho', CAPTACAO: 'Captação', APROVADO: 'Aprovado',
  EM_EXECUCAO: 'Em Execução', CONCLUIDO: 'Concluído', SUSPENSO: 'Suspenso', CANCELADO: 'Cancelado',
}

function formatCurrency(v?: number) {
  if (!v) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export default function ProjetosPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const params: Record<string, string | number> = { page, limit: 20 }
  if (search) params.search = search
  if (statusFilter) params.status = statusFilter

  const key = ['/projects', params] as const
  const { data, isLoading, error } = useSWR(key, () => projectsService.list(params), {
    keepPreviousData: true,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(dto: FormData) {
    await projectsService.create(dto)
    mutate(key)
    reset()
    setModalOpen(false)
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="input pl-9 w-64"
              placeholder="Buscar projeto..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="input w-44"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="">Todos os status</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo projeto
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <PageSpinner />
      ) : error ? (
        <p className="text-center text-sm text-red-500 py-12">Erro ao carregar projetos.</p>
      ) : !data?.data.length ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FolderKanban className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-sm text-gray-500">Nenhum projeto encontrado.</p>
          <button className="btn-primary mt-4 flex items-center gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />Criar primeiro projeto
          </button>
        </div>
      ) : (
        <>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Código', 'Projeto', 'Tipo', 'Status', 'Orçamento', 'Início', 'Membros', 'Tarefas'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((p: Project) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.code ?? '—'}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.manager && <p className="text-xs text-gray-400 mt-0.5">{p.manager.name}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[p.type]}</td>
                    <td className="px-4 py-3"><Badge value={p.status} /></td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(p.total_budget)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(p.start_date)}</td>
                    <td className="px-4 py-3 text-gray-600">{p._count.members}</td>
                    <td className="px-4 py-3 text-gray-600">{p._count.tasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>{data.total} projetos</span>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >Anterior</button>
                <span className="px-3 py-1">{page} / {data.totalPages}</span>
                <button
                  className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40"
                  disabled={page === data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >Próximo</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Criar Projeto */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Novo projeto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nome do projeto *</label>
            <input className="input" placeholder="Ex: Projeto Arte na Escola" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo *</label>
              <select className="input" {...register('type')}>
                <option value="">Selecione...</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <label className="label">Código (opcional)</label>
              <input className="input" placeholder="Ex: PROJ-001" {...register('code')} />
            </div>
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea className="input resize-none h-20" placeholder="Descreva o objetivo do projeto..." {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data de início</label>
              <input type="date" className="input" {...register('start_date')} />
            </div>
            <div>
              <label className="label">Data de término</label>
              <input type="date" className="input" {...register('end_date')} />
            </div>
          </div>

          <div>
            <label className="label">Orçamento total (R$)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0,00"
              {...register('total_budget')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => { setModalOpen(false); reset() }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Criar projeto'}
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
