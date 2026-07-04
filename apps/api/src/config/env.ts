import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().optional(),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
})

export type Env = z.infer<typeof envSchema>

export default () => {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Variáveis de ambiente inválidas:', result.error.flatten().fieldErrors)
    process.exit(1)
  }
  return result.data
}
