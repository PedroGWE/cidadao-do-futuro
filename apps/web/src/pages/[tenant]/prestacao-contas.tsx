import { FormEvent, useState } from 'react'
import useSWR from 'swr'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'

type Report = { id: string; title: string; period_start: string; period_end: string; type: string; status: string; total_received?: string; total_spent?: string; balance?: string; project?: { name: string }; _count: { items: number; glosses: number } }
const money = (value?: string) => Number(value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function AccountabilityPage() {
  const { data, error, isLoading, mutate } = useSWR<Report[]>('/accountability', (url: string) => api.get(url).then((r) => r.data))
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [message, setMessage] = useState('')

  async function create(event: FormEvent) {
    event.preventDefault(); setMessage('')
    try {
      const response = await api.post('/accountability', { title, period_start: start, period_end: end, type: 'PARCIAL' })
      await api.post(`/accountability/${response.data.id}/consolidate`)
      setTitle(''); setStart(''); setEnd(''); setMessage('Prestação criada e consolidada.'); await mutate()
    } catch { setMessage('Não foi possível criar a prestação. Verifique o período.') }
  }

  async function consolidate(id: string) { await api.post(`/accountability/${id}/consolidate`); await mutate() }
  async function download(id: string) {
    const response = await api.get(`/accountability/${id}/export.csv`, { responseType: 'blob' })
    const url = URL.createObjectURL(response.data); const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `prestacao-${id}.csv`; anchor.click(); URL.revokeObjectURL(url)
  }

  return <DashboardLayout><div className="space-y-6">
    <div><h1 className="text-xl font-semibold text-gray-900">Prestação de contas</h1><p className="text-sm text-gray-500">Consolidação financeira rastreável por período.</p></div>
    <form onSubmit={create} className="rounded-xl border bg-white p-4 grid gap-3 md:grid-cols-[1fr_160px_160px_auto]">
      <input required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="rounded-lg border px-3 py-2" />
      <input required type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border px-3 py-2" />
      <input required type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border px-3 py-2" />
      <button className="rounded-lg bg-brand-600 px-4 py-2 text-white">Criar</button>
    </form>
    {message && <p className="text-sm text-gray-700">{message}</p>}
    {error ? <p className="text-red-600">Erro ao carregar prestações.</p> : isLoading ? <p>Carregando...</p> : !data?.length ? <p className="rounded-xl border bg-white p-6 text-gray-500">Nenhuma prestação criada.</p> :
      <div className="space-y-3">{data.map((report) => <article key={report.id} className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{report.title}</h2><p className="text-sm text-gray-500">{new Date(report.period_start).toLocaleDateString('pt-BR')} a {new Date(report.period_end).toLocaleDateString('pt-BR')} · {report.status}</p></div><div className="flex gap-3 text-sm"><button onClick={() => consolidate(report.id)} className="text-brand-700">Recalcular</button><button onClick={() => download(report.id)} className="text-brand-700">Exportar CSV</button></div></div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"><div><span className="text-xs text-gray-500">Receitas</span><p>{money(report.total_received)}</p></div><div><span className="text-xs text-gray-500">Despesas</span><p>{money(report.total_spent)}</p></div><div><span className="text-xs text-gray-500">Saldo</span><p>{money(report.balance)}</p></div><div><span className="text-xs text-gray-500">Registros</span><p>{report._count.items}</p></div></div>
      </article>)}</div>}
  </div></DashboardLayout>
}
