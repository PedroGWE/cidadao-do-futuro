import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import api, { setAccessToken } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
  const router = useRouter()
  const { user, tenantSlug, setAuth, clear } = useAuthStore()

  async function login(email: string, password: string, slug: string) {
    const { data } = await api.post('/auth/login', { email, password, tenantSlug: slug })
    setAccessToken(data.accessToken)
    Cookies.set('refresh_token', data.refreshToken, { expires: 7, sameSite: 'strict' })
    Cookies.set('tenant_slug', slug, { expires: 7, sameSite: 'strict' })
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(data.user))
    }
    setAuth(data.user, slug)
    await router.push(`/${slug}`)
  }

  async function logout() {
    const refreshToken = Cookies.get('refresh_token')
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }).catch(() => null)
    }
    setAccessToken(null)
    Cookies.remove('refresh_token')
    Cookies.remove('tenant_slug')
    if (typeof window !== 'undefined') localStorage.removeItem('auth_user')
    clear()
    await router.push('/login')
  }

  return { user, tenantSlug, login, logout, isAuthenticated: !!user }
}
