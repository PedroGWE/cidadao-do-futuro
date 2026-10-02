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
  // documentos institucionais
  VALIDO: 'bg-growth-100 text-growth-700',
  VENCIDO: 'bg-red-100 text-red-600',
  NAO_MAPEADO: 'bg-gray-100 text-gray-500',
  // editais
  PNCP: 'bg-brand-100 text-brand-800',
  MANUAL: 'bg-violet-100 text-violet-700',
  SALVO: 'bg-gray-100 text-gray-600',
  EM_PREPARACAO: 'bg-amber-100 text-amber-700',
  INSCRITO: 'bg-blue-100 text-blue-700',
  REPROVADO: 'bg-red-100 text-red-600',
  ENCERRADO: 'bg-gray-100 text-gray-500',
  // transaction type
  RECEITA: 'bg-emerald-100 text-emerald-700',
  DESPESA: 'bg-red-100 text-red-600',
  TRANSFERENCIA: 'bg-blue-100 text-blue-700',
  DEVOLUCAO: 'bg-amber-100 text-amber-700',
  // beneficiários
  ATIVO: 'bg-emerald-100 text-emerald-700',
  INATIVO: 'bg-gray-100 text-gray-500',
  EGRESSO: 'bg-blue-100 text-blue-700',
  EM_ESPERA: 'bg-amber-100 text-amber-700',
  DESLIGADO: 'bg-red-100 text-red-600',
  // professores — tipo de vínculo
  VOLUNTARIO: 'bg-violet-100 text-violet-700',
  CLT: 'bg-brand-100 text-brand-800',
  AUTONOMO_PJ: 'bg-cyan-100 text-cyan-700',
  PRESTADOR_SERVICO: 'bg-orange-100 text-orange-700',
  // professores — status
  AFASTADO: 'bg-yellow-100 text-yellow-700',
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
  VALIDO: 'Válido',
  VENCIDO: 'Vencido',
  NAO_MAPEADO: 'Não mapeado',
  PNCP: 'PNCP',
  MANUAL: 'Manual',
  SALVO: 'Salvo',
  EM_PREPARACAO: 'Em preparação',
  INSCRITO: 'Inscrito',
  REPROVADO: 'Reprovado',
  ENCERRADO: 'Encerrado',
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
  // beneficiários
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  EGRESSO: 'Egresso',
  EM_ESPERA: 'Em espera',
  DESLIGADO: 'Desligado',
  // professores — tipo de vínculo
  VOLUNTARIO: 'Voluntário',
  CLT: 'CLT',
  AUTONOMO_PJ: 'Autônomo / PJ',
  PRESTADOR_SERVICO: 'Prestador de Serviço',
  // professores — status
  AFASTADO: 'Afastado',
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
