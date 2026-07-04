import { clsx } from 'clsx'

const variants: Record<string, string> = {
  // project status
  RASCUNHO: 'bg-gray-100 text-gray-600',
  CAPTACAO: 'bg-blue-100 text-blue-700',
  APROVADO: 'bg-emerald-100 text-emerald-700',
  EM_EXECUCAO: 'bg-violet-100 text-violet-700',
  CONCLUIDO: 'bg-green-100 text-green-700',
  SUSPENSO: 'bg-amber-100 text-amber-700',
  CANCELADO: 'bg-red-100 text-red-600',
  // transaction status
  PENDENTE: 'bg-amber-100 text-amber-700',
  APROVADO_TX: 'bg-blue-100 text-blue-700',
  PAGO: 'bg-green-100 text-green-700',
  ESTORNADO: 'bg-red-100 text-red-600',
  // transaction type
  RECEITA: 'bg-emerald-100 text-emerald-700',
  DESPESA: 'bg-red-100 text-red-600',
  TRANSFERENCIA: 'bg-blue-100 text-blue-700',
  DEVOLUCAO: 'bg-amber-100 text-amber-700',
}

const labels: Record<string, string> = {
  RASCUNHO: 'Rascunho',
  CAPTACAO: 'Captação',
  APROVADO: 'Aprovado',
  EM_EXECUCAO: 'Em Execução',
  CONCLUIDO: 'Concluído',
  SUSPENSO: 'Suspenso',
  CANCELADO: 'Cancelado',
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ESTORNADO: 'Estornado',
  RECEITA: 'Receita',
  DESPESA: 'Despesa',
  TRANSFERENCIA: 'Transferência',
  DEVOLUCAO: 'Devolução',
  CULTURAL: 'Cultural',
  ESPORTIVO: 'Esportivo',
  EDUCACIONAL: 'Educacional',
  ASSISTENCIA_SOCIAL: 'Assistência Social',
  SAUDE: 'Saúde',
  AMBIENTAL: 'Ambiental',
}

export function Badge({ value, className }: { value: string; className?: string }) {
  const key = value === 'APROVADO' && className?.includes('tx') ? 'APROVADO_TX' : value
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variants[key] ?? 'bg-gray-100 text-gray-600',
        className,
      )}
    >
      {labels[value] ?? value}
    </span>
  )
}
