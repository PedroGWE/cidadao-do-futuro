import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import type { JwtPayload } from '../../modules/auth/types/jwt-payload'

export const CurrentUser = createParamDecorator(
  (_data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest & { user: JwtPayload }>()
    return _data ? request.user[_data] : request.user
  },
)
