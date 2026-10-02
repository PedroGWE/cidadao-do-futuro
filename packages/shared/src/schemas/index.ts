export { z } from 'zod'
export * from './documents'
export * from './organization-profile'
export * from './editais'
export * from './beneficiarios'
export * from './professores'

export const paginationSchema = {
  page: { type: 'number', minimum: 1, default: 1 },
  limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
}
