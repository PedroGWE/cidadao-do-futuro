import type { ComponentType, ReactNode } from 'react'

export interface MobileTabBarItem {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
}

export interface MobileTabBarProps {
  items: MobileTabBarItem[]
  activeHref: string
  LinkComponent: React.ElementType<{
    href: string
    children: ReactNode
    className?: string
    'aria-current'?: 'page' | undefined
  }>
}

export function MobileTabBar({ items, activeHref, LinkComponent }: MobileTabBarProps) {
  if (!items.length) return null

  const visibleItems = items.slice(0, 5)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegação principal"
    >
      <ul className="max-w-md mx-auto flex items-center justify-around">
        {visibleItems.map((item) => {
          const active = activeHref === item.href
          return (
            <li key={item.href} className="flex-1">
              <LinkComponent
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-h-[56px] transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:inset-ring-2',
                  active ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
              </LinkComponent>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
