import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import Cookies from 'js-cookie'
import api, { setAccessToken } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

export default function App({ Component, pageProps }: AppProps) {
  const { user, setAuth } = useAuthStore()

  useEffect(() => {
    const refreshToken = Cookies.get('refresh_token')
    const tenantSlug = Cookies.get('tenant_slug')
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null

    if (refreshToken && storedUser && !user) {
      api
        .post('/auth/refresh', { refreshToken })
        .then(({ data }) => {
          setAccessToken(data.accessToken)
          Cookies.set('refresh_token', data.refreshToken, { expires: 7, sameSite: 'strict' })
          setAuth(JSON.parse(storedUser), tenantSlug || '')
        })
        .catch(() => {
          Cookies.remove('refresh_token')
          Cookies.remove('tenant_slug')
          localStorage.removeItem('auth_user')
        })
    }
  }, [setAuth, user])

  return (
    <>
      <Head>
        <title>Amparo GOV | Gestão para organizações sociais</title>
        <meta name="description" content="Gestão clara e segura para organizações sociais." />
        <link rel="icon" type="image/png" href="/amparo/icone-app.png" />
        <link rel="apple-touch-icon" href="/amparo/icone-app.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2364B0" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
