import type { GetServerSideProps } from 'next'
import { FormEvent, useEffect, useState } from 'react'
import useSWR, { mutate } from 'swr'
import { CheckCircle2, CloudDownload, Database, RefreshCw, Save } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  apiErrorMessage,
  transferegovService,
  type TransferegovRecord,
} from '@/services/transferegov'

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—'
}

function formatMoney(value?: string | null) {
  return value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value)) : '—'
}

export default function TransferegovPage() {
  const configuration = useSWR('transferegov-configuration', transferegovService.configuration)
  const history = useSWR('transferegov-history', transferegovService.history, {
    refreshInterval: (runs) => runs?.some((run) => run.status === 'RUNNING' || run.status === 'PENDING') ? 5000 : 0,
  })
  const records = useSWR('transferegov-records', transferegovService.records, {
    refreshInterval: () => history.data?.some((run) => run.status === 'RUNNING' || run.status === 'PENDING') ? 5000 : 0,
  })
  const [cnpj, setCnpj] = useState('')
  const [automaticSync, setAutomaticSync] = useState(false)
  const [intervalHours, setIntervalHours] = useState(24)
  const [selected, setSelected] = useState<string[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const data = configuration.data
    if (!data) return
    setCnpj(data.integration?.cnpj ?? data.institutional_cnpj ?? '')
    setAutomaticSync(data.integration?.automatic_sync ?? false)
    setIntervalHours(data.integration?.sync_interval_hours ?? 24)
  }, [configuration.data])

  async function refreshAll() {
    await Promise.all([configuration.mutate(), records.mutate(), history.mutate()])
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy('save'); setMessage(null)
    try {
      await transferegovService.configure({ cnpj, automatic_sync: automaticSync, sync_interval_hours: intervalHours })
      await refreshAll()
      setMessage({ kind: 'success', text: 'Integração salva com sucesso.' })
    } catch (error) {
      setMessage({ kind: 'error', text: apiErrorMessage(error, 'Não foi possível salvar a integração.') })
    } finally { setBusy(null) }
  }

  async function run(action: 'discover' | 'sync') {
    setBusy(action); setMessage(null)
    try {
      if (action === 'discover') await transferegovService.discover()
      else await transferegovService.sync()
      await refreshAll()
      setMessage({ kind: 'success', text: action === 'discover' ? 'Consulta iniciada. A primeira busca histórica pode levar alguns minutos; os resultados aparecerão ao concluir.' : 'Sincronização iniciada.' })
    } catch (error) {
      setMessage({ kind: 'error', text: apiErrorMessage(error, 'Não foi possível consultar o Transferegov.') })
    } finally { setBusy(null) }
  }

  async function syncRecords(recordIds: string[]) {
    if (!recordIds.length) return
    setBusy('import'); setMessage(null)
    try {
      const imported = await transferegovService.importRecords(recordIds) as Array<{ project_id: string }>
      setSelected([])
      await Promise.all([
        records.mutate(),
        mutate((key) => Array.isArray(key) && key[0] === '/projects'),
      ])
      const projectCount = new Set(imported.map((item) => item.project_id)).size
      setMessage({ kind: 'success', text: `${imported.length} registro(s) sincronizado(s) em ${projectCount} projeto(s), agrupados pelos títulos oficiais. A lista de Projetos foi atualizada.` })
    } catch (error) {
      setMessage({ kind: 'error', text: apiErrorMessage(error, 'Não foi possível importar os registros.') })
    } finally { setBusy(null) }
  }

  async function importSelected() {
    await syncRecords(selected)
  }

  const toggle = (record: TransferegovRecord) => {
    setSelected((current) => current.includes(record.id) ? current.filter((id) => id !== record.id) : [...current, record.id])
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Integração Transferegov</h1>
          <p className="text-sm text-gray-500">Consulte propostas e instrumentos públicos pelo CNPJ da organização.</p>
        </div>

        {message && <div className={`rounded-lg p-3 text-sm ${message.kind === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message.text}</div>}
        {configuration.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiErrorMessage(configuration.error, 'Não foi possível carregar a integração. Verifique seu acesso.')}</div>}

        <form className="card space-y-4" onSubmit={save}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900"><Database className="h-4 w-4" /> Configuração</h2>
            <span className="text-xs font-semibold text-gray-500">Status: {configuration.data?.integration?.status ?? 'NÃO CONFIGURADA'}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm text-gray-700 sm:col-span-2">CNPJ
              <input className="input mt-1 w-full" value={cnpj} onChange={(event) => setCnpj(event.target.value)} placeholder="Somente números" required />
            </label>
            <label className="text-sm text-gray-700">Intervalo
              <select className="input mt-1 w-full" value={intervalHours} onChange={(event) => setIntervalHours(Number(event.target.value))} disabled={!automaticSync}>
                <option value={24}>A cada 24 horas</option><option value={48}>A cada 48 horas</option><option value={72}>A cada 72 horas</option><option value={168}>Semanal</option>
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={automaticSync} onChange={(event) => setAutomaticSync(event.target.checked)} /> Sincronizar automaticamente</label>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary flex items-center gap-2" disabled={Boolean(busy)}><Save className="h-4 w-4" /> {busy === 'save' ? 'Salvando...' : 'Salvar integração'}</button>
            <button type="button" className="btn-secondary flex items-center gap-2" onClick={() => run('discover')} disabled={Boolean(busy) || !configuration.data?.integration}><CloudDownload className="h-4 w-4" /> Consultar agora</button>
            <button type="button" className="btn-secondary flex items-center gap-2" onClick={() => run('sync')} disabled={Boolean(busy) || !configuration.data?.integration}><RefreshCw className="h-4 w-4" /> Sincronizar</button>
          </div>
          {configuration.data?.integration && <div className="grid gap-2 text-xs text-gray-500 sm:grid-cols-3"><span>Última tentativa: {formatDate(configuration.data.integration.last_attempt_at)}</span><span>Último sucesso: {formatDate(configuration.data.integration.last_success_at)}</span><span>Próxima execução: {formatDate(configuration.data.integration.next_sync_at)}</span></div>}
        </form>

        <section className="card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-gray-900">Registros encontrados</h2><p className="mt-1 text-xs text-gray-500">Também selecione registros já vinculados para corrigir o projeto de destino. Sem projeto escolhido, os registros são agrupados pelo título oficial.</p></div><div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={() => syncRecords(records.data?.map((record) => record.id) ?? [])} disabled={!records.data?.length || Boolean(busy)}>{busy === 'import' ? 'Sincronizando...' : `Sincronizar todos (${records.data?.length ?? 0})`}</button><button className="btn-primary" onClick={importSelected} disabled={!selected.length || Boolean(busy)}>{busy === 'import' ? 'Sincronizando...' : `Sincronizar selecionados (${selected.length})`}</button></div></div>
          {!records.data ? <p className="text-sm text-gray-500">Carregando...</p> : records.data.length === 0 ? <p className="text-sm text-gray-500">Nenhum registro consultado ainda.</p> : (
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-xs uppercase text-gray-500"><tr><th className="p-2"></th><th className="p-2">Tipo / Fonte</th><th className="p-2">Objeto</th><th className="p-2">Situação</th><th className="p-2">Valor</th><th className="p-2">Destino</th></tr></thead><tbody className="divide-y">{records.data.map((record) => <tr key={record.id}><td className="p-2"><input aria-label={`Selecionar ${record.external_id}`} type="checkbox" checked={selected.includes(record.id)} onChange={() => toggle(record)} /></td><td className="p-2"><p>{record.entity_type}</p><p className="text-xs text-gray-500">{record.source_module === 'DISCRICIONARIAS_LEGAIS' ? 'Base histórica SICONV' : 'Gestão de Parcerias'}</p></td><td className="max-w-md p-2"><p className="font-medium text-gray-900">{record.title ?? record.external_id}</p><p className="text-xs text-gray-500">{record.proponent_name ?? '—'}</p></td><td className="p-2">{record.official_status ?? '—'}</td><td className="p-2">{formatMoney(record.global_amount)}</td><td className="p-2">{record.project ? <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-4 w-4" /> {record.project.name}</span> : 'Não importado'}</td></tr>)}</tbody></table></div>
          )}
        </section>

        <section className="card"><h2 className="mb-4 font-semibold text-gray-900">Histórico de sincronização</h2>{!history.data?.length ? <p className="text-sm text-gray-500">Nenhuma execução registrada.</p> : <div className="space-y-2">{history.data.slice(0, 10).map((runItem) => <div key={runItem.id} className="flex flex-wrap justify-between gap-2 border-b py-2 text-sm"><span>{formatDate(runItem.created_at)} · {runItem.trigger}</span><span className={runItem.status === 'FAILED' ? 'text-red-600' : 'text-gray-600'}>{runItem.status} · {runItem.consulted} consultados · {runItem.created_count} novos</span>{runItem.error_message && <p className="w-full text-xs text-red-600">{runItem.error_message}</p>}</div>)}</div>}</section>
      </div>
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (!context.req.cookies.refresh_token) return { redirect: { destination: '/login', permanent: false } }
  return { props: {} }
}
