import { useMemo, useState } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR, { useSWRConfig } from 'swr'
import {
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Clock3,
  ExternalLink,
  Loader2,
  Search,
  X,
} from 'lucide-react'
import {
  ABRANGENCIAS,
  ABRANGENCIA_LABELS,
  SAVED_EDITAL_STATUSES,
  SAVED_EDITAL_STATUS_LABELS,
  UFS,
  type EditalComScore,
  type SavedEditalStatus,
} from '@cidadao/shared'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { PageSpinner } from '@/components/ui/Spinner'
import { editaisService, type EditalDetail, type SavedEdital } from '@/services/editais'

function formatCurrency(v: number | null) {
  if (v == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatDate(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function daysLeft(d?: string | null): number | null {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)
}

function ScoreBadge({ score, motivos }: { score: number; motivos: string[] }) {
  const color =
    score >= 70 ? 'bg-growth-100 text-growth-700' : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
  return (
    <span
      title={motivos.join('\n')}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold cursor-help ${color}`}
    >
      {score}% match
    </span>
  )
}

function Countdown({ date }: { date: string | null }) {
  const dias = daysLeft(date)
  if (dias == null) return <span className="text-gray-400">sem prazo</span>
  if (dias < 0) return <span className="text-red-600 font-medium">encerrado</span>
  if (dias <= 15) {
    return (
      <span className="inline-flex items-center gap-1 text-star-600 font-semibold">
        <Clock3 className="h-3.5 w-3.5" />
        {dias === 0 ? 'encerra hoje' : `${dias} dia${dias > 1 ? 's' : ''} restante${dias > 1 ? 's' : ''}`}
      </span>
    )
  }
  return <span className="text-gray-600">encerra {formatDate(date)}</span>
}

const CHECKLIST_LABEL: Record<string, string> = {
  VALIDO: 'Válido',
  VENCIDO: 'Vencido',
  PENDENTE: 'Pendente',
  NAO_MAPEADO: 'Não mapeado',
}

export default function EditaisPage() {
  const router = useRouter()
  const tenant = router.query.tenant as string
  const { mutate } = useSWRConfig()

  const [tab, setTab] = useState<'buscar' | 'meus'>('buscar')

  // filtros aplicados (disparam a busca) vs. rascunho (inputs)
  const [draft, setDraft] = useState({ q: '', uf: '', abrangencia: '', encerra_ate: '' })
  const [filters, setFilters] = useState(draft)
  const [page, setPage] = useState(1)

  const searchKey = ['/editais/search', filters, page] as const
  const { data: result, isLoading } = useSWR(
    tab === 'buscar' ? searchKey : null,
    () => editaisService.search({ ...filters, page } as any),
    { revalidateOnFocus: false },
  )

  const { data: saved } = useSWR('/editais/saved', editaisService.listSaved)
  const savedRefs = useMemo(() => new Set(saved?.map((s) => s.edital_ref)), [saved])

  const [detailRef, setDetailRef] = useState<{ fonte: string; externalId: string } | null>(null)
  const { data: detail, isLoading: loadingDetail } = useSWR(
    detailRef ? ['/editais/detail', detailRef.fonte, detailRef.externalId] : null,
    () => editaisService.detail(detailRef!.fonte, detailRef!.externalId),
  )

  const activeChips = useMemo(
    () =>
      Object.entries(filters)
        .filter(([, v]) => v)
        .map(([k, v]) => ({
          key: k,
          label:
            k === 'q' ? `"${v}"`
            : k === 'uf' ? `UF: ${v}`
            : k === 'abrangencia' ? ABRANGENCIA_LABELS[v as keyof typeof ABRANGENCIA_LABELS]
            : `até ${formatDate(v)}`,
        })),
    [filters],
  )

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault()
    setPage(1)
    setFilters(draft)
  }

  function clearChip(key: string) {
    const next = { ...filters, [key]: '' }
    setDraft(next)
    setFilters(next)
    setPage(1)
  }

  async function handleSave(edital: EditalComScore) {
    await editaisService.save({
      fonte: edital.fonte,
      external_id: edital.externalId,
      titulo: edital.titulo,
      orgao: edital.orgao ?? undefined,
      data_encerramento: edital.dataEncerramento,
    })
    mutate('/editais/saved')
  }

  async function moveSaved(item: SavedEdital, status: SavedEditalStatus) {
    mutate(
      '/editais/saved',
      (saved ?? []).map((s) => (s.id === item.id ? { ...s, status } : s)),
      { revalidate: false },
    )
    await editaisService.patchSaved(item.id, { status })
    mutate('/editais/saved')
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Buscar Editais</h1>
        <p className="text-sm text-gray-500 mt-1">Encontre editais disponíveis para sua organização.</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {([['buscar', 'Buscar'], ['meus', `Meus Editais${saved?.length ? ` (${saved.length})` : ''}`]] as const).map(
          ([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key
                  ? 'border-brand-600 text-brand-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ),
        )}
      </div>

      {tab === 'buscar' ? (
        <>
          <form onSubmit={applyFilters} className="card mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="lg:col-span-2">
                <input
                  className="input"
                  placeholder="Buscar por título, órgão ou descrição..."
                  value={draft.q}
                  onChange={(e) => setDraft({ ...draft, q: e.target.value })}
                />
              </div>
              <select className="input" value={draft.uf} onChange={(e) => setDraft({ ...draft, uf: e.target.value })}>
                <option value="">Todas as UFs</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
              <select
                className="input"
                value={draft.abrangencia}
                onChange={(e) => setDraft({ ...draft, abrangencia: e.target.value })}
              >
                <option value="">Toda abrangência</option>
                {ABRANGENCIAS.map((a) => (
                  <option key={a} value={a}>{ABRANGENCIA_LABELS[a]}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="input"
                  title="Encerra até"
                  value={draft.encerra_ate}
                  onChange={(e) => setDraft({ ...draft, encerra_ate: e.target.value })}
                />
                <button type="submit" className="btn-primary flex-shrink-0 px-3" title="Buscar">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-800 px-2.5 py-1 text-xs font-medium"
                  >
                    {chip.label}
                    <button type="button" onClick={() => clearChip(chip.key)} className="hover:text-brand-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </form>

          {result?.dadosDesatualizados && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 mb-4">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              A fonte externa está indisponível no momento — exibindo os últimos resultados conhecidos.
            </div>
          )}

          {isLoading ? (
            <PageSpinner />
          ) : !result?.data.length ? (
            <div className="card">
              <p className="text-sm text-gray-400 text-center py-8">
                Nenhum edital encontrado. Ajuste os filtros e tente novamente.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {result.data.map((e) => {
                  const ref = `${e.fonte}:${e.externalId}`
                  const isSaved = savedRefs.has(ref)
                  return (
                    <div key={ref} className="card flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          onClick={() => setDetailRef({ fonte: e.fonte, externalId: e.externalId })}
                          className="text-left font-semibold text-gray-900 hover:text-brand-700 transition-colors line-clamp-2"
                        >
                          {e.titulo}
                        </button>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Badge value={e.fonte} />
                          <ScoreBadge score={e.matchScore} motivos={e.motivos} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1">{e.orgao ?? 'Órgão não informado'}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-800">{formatCurrency(e.valorTotal)}</span>
                        <Countdown date={e.dataEncerramento} />
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                        <button
                          onClick={() => setDetailRef({ fonte: e.fonte, externalId: e.externalId })}
                          className="btn-ghost text-brand-700 text-xs px-2 py-1.5"
                        >
                          Ver detalhes
                        </button>
                        <button
                          onClick={() => handleSave(e)}
                          disabled={isSaved}
                          className="btn-ghost text-xs px-2 py-1.5 inline-flex items-center gap-1 disabled:opacity-60"
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="h-3.5 w-3.5 text-growth-600" />
                              Salvo
                            </>
                          ) : (
                            <>
                              <Bookmark className="h-3.5 w-3.5" />
                              Salvar edital
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {result.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button className="btn-ghost text-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    Anterior
                  </button>
                  <span className="text-sm text-gray-500">
                    {page} / {result.totalPages} · {result.total} editais
                  </span>
                  <button
                    className="btn-ghost text-sm"
                    disabled={page >= result.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* -------- Meus Editais: funil -------- */
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {SAVED_EDITAL_STATUSES.filter((s) => s !== 'ENCERRADO').map((status) => {
            const items = (saved ?? []).filter((s) => s.status === status)
            return (
              <div key={status} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {SAVED_EDITAL_STATUS_LABELS[status]}
                  </p>
                  <span className="text-xs font-bold text-gray-400">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="card p-3 space-y-2">
                      <button
                        onClick={() =>
                          item.external_id && setDetailRef({ fonte: item.fonte, externalId: item.external_id })
                        }
                        className="text-left text-sm font-medium text-gray-800 hover:text-brand-700 line-clamp-2"
                      >
                        {item.titulo}
                      </button>
                      <p className="text-xs text-gray-400 line-clamp-1">{item.orgao ?? '—'}</p>
                      <Countdown date={item.data_encerramento} />
                      <select
                        className="input text-xs py-1.5"
                        value={item.status}
                        onChange={(e) => moveSaved(item, e.target.value as SavedEditalStatus)}
                      >
                        {SAVED_EDITAL_STATUSES.map((s) => (
                          <option key={s} value={s}>{SAVED_EDITAL_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-gray-300 text-center py-4">Vazio</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* -------- Modal de detalhe -------- */}
      <Modal
        open={!!detailRef}
        onClose={() => setDetailRef(null)}
        title={detail?.titulo ?? 'Detalhes do edital'}
        size="lg"
      >
        {loadingDetail || !detail ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={detail.fonte} />
              <ScoreBadge score={detail.matchScore} motivos={detail.motivos} />
              {detail.uf && <span className="text-xs text-gray-500">UF: {detail.uf}</span>}
              {detail.areaTematica && <span className="text-xs text-gray-500">· {detail.areaTematica}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Órgão</p>
                <p className="text-gray-800">{detail.orgao ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Valor</p>
                <p className="text-gray-800 font-semibold">{formatCurrency(detail.valorTotal)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Abertura</p>
                <p className="text-gray-800">{formatDate(detail.dataAbertura)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Encerramento</p>
                <Countdown date={detail.dataEncerramento} />
              </div>
            </div>

            {detail.descricao && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Descrição</p>
                <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-[8]">{detail.descricao}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Compatibilidade</p>
              <ul className="space-y-1">
                {detail.motivos.map((m) => (
                  <li key={m} className="text-xs text-gray-500">· {m}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Checklist de documentos</p>
              {detail.checklist.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Esta fonte não informa requisitos documentais estruturados.
                </p>
              ) : (
                <div className="space-y-2">
                  {detail.checklist.map((item) => (
                    <div
                      key={item.requisito}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 truncate">{item.requisito}</p>
                        {item.doc_type_name && (
                          <p className="text-xs text-gray-400 truncate">→ {item.doc_type_name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge value={item.status} className={item.status === 'NAO_MAPEADO' ? '' : undefined} />
                        {item.status !== 'VALIDO' && item.status !== 'NAO_MAPEADO' && (
                          <Link
                            href={`/${tenant}/institucional/documentos`}
                            className="text-xs text-brand-600 hover:underline whitespace-nowrap"
                          >
                            anexar
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              {detail.linkOficial ? (
                <a
                  href={detail.linkOficial}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Edital oficial
                </a>
              ) : (
                <span />
              )}
              <button
                className="btn-primary"
                disabled={!!detail.saved}
                onClick={async () => {
                  await handleSave(detail)
                  setDetailRef(null)
                }}
              >
                {detail.saved ? 'Já salvo' : 'Salvar edital'}
              </button>
            </div>
          </div>
        )}
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
