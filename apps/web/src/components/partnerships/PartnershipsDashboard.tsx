import { FormEvent, useMemo, useState } from 'react'
import useSWR from 'swr'
import { Building2, CircleDollarSign, Handshake, Mail, Phone, Plus, Search, Users2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { PageSpinner } from '@/components/ui/Spinner'
import api from '@/lib/api'
import { projectsService } from '@/services/projects'

type Partner = {
  id: string; name: string; type: string; status: string; email?: string; phone?: string
  tags: string[]; notes?: string; _count: { partnerships: number }
}

type Partnership = {
  id: string; type: string; status: string; value?: string; in_kind_value?: string
  description?: string; start_date?: string; end_date?: string
  partner: { id: string; name: string }; project?: { id: string; name: string }
}

const LABELS: Record<string, string> = {
  EMPRESA: 'Empresa', GOVERNO: 'Governo', OUTRO_OSC: 'Outra OSC', PESSOA_FISICA: 'Pessoa física', INTERNACIONAL: 'Internacional',
  PATROCINIO: 'Patrocínio', PARCERIA_TECNICA: 'Parceria técnica', COEXECUCAO: 'Coexecução', DOACAO: 'Doação', VOLUNTARIADO: 'Voluntariado',
}

const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('pt-BR') : 'Sem prazo'

export default function PartnershipsDashboard() {
  const { data: partners, error, isLoading, mutate } = useSWR<Partner[]>('/partners', (url: string) => api.get(url).then((r) => r.data))
  const { data: partnerships, mutate: mutatePartnerships } = useSWR<Partnership[]>('/partnerships', (url: string) => api.get(url).then((r) => r.data))
  const { data: projects } = useSWR('/projects-partnerships', () => projectsService.list({ limit: 100 }))
  const [search, setSearch] = useState('')
  const [showPartner, setShowPartner] = useState(false)
  const [selected, setSelected] = useState<Partner | null>(null)
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [partnerType, setPartnerType] = useState('EMPRESA')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [agreementType, setAgreementType] = useState('PARCERIA_TECNICA')
  const [projectId, setProjectId] = useState('')
  const [value, setValue] = useState('')
  const [description, setDescription] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    return (partners ?? []).filter((item) => !term || `${item.name} ${item.type} ${item.tags.join(' ')}`.toLocaleLowerCase('pt-BR').includes(term))
  }, [partners, search])
  const active = (partnerships ?? []).filter((item) => item.status === 'ATIVO')
  const mobilized = active.reduce((sum, item) => sum + Number(item.value ?? 0) + Number(item.in_kind_value ?? 0), 0)

  async function createPartner(event: FormEvent) {
    event.preventDefault(); setMessage('')
    try {
      await api.post('/partners', { name, type: partnerType, ...(email && { email }), ...(phone && { phone }) })
      setName(''); setEmail(''); setPhone(''); setShowPartner(false); setMessage('Parceiro cadastrado com sucesso.'); await mutate()
    } catch { setMessage('Não foi possível cadastrar o parceiro.') }
  }

  async function createPartnership(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    try {
      await api.post('/partnerships', { partner_id: selected.id, type: agreementType, status: 'PROPOSTA', ...(projectId && { project_id: projectId }), ...(value && { value: Number(value) }), ...(description && { description }) })
      setSelected(null); setProjectId(''); setValue(''); setDescription(''); setMessage('Proposta criada com sucesso.'); await Promise.all([mutate(), mutatePartnerships()])
    } catch { setMessage('Não foi possível criar a proposta.') }
  }

  const metrics = [
    ['Parceiros mapeados', String(partners?.length ?? 0), Building2, 'bg-blue-50 text-blue-700'],
    ['Parcerias ativas', String(active.length), Handshake, 'bg-emerald-50 text-emerald-700'],
    ['Em negociação', String((partnerships ?? []).filter((item) => item.status === 'PROPOSTA').length), Users2, 'bg-amber-50 text-amber-700'],
    ['Valor mobilizado', currency(mobilized), CircleDollarSign, 'bg-violet-50 text-violet-700'],
  ] as const

  return <DashboardLayout><div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Rede de impacto</p><h1 className="mt-1 text-2xl font-semibold text-gray-900">Parcerias</h1><p className="mt-1 text-sm text-gray-500">Organizações, propostas e recursos mobilizados para ampliar o impacto.</p></div><button onClick={() => setShowPartner(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" />Novo parceiro</button></header>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, metric, Icon, color]) => <div key={label} className="card flex items-center gap-4 p-4"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span><div><p className="text-xs text-gray-500">{label}</p><p className="mt-0.5 text-xl font-semibold text-gray-900">{metric}</p></div></div>)}</div>
    {message && <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div>}

    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-gray-900">Organizações parceiras</h2><p className="text-xs text-gray-500">{filtered.length} parceiro(s) exibido(s)</p></div><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="input w-full pl-9" placeholder="Buscar parceiro..." /></div></div>
      {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Erro ao carregar parceiros.</p> : isLoading ? <PageSpinner /> : !filtered.length ? <div className="card py-12 text-center text-sm text-gray-500">Nenhum parceiro encontrado.</div> :
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{filtered.map((partner) => <article key={partner.id} className="card p-5 hover:border-brand-200 hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">{partner.name.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span><div className="min-w-0"><h3 className="truncate font-semibold text-gray-900">{partner.name}</h3><p className="text-xs text-gray-500">{LABELS[partner.type] ?? partner.type}</p></div></div><Badge value={partner.status} /></div>
          <div className="mt-4 space-y-2 text-sm text-gray-600"><p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /><span className="truncate">{partner.email ?? 'E-mail não informado'}</span></p><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{partner.phone ?? 'Telefone não informado'}</p></div>
          {!!partner.tags.length && <div className="mt-4 flex flex-wrap gap-1.5">{partner.tags.map((tag) => <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{tag}</span>)}</div>}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3"><span className="text-xs text-gray-500">{partner._count.partnerships} parceria(s)</span><button onClick={() => setSelected(partner)} className="text-sm font-medium text-brand-700">Criar proposta</button></div>
        </article>)}</div>}
    </section>

    <section className="space-y-3"><div><h2 className="font-semibold text-gray-900">Propostas e parcerias</h2><p className="text-xs text-gray-500">Histórico de articulações por projeto.</p></div><div className="overflow-x-auto rounded-xl border border-gray-200 bg-white"><table className="w-full text-sm"><thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500"><tr><th className="p-4">Parceiro</th><th className="p-4">Modalidade</th><th className="p-4">Projeto</th><th className="p-4">Período</th><th className="p-4">Valor</th><th className="p-4">Situação</th></tr></thead><tbody className="divide-y divide-gray-100">{(partnerships ?? []).map((item) => <tr key={item.id} className="hover:bg-gray-50"><td className="p-4 font-medium text-gray-900">{item.partner.name}<p className="mt-0.5 max-w-xs truncate text-xs font-normal text-gray-500">{item.description}</p></td><td className="p-4 text-gray-600">{LABELS[item.type] ?? item.type}</td><td className="p-4 text-gray-600">{item.project?.name ?? 'Institucional'}</td><td className="p-4 text-xs text-gray-500">{formatDate(item.start_date)}{item.end_date ? ` — ${formatDate(item.end_date)}` : ''}</td><td className="p-4 font-medium text-gray-700">{currency(Number(item.value ?? 0) + Number(item.in_kind_value ?? 0))}</td><td className="p-4"><Badge value={item.status} /></td></tr>)}{!partnerships?.length && <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhuma parceria registrada.</td></tr>}</tbody></table></div></section>
  </div>

  <Modal open={showPartner} onClose={() => setShowPartner(false)} title="Novo parceiro"><form onSubmit={createPartner} className="space-y-4"><div><label className="label">Nome da organização *</label><input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className="input w-full" /></div><div><label className="label">Tipo *</label><select value={partnerType} onChange={(e) => setPartnerType(e.target.value)} className="input w-full"><option value="EMPRESA">Empresa</option><option value="GOVERNO">Governo</option><option value="OUTRO_OSC">Outra OSC</option><option value="PESSOA_FISICA">Pessoa física</option><option value="INTERNACIONAL">Internacional</option></select></div><div className="grid grid-cols-2 gap-3"><div><label className="label">E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input w-full" /></div><div><label className="label">Telefone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className="input w-full" /></div></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setShowPartner(false)} className="btn-secondary">Cancelar</button><button className="btn-primary">Cadastrar</button></div></form></Modal>

  <Modal open={!!selected} onClose={() => setSelected(null)} title={`Nova parceria${selected ? ` · ${selected.name}` : ''}`}><form onSubmit={createPartnership} className="space-y-4"><div><label className="label">Modalidade *</label><select value={agreementType} onChange={(e) => setAgreementType(e.target.value)} className="input w-full"><option value="PARCERIA_TECNICA">Parceria técnica</option><option value="PATROCINIO">Patrocínio</option><option value="DOACAO">Doação</option><option value="COEXECUCAO">Coexecução</option><option value="VOLUNTARIADO">Voluntariado</option></select></div><div><label className="label">Projeto</label><select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input w-full"><option value="">Parceria institucional</option>{projects?.data.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></div><div><label className="label">Valor estimado (R$)</label><input type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="input w-full" /></div><div><label className="label">Objetivo</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input h-24 w-full resize-none" /></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelected(null)} className="btn-secondary">Cancelar</button><button className="btn-primary">Criar proposta</button></div></form></Modal>
  </DashboardLayout>
}
