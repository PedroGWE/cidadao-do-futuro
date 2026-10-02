import { GetServerSideProps } from 'next'
import { useState } from 'react'
import useSWR from 'swr'
import { Download, FileText } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'

interface Summary {
  projects: number
  beneficiaries: number
  receitas: number
  despesas: number
  saldo: number
  documents: number
  pendingDocuments: number
}

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default function RelatoriosPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const params = { ...(dateFrom && { date_from: dateFrom }), ...(dateTo && { date_to: dateTo }) }
  const { data, error, isLoading } = useSWR(['reports', dateFrom, dateTo], () =>
    api.get<Summary>('/reports/summary', { params }).then((response) => response.data),
  )

  async function exportCsv() {
    const response = await api.get('/reports/financial.csv', { params, responseType: 'blob' })
    const url = URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = 'relatorio-financeiro.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Relatórios</h1>
            <p className="text-sm text-gray-500">Indicadores consolidados com os mesmos filtros da exportação.</p>
          </div>
          <button className="btn-primary" onClick={exportCsv} disabled={!data}>
            <Download className="mr-2 h-4 w-4" /> Exportar financeiro CSV
          </button>
        </div>
        <div className="card grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-gray-700">De<input className="input mt-1 w-full" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
          <label className="text-sm text-gray-700">Até<input className="input mt-1 w-full" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
        </div>
        {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Não foi possível carregar os relatórios.</div>}
        {isLoading && <div className="card text-sm text-gray-500">Carregando indicadores...</div>}
        {data && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ['Projetos', data.projects], ['Beneficiários', data.beneficiaries],
              ['Receitas', money(data.receitas)], ['Despesas', money(data.despesas)],
              ['Saldo', money(data.saldo)], ['Documentos', data.documents],
              ['Pendências documentais', data.pendingDocuments],
            ].map(([label, value]) => (
              <div className="card" key={String(label)}><p className="text-xs uppercase text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold text-gray-900">{value}</p></div>
            ))}
          </div>
        )}
        {!isLoading && data && data.projects === 0 && data.beneficiaries === 0 && data.documents === 0 && (
          <div className="card flex items-center gap-3 text-sm text-gray-500"><FileText className="h-5 w-5" />Nenhum dado encontrado para os filtros selecionados.</div>
        )}
      </div>
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.req.cookies['refresh_token']) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}
