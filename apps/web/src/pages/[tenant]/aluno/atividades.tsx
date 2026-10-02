import { GetServerSideProps } from 'next'
import AlunoLayout from '@/components/layout/conecta/AlunoLayout'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.req.cookies['refresh_token']) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}

export default function AlunoAtividadesPage() {
  return (
    <AlunoLayout title="Atividades">
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500">Atividades em construção.</p>
      </div>
    </AlunoLayout>
  )
}
