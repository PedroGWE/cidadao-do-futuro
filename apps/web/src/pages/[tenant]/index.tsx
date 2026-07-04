import { GetServerSideProps } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projetos ativos" value="—" />
        <StatCard label="Beneficiários" value="—" />
        <StatCard label="Orçamento total" value="—" />
        <StatCard label="Tarefas pendentes" value="—" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Projetos recentes</h3>
          <p className="text-sm text-gray-400">Nenhum projeto encontrado.</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Atividade recente</h3>
          <p className="text-sm text-gray-400">Sem atividade recente.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const refreshToken = ctx.req.cookies['refresh_token']
  if (!refreshToken) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}
