import { GetServerSideProps } from 'next'
import useSWR from 'swr'
import ProfessorLayout from '@/components/layout/conecta/ProfessorLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { conectaService } from '@/services/conecta'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.req.cookies['refresh_token']) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}

export default function ProfessorHomePage() {
  const { data, isLoading, error } = useSWR(
    '/conecta/teacher/home',
    conectaService.teacherHome,
    { revalidateOnFocus: false },
  )

  return (
    <ProfessorLayout title="Início">
      <section className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Aulas de hoje</h2>
          {isLoading ? (
            <PageSpinner />
          ) : error ? (
            <p className="text-sm text-red-600">Erro ao carregar. Tente novamente.</p>
          ) : data?.aulas_hoje.length ? (
            <ul className="space-y-2">
              {data.aulas_hoje.map((a) => (
                <li key={a.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <p className="text-sm font-medium text-gray-900">{a.turma}</p>
                  <span className="text-xs text-gray-500">{a.horario ?? '—'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Nenhuma aula hoje.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Pendências</h2>
          {isLoading ? (
            <PageSpinner />
          ) : error ? (
            <p className="text-sm text-red-600">Erro ao carregar. Tente novamente.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{data?.pendencias.chamadas_nao_feitas ?? 0}</p>
                <p className="text-xs text-gray-500">Chamadas não feitas</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{data?.pendencias.entregas_aguardando_correcao ?? 0}</p>
                <p className="text-xs text-gray-500">Entregas para corrigir</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-brand-50 rounded-xl border border-brand-100 p-4">
          <p className="text-sm text-brand-800">Área do professor em construção.</p>
        </div>
      </section>
    </ProfessorLayout>
  )
}
