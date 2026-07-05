/**
 * Categorias e tipos padrão do repositório de documentos institucionais.
 * Usado pelo seed e pelo provisionamento automático de novos tenants.
 */
export const DEFAULT_DOCUMENT_CATEGORIES: {
  name: string
  order: number
  types: { name: string; required?: boolean; default_validity_days?: number }[]
}[] = [
  {
    name: 'Institucionais',
    order: 1,
    types: [
      { name: 'Carteira de Registro Profissional' },
      { name: 'Carteira de Identidade e CPF' },
      { name: 'Currículo' },
      { name: 'Diploma do maior grau de formação' },
      { name: 'Recibo de declaração do RAIS do ano vigente', default_validity_days: 365 },
      { name: 'Registros em Conselhos Municipais, Estaduais e Federais' },
    ],
  },
  {
    name: 'Certidões',
    order: 2,
    types: [
      { name: 'Certidão Nada Consta Cível e Criminal – JEF', default_validity_days: 90 },
      { name: 'Certidão negativa de convênio com a Fazenda Estadual', default_validity_days: 90 },
      { name: 'Certidão negativa do Tribunal de Contas Estadual', default_validity_days: 90 },
    ],
  },
  {
    name: 'Comprovantes',
    order: 3,
    types: [
      { name: 'Comprovação de conta bancária em nome da Instituição e exclusiva para o projeto' },
      { name: 'Comprovante de filiação ou associação à Arranjo Promotor de Inovação (API)' },
      { name: 'Comprovante de residência', default_validity_days: 90 },
    ],
  },
  {
    name: 'Fiscal',
    order: 4,
    types: [{ name: 'DRE (Demonstrativo do Resultado do Exercício)', default_validity_days: 365 }],
  },
]
