import type { ReactNode } from 'react'
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import { LogOut } from 'lucide-react'
import { MobileTabBar, type MobileTabBarItem } from '@cidadao/ui'
import { useAuth } from '@/hooks/useAuth'

function TabBarLink({
  href,
  children,
  className,
  'aria-current': ariaCurrent,
}: {
  href: string
  children: ReactNode
  className?: string
  'aria-current'?: 'page' | undefined
}) {
  return (
    <Link href={href as LinkProps['href']} className={className} aria-current={ariaCurrent}>
      {children}
    </Link>
  )
}

interface MobileShellProps {
  children: ReactNode
  title: string
  items: MobileTabBarItem[]
}

export default function MobileShell({ children, title, items }: MobileShellProps) {
  const router = useRouter()
  const { user, tenantSlug, logout } = useAuth()
  const tenant = (router.query.tenant as string) || tenantSlug || ''
  const activeHref = `/${tenant}${router.pathname.replace('/[tenant]', '')}`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto border-x border-gray-200">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500">{tenant}</p>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-1 p-4 pb-24 overflow-y-auto">{children}</main>

      <MobileTabBar
        items={items.map((i) => ({ ...i, href: `/${tenant}${i.href}` }))}
        activeHref={activeHref}
        LinkComponent={TabBarLink}
      />
    </div>
  )
}
