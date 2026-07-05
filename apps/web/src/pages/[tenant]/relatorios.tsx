import { GetServerSideProps } from 'next'
import { FileText } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function RelatoriosPage() {
  return (
    <DashboardLayout>
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
          <FileText className="h-6 w-6 text-brand-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Relatórios</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          A geração de relatórios e prestação de contas estará disponível em breve.
        </p>
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
