import type { ExecutionContext } from '@nestjs/common'
import { RolesGuard } from './roles.guard'

function context(permissions: string[]): ExecutionContext {
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => ({ user: { permissions } }) }),
  } as unknown as ExecutionContext
}

describe('RolesGuard', () => {
  it('autoriza administrador com permissão curinga', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValueOnce(['financial:approve']).mockReturnValueOnce(false),
    }
    expect(new RolesGuard(reflector as never).canActivate(context(['*']))).toBe(true)
  })

  it('nega quando falta uma permissão específica', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValueOnce(['financial:approve']).mockReturnValueOnce(false),
    }
    expect(new RolesGuard(reflector as never).canActivate(context(['financial:read']))).toBe(false)
  })
})
