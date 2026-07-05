export { z } from 'zod'
export * from './documents'

export const paginationSchema = {
  page: { type: 'number', minimum: 1, default: 1 },
  limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
}
