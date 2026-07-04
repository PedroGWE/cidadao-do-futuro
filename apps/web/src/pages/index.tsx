import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const slug = Cookies.get('tenant_slug')
    const hasSession = Cookies.get('refresh_token')
    if (hasSession && slug) {
      router.replace(`/${slug}/dashboard`)
    } else {
      router.replace('/login')
    }
  }, [router])

  return null
}
