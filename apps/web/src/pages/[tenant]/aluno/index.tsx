import { GetServerSideProps } from 'next'
import useSWR from 'swr'
import AlunoLayout from '@/components/layout/conecta/AlunoLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { conectaService } from '@/services/conecta'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.req.cookies['refresh_token']) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: {} }
}

export default function AlunoHomePage() {
  const { data, isLoading, error } = useSWR(
    '/conecta/student/home',
    conectaService.studentHome,
    { revalidateOnFocus: false },
  )

  return (
    <AlunoLayout title="Início">
      <section className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Próximo encontro</h2>
          {isLoading ? (
            <PageSpinner />
          ) : error ? (
            <p className="text-sm text-red-600">Erro ao carregar. Tente novamente.</p>
          ) : data?.proximo_encontro ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">{data.proximo_encontro.titulo}</p>
              <p className="text-xs text-gray-500">
                {data.proximo_encontro.turma} •{' '}
                {data.proximo_encontro.data_hora
                  ? new Date(data.proximo_encontro.data_hora).toLocaleString('pt-BR')
                  : 'Sem data definida'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum encontro agendado.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Atividades pendentes</h2>
          {isLoading ? (
            <PageSpinner />
          ) : error ? (
            <p className="text-sm text-red-600">Erro ao carregar. Tente novamente.</p>
          ) : data?.atividades_pendentes.length ? (
            <ul className="space-y-2">
              {data.atividades_pendentes.map((a) => (
                <li key={a.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.titulo}</p>
                    <p className="text-xs text-gray-500">{a.turma}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {a.prazo ? new Date(a.prazo).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Nada pendente 🎉</p>
          )}
        </div>

        <div className="bg-brand-50 rounded-xl border border-brand-100 p-4">
          <p className="text-sm text-brand-800">Área do aluno em construção.</p>
        </div>
      </section>
    </AlunoLayout>
  )
}
