import { useEffect, useMemo, useState } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import {
  ABRANGENCIAS,
  ABRANGENCIA_LABELS,
  ORGANIZATION_TYPES,
  ORGANIZATION_TYPE_LABELS,
  UFS,
  maskCpfCnpj,
  onlyDigits,
  organizationProfileSchema,
} from '@cidadao/shared'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { organizationProfileService } from '@/services/organization-profile'

interface FormState {
  nome_organizacao: string
  tipo_organizacao: string
  documento: string
  abrangencia: string
  areas_atuacao: string[]
  municipio: string
  uf: string
  telefone: string
  email: string
}

const EMPTY: FormState = {
  nome_organizacao: '',
  tipo_organizacao: '',
  documento: '',
  abrangencia: '',
  areas_atuacao: [],
  municipio: '',
  uf: '',
  telefone: '',
  email: '',
}

function Field({ label, description, htmlFor, error, children }: {
  label: string
  description?: string
  htmlFor?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label mb-0">{label}</label>
      {description && <p className="text-xs text-gray-400 mb-1.5">{description}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function DadosBasicosPage() {
  const router = useRouter()
  const tenant = router.query.tenant as string

  const { data, isLoading, mutate } = useSWR('/organization-profile', organizationProfileService.get)

  const [form, setForm] = useState<FormState>(EMPTY)
  const [areaInput, setAreaInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!data?.profile) return
    const p = data.profile
    setForm({
      nome_organizacao: p.nome_organizacao ?? '',
      tipo_organizacao: p.tipo_organizacao ?? '',
      documento: p.documento ? maskCpfCnpj(p.documento) : '',
      abrangencia: p.abrangencia ?? '',
      areas_atuacao: p.areas_atuacao ?? [],
      municipio: p.municipio ?? '',
      uf: p.uf ?? '',
      telefone: p.telefone ?? '',
      email: p.email ?? '',
    })
  }, [data?.profile])

  const set = (key: keyof FormState) => (value: string | string[]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function addArea() {
    const v = areaInput.trim()
    if (!v || form.areas_atuacao.includes(v)) return
    set('areas_atuacao')([...form.areas_atuacao, v])
    setAreaInput('')
  }

  const completude = data?.percentualCompletude ?? 0
  const pendencias = useMemo(
    () => [
      ...(data?.pendencias.campos ?? []),
      ...(data?.pendencias.documentos ?? []).map((d) => `Documento: ${d}`),
    ],
    [data?.pendencias],
  )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setSaved(false)

    const payload = {
      ...form,
      documento: onlyDigits(form.documento),
      tipo_organizacao: form.tipo_organizacao || undefined,
      abrangencia: form.abrangencia || undefined,
    }
    const parsed = organizationProfileSchema.safeParse(payload)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (msgs?.[0]) fieldErrors[key] = msgs[0]
      }
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      const updated = await organizationProfileService.save(parsed.data)
      mutate(updated, { revalidate: false })
      setSaved(true)
    } catch {
      setErrors({ _root: 'Erro ao salvar. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dados Básicos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Perfil da organização usado em inscrições de editais.
        </p>
      </div>

      {/* Barra de completude */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Completude do perfil</p>
          <span className={`text-sm font-bold ${completude === 100 ? 'text-growth-600' : 'text-brand-800'}`}>
            {completude}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${completude === 100 ? 'bg-growth-500' : 'bg-brand-600'}`}
            style={{ width: `${completude}%` }}
          />
        </div>
        {pendencias.length > 0 && (
          <details className="mt-3">
            <summary className="text-xs text-brand-600 cursor-pointer hover:underline">
              {pendencias.length} pendência{pendencias.length > 1 ? 's' : ''} — ver detalhes
            </summary>
            <ul className="mt-2 space-y-1">
              {pendencias.map((p) => (
                <li key={p} className="flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            {(data?.pendencias.documentos.length ?? 0) > 0 && (
              <Link
                href={`/${tenant}/institucional/documentos`}
                className="inline-block mt-2 text-xs font-medium text-brand-600 hover:underline"
              >
                Ir para Documentos Institucionais →
              </Link>
            )}
          </details>
        )}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <form onSubmit={submit} className="card space-y-5 max-w-2xl">
          <Field
            label="Nome da organização"
            description="Coloque o nome da sua organização, máximo de 100 caracteres."
            htmlFor="nome"
            error={errors.nome_organizacao}
          >
            <input
              id="nome"
              className="input"
              maxLength={100}
              value={form.nome_organizacao}
              onChange={(e) => set('nome_organizacao')(e.target.value)}
            />
          </Field>

          <Field
            label="Tipo de organização"
            description="Selecione a natureza jurídica que melhor descreve a organização."
            htmlFor="tipo"
            error={errors.tipo_organizacao}
          >
            <select
              id="tipo"
              className="input"
              value={form.tipo_organizacao}
              onChange={(e) => set('tipo_organizacao')(e.target.value)}
            >
              <option value="">Selecione...</option>
              {ORGANIZATION_TYPES.map((t) => (
                <option key={t} value={t}>{ORGANIZATION_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </Field>

          <Field
            label="CPF ou CNPJ"
            description="Digite apenas números — a máscara alterna automaticamente."
            htmlFor="documento"
            error={errors.documento}
          >
            <input
              id="documento"
              className="input"
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              value={form.documento}
              onChange={(e) => set('documento')(maskCpfCnpj(e.target.value))}
            />
          </Field>

          <Field label="Abrangência" description="Alcance territorial de atuação da organização." error={errors.abrangencia}>
            <div className="flex flex-wrap gap-2">
              {ABRANGENCIAS.map((a) => (
                <label
                  key={a}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                    form.abrangencia === a
                      ? 'border-brand-600 bg-brand-50 text-brand-800 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="abrangencia"
                    value={a}
                    checked={form.abrangencia === a}
                    onChange={() => set('abrangencia')(a)}
                    className="sr-only"
                  />
                  {ABRANGENCIA_LABELS[a]}
                </label>
              ))}
            </div>
          </Field>

          <Field
            label="Áreas de atuação"
            description="Ex: educação, assistência social, cultura. Digite e pressione Enter."
            htmlFor="areas"
            error={errors.areas_atuacao}
          >
            <div className="flex gap-2">
              <input
                id="areas"
                className="input"
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addArea()
                  }
                }}
              />
              <button type="button" className="btn-ghost border border-gray-200" onClick={addArea}>
                Adicionar
              </button>
            </div>
            {form.areas_atuacao.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.areas_atuacao.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1 rounded-full bg-growth-50 text-growth-700 px-2.5 py-1 text-xs font-medium"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() => set('areas_atuacao')(form.areas_atuacao.filter((a) => a !== area))}
                      className="hover:text-growth-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Município" htmlFor="municipio" error={errors.municipio}>
              <input
                id="municipio"
                className="input"
                value={form.municipio}
                onChange={(e) => set('municipio')(e.target.value)}
              />
            </Field>
            <Field label="UF" htmlFor="uf" error={errors.uf}>
              <select id="uf" className="input" value={form.uf} onChange={(e) => set('uf')(e.target.value)}>
                <option value="">Selecione...</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Telefone" description="Com DDD, apenas números." htmlFor="telefone" error={errors.telefone}>
              <input
                id="telefone"
                className="input"
                inputMode="numeric"
                placeholder="(11) 99999-0000"
                value={form.telefone}
                onChange={(e) => set('telefone')(e.target.value)}
              />
            </Field>
            <Field label="E-mail" htmlFor="email" error={errors.email}>
              <input
                id="email"
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => set('email')(e.target.value)}
              />
            </Field>
          </div>

          {errors._root && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errors._root}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar dados'
              )}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-growth-600 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Salvo com sucesso
              </span>
            )}
          </div>
        </form>
      )}
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.req.cookies['refresh_token']) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}
