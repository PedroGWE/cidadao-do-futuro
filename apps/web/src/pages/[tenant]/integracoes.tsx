import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { AlertCircle, CheckCircle2, ExternalLink, KeyRound, LoaderCircle, Search } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/stores/auth.store'

type State = { id: number; nome: string; sigla: string }
type Municipality = { id: number; nome: string }
type SanctionResult = { source: string; status?: 'OK' | 'UNAVAILABLE'; error?: string | null; records: Record<string, unknown>[] }
type FiscalConfig = { configured: boolean; environment?: 'HOMOLOGACAO' | 'PRODUCAO'; issuer_cnpj?: string; issuer_city_code?: string; webhook_configured?: boolean; token_configured?: boolean; configured_in_system?: boolean; message?: string }

export default function IntegracoesPage() {
  const tenantId = useAuthStore((state) => state.user?.tenantId)
  const [states, setStates] = useState<State[]>([])
  const [uf, setUf] = useState('DF')
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [cnpj, setCnpj] = useState('')
  const [sanctions, setSanctions] = useState<SanctionResult[] | null>(null)
  const [error, setError] = useState('')
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingSanctions, setLoadingSanctions] = useState(false)
  const [fiscal, setFiscal] = useState<FiscalConfig | null>(null)
  const [fiscalCnpj, setFiscalCnpj] = useState('')
  const [fiscalCity, setFiscalCity] = useState('')
  const [fiscalEnvironment, setFiscalEnvironment] = useState<'HOMOLOGACAO' | 'PRODUCAO'>('HOMOLOGACAO')
  const [fiscalToken, setFiscalToken] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [savingFiscal, setSavingFiscal] = useState(false)
  const [fiscalMessage, setFiscalMessage] = useState('')

  useEffect(() => {
    api.get<State[]>('/public-data/ibge/states').then((response) => setStates(response.data)).catch(() => setError('Não foi possível carregar as UFs do IBGE.'))
    api.get<FiscalConfig>('/accountability/fiscal/config').then(({ data }) => {
      setFiscal(data)
      setFiscalCnpj(data.issuer_cnpj ?? '')
      setFiscalCity(data.issuer_city_code ?? '')
      setFiscalEnvironment(data.environment ?? 'HOMOLOGACAO')
    }).catch(() => setFiscalMessage('Você não possui acesso à configuração fiscal ou ela está indisponível.'))
  }, [])

  function generateWebhookSecret() {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    setWebhookSecret(Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join(''))
  }

  async function saveFiscal(event: React.FormEvent) {
    event.preventDefault()
    setSavingFiscal(true); setFiscalMessage('')
    try {
      const { data } = await api.put<FiscalConfig>('/accountability/fiscal/config', {
        issuer_cnpj: fiscalCnpj.replace(/\D/g, ''), issuer_city_code: fiscalCity,
        environment: fiscalEnvironment, token: fiscalToken.trim(),
        webhook_secret: webhookSecret.trim() || undefined,
      })
      setFiscal(data); setFiscalToken(''); setWebhookSecret('')
      setFiscalMessage('Configuração fiscal salva com segurança. O token não será exibido novamente.')
    } catch (caught) {
      const message = (caught as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
      setFiscalMessage(Array.isArray(message) ? message.join('; ') : message ?? 'Não foi possível salvar a configuração fiscal.')
    } finally { setSavingFiscal(false) }
  }

  async function searchMunicipalities(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoadingCities(true)
    try {
      const { data } = await api.get<Municipality[]>('/public-data/ibge/municipalities', { params: { uf } })
      setMunicipalities(data)
    } catch { setError('Não foi possível consultar os municípios no IBGE. Tente novamente.') }
    finally { setLoadingCities(false) }
  }

  async function checkSanctions(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSanctions(null)
    setLoadingSanctions(true)
    try {
      const digits = cnpj.replace(/\D/g, '')
      const { data } = await api.get<{ results: SanctionResult[] }>(`/public-data/transparency/sanctions/${digits}`)
      setSanctions(data.results)
    } catch (caught) {
      const response = (caught as { response?: { data?: { message?: string } } }).response
      setError(response?.data?.message ?? 'Não foi possível consultar as sanções. Confira o CNPJ e tente novamente.')
    } finally { setLoadingSanctions(false) }
  }

  return <DashboardLayout><div className="mx-auto max-w-5xl space-y-6">
    <div><h1 className="text-xl font-semibold text-gray-900">Dados públicos e integrações</h1><p className="mt-1 text-sm text-gray-500">Fontes oficiais para diagnóstico territorial, oportunidades e conformidade.</p></div>
    {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

    <section className="card space-y-4">
      <div className="flex items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold text-gray-900"><KeyRound className="h-4 w-4" />NFS-e Nacional · Focus NFe</h2><p className="text-sm text-gray-500">Configure as credenciais do instituto. O token e o segredo do webhook são criptografados no servidor e nunca retornam para o navegador.</p></div><span className={`rounded-full px-2 py-1 text-xs ${fiscal?.configured ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{fiscal?.configured ? 'Configurada' : 'Não configurada'}</span></div>
      <form onSubmit={saveFiscal} className="grid gap-3 md:grid-cols-2">
        <label className="text-xs text-gray-600">CNPJ emissor<input className="input mt-1" inputMode="numeric" pattern="[0-9]{14}" maxLength={14} value={fiscalCnpj} onChange={(event) => setFiscalCnpj(event.target.value.replace(/\D/g, ''))} required /></label>
        <label className="text-xs text-gray-600">Município emissor (código IBGE)<input className="input mt-1" inputMode="numeric" pattern="[0-9]{7}" maxLength={7} value={fiscalCity} onChange={(event) => setFiscalCity(event.target.value.replace(/\D/g, ''))} required /></label>
        <label className="text-xs text-gray-600">Ambiente<select className="input mt-1" value={fiscalEnvironment} onChange={(event) => setFiscalEnvironment(event.target.value as 'HOMOLOGACAO' | 'PRODUCAO')}><option value="HOMOLOGACAO">Homologação — sem valor fiscal</option><option value="PRODUCAO">Produção — validade fiscal</option></select></label>
        <label className="text-xs text-gray-600">Token Focus NFe<input className="input mt-1" type="password" autoComplete="new-password" minLength={8} maxLength={500} value={fiscalToken} onChange={(event) => setFiscalToken(event.target.value)} placeholder={fiscal?.token_configured ? 'Informe novamente para substituir' : 'Cole o token da Focus NFe'} required /></label>
        <label className="text-xs text-gray-600 md:col-span-2">Segredo do webhook (opcional)<div className="mt-1 flex gap-2"><input className="input flex-1" type="password" autoComplete="new-password" minLength={32} maxLength={255} value={webhookSecret} onChange={(event) => setWebhookSecret(event.target.value)} placeholder={fiscal?.webhook_configured ? 'Informe novamente para substituir' : 'Mínimo de 32 caracteres'} /><button type="button" className="btn-secondary whitespace-nowrap" onClick={generateWebhookSecret}>Gerar segredo</button></div></label>
        <div className="md:col-span-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600"><strong>Webhook na Focus:</strong> <code className="break-all">/api/v1/fiscal-webhooks/focus/{tenantId ?? 'ID_DO_TENANT'}</code><br />Cabeçalho: <code>x-amparo-webhook-secret</code>. Use o mesmo segredo informado acima. Ao editar, deixe o segredo vazio para manter o atual.</div>
        {fiscalEnvironment === 'PRODUCAO' && <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Produção emite documentos com validade fiscal. Ela também precisa estar liberada no servidor por <code>NFSE_PRODUCTION_ENABLED=true</code>.</div>}
        {fiscalMessage && <p role="status" className="md:col-span-2 text-sm text-gray-700">{fiscalMessage}</p>}
        <div className="md:col-span-2"><button className="btn-primary inline-flex items-center gap-2" disabled={savingFiscal}>{savingFiscal && <LoaderCircle className="h-4 w-4 animate-spin" />}Salvar configuração fiscal</button></div>
      </form>
    </section>

    <section className="card space-y-4">
      <div><h2 className="font-semibold text-gray-900">IBGE · Localidades</h2><p className="text-sm text-gray-500">Consulte municípios e códigos oficiais para padronizar o território atendido.</p></div>
      <form onSubmit={searchMunicipalities} className="flex flex-wrap gap-3">
        <select aria-label="Unidade da Federação" className="input min-w-48" value={uf} onChange={(event) => setUf(event.target.value)}>{states.map((state) => <option key={state.id} value={state.sigla}>{state.nome} ({state.sigla})</option>)}</select>
        <button className="btn-primary inline-flex items-center gap-2" disabled={loadingCities}>{loadingCities && <LoaderCircle className="h-4 w-4 animate-spin" />}Consultar municípios</button>
      </form>
      {municipalities.length > 0 && <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{municipalities.map((city) => <div key={city.id} className="rounded-lg border border-gray-200 px-3 py-2 text-sm"><span className="font-medium text-gray-800">{city.nome}</span><span className="ml-2 text-xs text-gray-500">IBGE {city.id}</span></div>)}</div>}
    </section>

    <section className="card space-y-4">
      <div><h2 className="font-semibold text-gray-900">Portal da Transparência · CEIS, CNEP e CEPIM</h2><p className="text-sm text-gray-500">Verifique registros de sanções federais para a organização ou um fornecedor. A consulta não substitui análise jurídica.</p></div>
      <form onSubmit={checkSanctions} className="flex flex-wrap gap-3"><input className="input min-w-64 flex-1" inputMode="numeric" maxLength={18} placeholder="CNPJ (14 dígitos)" value={cnpj} onChange={(event) => setCnpj(event.target.value)} required /><button className="btn-primary inline-flex items-center gap-2" disabled={loadingSanctions}>{loadingSanctions ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Consultar sanções</button></form>
      {sanctions && <div className="space-y-2">{sanctions.map((result) => <div key={result.source} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm"><span className="font-medium text-gray-800">{result.source}</span><span className={result.status === 'UNAVAILABLE' ? 'text-red-700' : result.records.length ? 'text-amber-700' : 'inline-flex items-center gap-1 text-emerald-700'}>{result.status === 'UNAVAILABLE' ? result.error ?? 'Consulta temporariamente indisponível' : result.records.length ? `${result.records.length} registro(s)` : <><CheckCircle2 className="h-4 w-4" />Nenhum registro encontrado</>}</span></div>)}</div>}
    </section>

    <section className="card space-y-3"><h2 className="font-semibold text-gray-900">Outras fontes integradas e acesso</h2>
      <div className="grid gap-3 sm:grid-cols-2">{
        [
          ['PNCP', 'Editais e oportunidades públicas', 'Disponível na aba Editais'],
          ['Transferegov / SICONV', 'Instrumentos e propostas federais', 'Integração ativa'],
          ['Ipeadata', 'Séries sociais e econômicas', 'Próxima etapa de integração'],
          ['Serpro · CNPJ', 'Consulta cadastral contratada', 'Requer credenciais e contrato'],
          ['CadÚnico · Conecta gov.br', 'Validação de elegibilidade', 'Restrito; requer habilitação e autorização'],
          ['Identidade gov.br', 'Login e assinatura eletrônica', 'Requer elegibilidade, aprovação e homologação'],
        ].map(([name, description, status]) => <div key={name} className="rounded-lg border border-gray-200 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-gray-800">{name}</p><p className="text-xs text-gray-500">{description}</p></div><span className="text-right text-xs text-gray-500">{status}</span></div></div>)}
      </div>
      <a className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline" href="https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email" target="_blank" rel="noreferrer">Obter token do Portal da Transparência <ExternalLink className="h-3 w-3" /></a>
    </section>
  </div></DashboardLayout>
}

export const getServerSideProps: GetServerSideProps = async () => ({ props: {} })
