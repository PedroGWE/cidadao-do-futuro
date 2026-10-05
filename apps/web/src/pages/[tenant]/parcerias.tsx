import { FormEvent, useState } from 'react'
import useSWR from 'swr'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'
import PartnershipsDashboard from '@/components/partnerships/PartnershipsDashboard'

type Partner = { id: string; name: string; type: string; status: string; email?: string; _count: { partnerships: number } }
type Partnership = { id: string; type: string; status: string; value?: string; partner: { name: string }; project?: { name: string } }

function LegacyPartnershipsPage() {
  const { data: partners, error, isLoading, mutate } = useSWR<Partner[]>('/partners', (url: string) => api.get(url).then((r) => r.data))
  const { data: partnerships, mutate: mutatePartnerships } = useSWR<Partnership[]>('/partnerships', (url: string) => api.get(url).then((r) => r.data))
  const [name, setName] = useState('')
  const [type, setType] = useState('EMPRESA')
  const [message, setMessage] = useState('')

  async function createPartner(event: FormEvent) {
    event.preventDefault(); setMessage('')
    try {
      await api.post('/partners', { name, type })
      setName(''); setMessage('Parceiro cadastrado com sucesso.'); await mutate()
    } catch { setMessage('Não foi possível cadastrar o parceiro.') }
  }

  async function createPartnership(partnerId: string) {
    setMessage('')
    try {
      await api.post('/partnerships', { partner_id: partnerId, type: 'PARCERIA_TECNICA', status: 'PROPOSTA' })
      setMessage('Proposta de parceria criada.'); await mutatePartnerships()
    } catch { setMessage('Não foi possível criar a proposta.') }
  }

  return <DashboardLayout><div className="space-y-6">
    <div><h1 className="text-xl font-semibold text-gray-900">Parcerias</h1><p className="text-sm text-gray-500">Parceiros, propostas e vínculos com projetos.</p></div>
    <form onSubmit={createPartner} className="rounded-xl border bg-white p-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
      <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do parceiro" className="rounded-lg border px-3 py-2" />
      <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border px-3 py-2">
        <option value="EMPRESA">Empresa</option><option value="GOVERNO">Governo</option><option value="OUTRO_OSC">Outra OSC</option><option value="PESSOA_FISICA">Pessoa física</option><option value="INTERNACIONAL">Internacional</option>
      </select>
      <button className="rounded-lg bg-brand-600 px-4 py-2 text-white">Cadastrar</button>
    </form>
    {message && <p className="text-sm text-gray-700">{message}</p>}
    {error ? <p className="text-red-600">Erro ao carregar parceiros.</p> : isLoading ? <p>Carregando...</p> : !partners?.length ? <p className="rounded-xl border bg-white p-6 text-gray-500">Nenhum parceiro cadastrado.</p> :
      <div className="grid gap-3 md:grid-cols-2">{partners.map((partner) => <div key={partner.id} className="rounded-xl border bg-white p-4">
        <div className="flex justify-between gap-3"><div><h2 className="font-semibold">{partner.name}</h2><p className="text-sm text-gray-500">{partner.type.replaceAll('_', ' ')} · {partner.status}</p></div><span className="text-sm">{partner._count.partnerships} parceria(s)</span></div>
        <button onClick={() => createPartnership(partner.id)} className="mt-3 text-sm font-medium text-brand-700">Criar proposta técnica</button>
      </div>)}</div>}
    <section><h2 className="mb-3 font-semibold">Propostas e parcerias</h2>
      <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">Parceiro</th><th className="p-3">Tipo</th><th className="p-3">Projeto</th><th className="p-3">Situação</th></tr></thead><tbody>
        {partnerships?.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-3">{item.partner.name}</td><td className="p-3">{item.type.replaceAll('_', ' ')}</td><td className="p-3">{item.project?.name ?? '—'}</td><td className="p-3">{item.status}</td></tr>)}
        {!partnerships?.length && <tr><td colSpan={4} className="p-5 text-center text-gray-500">Nenhuma parceria registrada.</td></tr>}
      </tbody></table></div>
    </section>
  </div></DashboardLayout>
}

export default PartnershipsDashboard
