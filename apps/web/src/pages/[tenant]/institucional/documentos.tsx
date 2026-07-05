import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import { GetServerSideProps } from 'next'
import useSWR, { useSWRConfig } from 'swr'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Paperclip,
  Download,
  Trash2,
  UploadCloud,
  Loader2,
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { PageSpinner } from '@/components/ui/Spinner'
import {
  documentsService,
  type DocStatus,
  type DocumentTypeRow,
} from '@/services/documents'

const ACCEPTED = '.pdf,.jpg,.jpeg,.png'
const MAX_SIZE = 10 * 1024 * 1024

function formatDate(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function SummaryCard({ label, value, icon: Icon, color }: {
  label: string; value?: number; icon: React.ElementType; color: string
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-2">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  )
}

function UploadModal({ row, onClose, onDone }: {
  row: DocumentTypeRow | null
  onClose: () => void
  onDone: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [validUntil, setValidUntil] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestedDate = useMemo(() => {
    if (!row?.default_validity_days) return ''
    const d = new Date()
    d.setDate(d.getDate() + row.default_validity_days)
    return d.toISOString().slice(0, 10)
  }, [row])

  const pick = useCallback((f: File | undefined | null) => {
    setError('')
    if (!f) return
    if (f.size > MAX_SIZE) {
      setError('Arquivo excede o tamanho máximo de 10MB.')
      return
    }
    setFile(f)
  }, [])

  async function submit() {
    if (!row || !file) return
    setSending(true)
    setError('')
    try {
      await documentsService.upload(row.id, file, validUntil || undefined)
      onDone()
      onClose()
      setFile(null)
      setValidUntil('')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao enviar o documento. Tente novamente.'
      setError(typeof msg === 'string' ? msg : 'Erro ao enviar o documento.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal open={!!row} onClose={onClose} title={row ? `Anexar — ${row.name}` : ''}>
      <div className="space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            pick(e.dataTransfer.files?.[0])
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
            dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
          }`}
        >
          <UploadCloud className="h-8 w-8 text-brand-600" />
          {file ? (
            <>
              <p className="text-sm font-medium text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-400">{formatSize(file.size)} — clique para trocar</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">
                Arraste o arquivo aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-400">PDF, JPG ou PNG · máx. 10MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </div>

        <div>
          <label htmlFor="valid_until" className="label">Data de validade (opcional)</label>
          <input
            id="valid_until"
            type="date"
            className="input"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
          {suggestedDate && !validUntil && (
            <button
              type="button"
              onClick={() => setValidUntil(suggestedDate)}
              className="mt-1 text-xs text-brand-600 hover:underline"
            >
              Sugerir validade padrão ({row?.default_validity_days} dias): {formatDate(suggestedDate)}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={!file || sending} onClick={submit}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar documento'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function DocumentosPage() {
  const { mutate } = useSWRConfig()
  const [statusFilter, setStatusFilter] = useState<DocStatus | ''>('')
  const [uploadRow, setUploadRow] = useState<DocumentTypeRow | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const { data: summary } = useSWR('/documents/summary', documentsService.summary)
  const listKey = ['/documents', statusFilter] as const
  const { data: groups, isLoading } = useSWR(listKey, () =>
    documentsService.list(statusFilter ? { status: statusFilter } : undefined),
  )

  function revalidate() {
    mutate('/documents/summary')
    mutate(listKey)
  }

  async function handleDelete(row: DocumentTypeRow) {
    if (!row.document) return
    if (!window.confirm(`Excluir o arquivo de "${row.name}"? O documento voltará a ficar pendente.`)) return
    setBusyId(row.id)
    try {
      await documentsService.remove(row.document.id)
      revalidate()
    } finally {
      setBusyId(null)
    }
  }

  async function handleDownload(row: DocumentTypeRow) {
    if (!row.document) return
    setBusyId(row.id)
    try {
      await documentsService.download(row.document)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Documentos Institucionais</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl">
          Utilize esta área como um repositório de documentos para tê-los sempre à mão. A inserção
          destes documentos não é obrigatória.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard label="Documentos válidos" value={summary?.validos} icon={CheckCircle2} color="bg-growth-50 text-growth-600" />
        <SummaryCard label="Documentos vencidos" value={summary?.vencidos} icon={XCircle} color="bg-red-50 text-red-500" />
        <SummaryCard label="Documentos pendentes" value={summary?.pendentes} icon={Clock} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          Situação do documento
        </label>
        <select
          id="status-filter"
          className="input max-w-[180px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DocStatus | '')}
        >
          <option value="">Todos</option>
          <option value="PENDENTE">Pendente</option>
          <option value="VALIDO">Válido</option>
          <option value="VENCIDO">Vencido</option>
        </select>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !groups?.length ? (
        <div className="card">
          <p className="text-sm text-gray-400 text-center py-6">
            Nenhum documento encontrado para o filtro selecionado.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3 font-medium">Lista de Documentos</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 font-medium">Envio</th>
                <th className="px-4 py-3 font-medium">Validade</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((cat) => (
                <Fragment key={cat.id}>
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-brand-800">
                      {cat.name}
                    </td>
                  </tr>
                  {cat.types.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-6 py-3">
                        <p className="font-medium text-gray-800">{row.name}</p>
                        {row.document && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {row.document.file_name} · {formatSize(row.document.size_bytes)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3"><Badge value={row.status} /></td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(row.document?.sent_at)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(row.document?.valid_until)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {busyId === row.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : (
                            <>
                              <button
                                title="Anexar arquivo"
                                onClick={() => setUploadRow(row)}
                                className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                              >
                                <Paperclip className="h-4 w-4" />
                              </button>
                              {row.document && (
                                <>
                                  <button
                                    title="Baixar"
                                    onClick={() => handleDownload(row)}
                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                  <button
                                    title="Excluir"
                                    onClick={() => handleDelete(row)}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UploadModal row={uploadRow} onClose={() => setUploadRow(null)} onDone={revalidate} />
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.req.cookies['refresh_token']) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}
