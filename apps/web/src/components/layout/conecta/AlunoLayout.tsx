import type { ReactNode } from 'react'
import { Home, ClipboardList, Route, User } from 'lucide-react'
import MobileShell from './MobileShell'

const items = [
  { label: 'Início', href: '/aluno', icon: Home },
  { label: 'Atividades', href: '/aluno/atividades', icon: ClipboardList },
  { label: 'Jornada', href: '/aluno/jornada', icon: Route },
  { label: 'Perfil', href: '/aluno/perfil', icon: User },
]

interface AlunoLayoutProps {
  children: ReactNode
  title: string
}

export default function AlunoLayout({ children, title }: AlunoLayoutProps) {
  return (
    <MobileShell title={title} items={items}>
      {children}
    </MobileShell>
  )
}
