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
  }, [])

  return (
    <>
      <Head>
        <title>Semevo | Gestão que faz crescer</title>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#185B4C" />
        <link rel="icon" href="/brand/favicon.svg" type="image/svg+xml" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
