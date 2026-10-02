import type { EditalDTO } from '@cidadao/shared'
import { computeMatch } from '../match'

const base: EditalDTO = {
  externalId: 'x',
  fonte: 'MANUAL',
  titulo: 'Edital de Cultura',
  orgao: null,
  descricao: null,
  valorTotal: null,
  dataAbertura: null,
  dataEncerramento: null,
  abrangencia: null,
  uf: null,
  areaTematica: null,
  linkOficial: null,
  requisitosDocumentais: [],
}

const profile = { abrangencia: 'ESTADUAL', uf: 'SP', areas_atuacao: ['educação', 'cultura'] }

describe('computeMatch', () => {
  it('sem perfil retorna 50 com orientação', () => {
    const r = computeMatch(base, null)
    expect(r.matchScore).toBe(50)
    expect(r.motivos[0]).toMatch(/perfil/i)
  })

  it('match perfeito: abrangência + UF + área = 100', () => {
    const r = computeMatch(
      { ...base, abrangencia: 'ESTADUAL', uf: 'SP', areaTematica: 'Cultura' },
      profile,
    )
    expect(r.matchScore).toBe(100)
    expect(r.motivos).toHaveLength(3)
  })

  it('edital NACIONAL é compatível com qualquer abrangência', () => {
    const r = computeMatch({ ...base, abrangencia: 'NACIONAL', uf: 'SP', areaTematica: 'cultura' }, profile)
    expect(r.matchScore).toBe(100)
  })

  it('UF divergente zera o critério de UF', () => {
    const r = computeMatch({ ...base, abrangencia: 'NACIONAL', uf: 'RJ', areaTematica: 'cultura' }, profile)
    expect(r.matchScore).toBe(70) // 30 + 0 + 40
    expect(r.motivos.join(' ')).toMatch(/RJ/)
  })

  it('área compatível ignora acentos e caixa', () => {
    const r = computeMatch({ ...base, areaTematica: 'EDUCAÇÃO' }, profile)
    // 15 (abrangência desconhecida) + 15 (uf desconhecida) + 40 (área)
    expect(r.matchScore).toBe(70)
  })

  it('dados ausentes na fonte contam parcialmente (PNCP)', () => {
    const r = computeMatch(base, profile)
    // 15 + 15 + 0 (tem áreas cadastradas mas edital sem área... na regra: area null → +20)
    expect(r.matchScore).toBe(50)
  })
})
