import type { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  DollarSign,
  FileText,
  FolderArchive,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '' },
  { label: 'Projetos', icon: FolderKanban, href: 'projetos' },
  { label: 'Beneficiários', icon: Users, href: 'beneficiarios' },
  { label: 'Financeiro', icon: DollarSign, href: 'financeiro' },
  { label: 'Documentos', icon: FolderArchive, href: 'institucional/documentos' },
  { label: 'Relatórios', icon: FileText, href: 'relatorios' },
  { label: 'Configurações', icon: Settings, href: 'configuracoes' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, tenantSlug, logout } = useAuth()
  const tenant = (router.query.tenant as string) || tenantSlug || ''

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200">
          <img src="/logo.png" alt="Cidadão do Futuro" className="h-10 w-auto flex-shrink-0" />
          <span className="font-bold text-brand-800 text-sm truncate">Cidadão do Futuro</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const href = item.href ? `/${tenant}/${item.href}` : `/${tenant}`
            const active = item.href === '' ? router.pathname === '/[tenant]' : router.pathname === `/[tenant]/${item.href}`
            return (
              <Link
                key={item.href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="ml-auto h-3 w-3" />}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name ?? '—'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email ?? '—'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-base font-semibold text-gray-900 capitalize">
            {navItems.find((n) =>
              n.href === '' ? router.pathname === '/[tenant]' : router.pathname === `/[tenant]/${n.href}`
            )?.label ?? 'Dashboard'}
          </h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
