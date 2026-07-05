import axios from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

const api = axios.create({ baseURL: BASE_URL })

let _accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  _accessToken = token
}

api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = Cookies.get('refresh_token')
      if (!refreshToken) {
        clearAuthCookies()
        redirectToLogin()
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        _accessToken = data.accessToken
        Cookies.set('refresh_token', data.refreshToken, { expires: 7, sameSite: 'strict' })
        original.headers.Authorization = `Bearer ${_accessToken}`
        return api(original)
      } catch {
        clearAuthCookies()
        redirectToLogin()
      }
    }
    return Promise.reject(error)
  },
)

function clearAuthCookies() {
  _accessToken = null
  Cookies.remove('refresh_token')
  Cookies.remove('tenant_slug')
}

function redirectToLogin() {
  if (typeof window !== 'undefined') window.location.href = '/login'
}

export default api
