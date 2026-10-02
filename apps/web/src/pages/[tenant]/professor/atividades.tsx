import { GetServerSideProps } from 'next'
import ProfessorLayout from '@/components/layout/conecta/ProfessorLayout'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.req.cookies['refresh_token']) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}

export default function ProfessorAtividadesPage() {
  return (
    <ProfessorLayout title="Atividades">
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500">Atividades em construção.</p>
      </div>
    </ProfessorLayout>
  )
}
