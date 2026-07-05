import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import Cookies from 'js-cookie'
import api, { setAccessToken } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

const schema = z.object({
  tenantName: z.string().min(2, 'Nome da organização obrigatório'),
  tenantSlug: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
  tenantType: z.enum(['OSC', 'INSTITUTO', 'FUNDACAO', 'ASSOCIACAO', 'OUTRO']),
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormData = z.infer<typeof schema>

const TENANT_TYPES = [
  { value: 'OSC', label: 'OSC' },
  { value: 'INSTITUTO', label: 'Instituto' },
  { value: 'FUNDACAO', label: 'Fundação' },
  { value: 'ASSOCIACAO', label: 'Associação' },
  { value: 'OUTRO', label: 'Outro' },
]

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { tenantType: 'OSC' } })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      const { data: res } = await api.post('/auth/register', data)
      setAccessToken(res.accessToken)
      Cookies.set('refresh_token', res.refreshToken, { expires: 7, sameSite: 'strict' })
      Cookies.set('tenant_slug', data.tenantSlug, { expires: 7, sameSite: 'strict' })
      localStorage.setItem('auth_user', JSON.stringify(res.user))
      setAuth(res.user, data.tenantSlug)
      await router.push(`/${data.tenantSlug}/dashboard`)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao cadastrar. Tente novamente.'
      setServerError(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Cidadão do Futuro" className="mx-auto h-28 w-auto" />
          <p className="text-gray-500 mt-1 text-sm">Gestão de projetos sociais</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Cadastrar organização</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Nome da organização</label>
                <input className="input" placeholder="Instituto Exemplo" {...register('tenantName')} />
                {errors.tenantName && (
                  <p className="mt-1 text-xs text-red-600">{errors.tenantName.message}</p>
                )}
              </div>

              <div>
                <label className="label">Slug</label>
                <input className="input" placeholder="inst-exemplo" {...register('tenantSlug')} />
                {errors.tenantSlug && (
                  <p className="mt-1 text-xs text-red-600">{errors.tenantSlug.message}</p>
                )}
              </div>

              <div>
                <label className="label">Tipo</label>
                <select className="input" {...register('tenantType')}>
                  {TENANT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="label">Seu nome</label>
              <input className="input" placeholder="Maria Silva" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">E-mail</label>
              <input type="email" className="input" placeholder="maria@exemplo.org" {...register('email')} />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Senha</label>
              <input type="password" className="input" placeholder="••••••••" {...register('password')} />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar organização'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Já tem conta?{' '}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
