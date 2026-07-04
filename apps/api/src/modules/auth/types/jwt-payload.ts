export interface JwtPayload {
  sub: string
  tenantId: string
  email: string
  permissions: string[]
  iat?: number
  exp?: number
}
