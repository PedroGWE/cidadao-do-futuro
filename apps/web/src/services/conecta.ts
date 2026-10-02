import api from '@/lib/api'

export interface StudentHome {
  proximo_encontro: {
    id: string
    titulo: string
    data_hora: string | null
    turma: string
  } | null
  atividades_pendentes: Array<{
    id: string
    titulo: string
    prazo: string | null
    turma: string
    status: string
  }>
  ultimo_aviso: unknown
}

export interface TeacherHome {
  aulas_hoje: Array<{
    id: string
    turma: string
    horario: string | null
  }>
  pendencias: {
    chamadas_nao_feitas: number
    entregas_aguardando_correcao: number
  }
}

export const conectaService = {
  studentHome: (): Promise<StudentHome> =>
    api.get('/conecta/student/home').then((r) => r.data),

  teacherHome: (): Promise<TeacherHome> =>
    api.get('/conecta/teacher/home').then((r) => r.data),
}
