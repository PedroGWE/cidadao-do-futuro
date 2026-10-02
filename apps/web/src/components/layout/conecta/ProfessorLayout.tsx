import type { ReactNode } from 'react'
import { Home, Users, CalendarCheck, ClipboardList } from 'lucide-react'
import MobileShell from './MobileShell'

const items = [
  { label: 'Início', href: '/professor', icon: Home },
  { label: 'Turmas', href: '/professor/turmas', icon: Users },
  { label: 'Chamada', href: '/professor/chamada', icon: CalendarCheck },
  { label: 'Atividades', href: '/professor/atividades', icon: ClipboardList },
]

interface ProfessorLayoutProps {
  children: ReactNode
  title: string
}

export default function ProfessorLayout({ children, title }: ProfessorLayoutProps) {
  return (
    <MobileShell title={title} items={items}>
      {children}
    </MobileShell>
  )
}
