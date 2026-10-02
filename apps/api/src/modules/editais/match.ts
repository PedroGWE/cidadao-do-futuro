import type { EditalDTO, EditalMatch } from '@cidadao/shared'

export interface MatchProfile {
  abrangencia: string | null
  uf: string | null
  areas_atuacao: string[]
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/**
 * Score simples de compatibilidade edital × organização (0–100):
 * abrangência compatível (30) + UF (30) + interseção de áreas (40).
 * Critérios desconhecidos no edital contam parcialmente para não
 * penalizar fontes com dados incompletos (ex: PNCP).
 */
export function computeMatch(edital: EditalDTO, profile: MatchProfile | null): EditalMatch {
  if (!profile) {
    return {
      matchScore: 50,
      motivos: ['Complete o perfil da organização para melhorar a compatibilidade'],
    }
  }

  let score = 0
  const motivos: string[] = []

  // Abrangência (30)
  if (!edital.abrangencia) {
    score += 15
    motivos.push('Abrangência do edital não informada pela fonte')
  } else if (
    edital.abrangencia === 'NACIONAL' ||
    edital.abrangencia === 'INTERNACIONAL' ||
    edital.abrangencia === profile.abrangencia
  ) {
    score += 30
    motivos.push(`Abrangência compatível (${edital.abrangencia})`)
  } else {
    motivos.push(`Abrangência ${edital.abrangencia} difere da sua (${profile.abrangencia ?? 'não definida'})`)
  }

  // UF (30)
  if (!edital.uf) {
    score += 15
    motivos.push('UF do edital não informada')
  } else if (profile.uf && edital.uf === profile.uf) {
    score += 30
    motivos.push(`Mesma UF (${edital.uf})`)
  } else if (!profile.uf) {
    score += 10
    motivos.push('Defina a UF no perfil para melhorar o match')
  } else {
    motivos.push(`Edital de ${edital.uf}, organização em ${profile.uf}`)
  }

  // Áreas de atuação (40)
  const area = edital.areaTematica ? normalize(edital.areaTematica) : null
  const areas = profile.areas_atuacao.map(normalize)
  if (!area) {
    score += 20
    motivos.push('Área temática do edital não informada')
  } else if (areas.some((a) => area.includes(a) || a.includes(area))) {
    score += 40
    motivos.push(`Área compatível com sua atuação (${edital.areaTematica})`)
  } else if (areas.length === 0) {
    score += 10
    motivos.push('Cadastre áreas de atuação no perfil para melhorar o match')
  } else {
    motivos.push(`Área do edital (${edital.areaTematica}) fora das suas áreas de atuação`)
  }

  return { matchScore: Math.max(0, Math.min(100, score)), motivos }
}
