import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import multipart from '@fastify/multipart'
import { DOCUMENT_MAX_SIZE_BYTES } from '@cidadao/shared'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import type { Env } from './config/env'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: process.env.NODE_ENV !== 'test' }),
  )

  const config = app.get(ConfigService<Env>)

  await app.register(multipart, {
    limits: { fileSize: DOCUMENT_MAX_SIZE_BYTES, files: 1 },
  })

  app.setGlobalPrefix('api')
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
  const corsOrigins = config.get('CORS_ORIGINS')!.split(',')
  app.enableCors({
    // Em desenvolvimento, aceita qualquer porta de localhost/127.0.0.1
    origin:
      config.get('NODE_ENV') === 'development'
        ? /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
        : corsOrigins,
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())

  const port = config.get('PORT')!
  await app.listen(port, '0.0.0.0')
  console.log(`🚀 API rodando em http://localhost:${port}/api/v1`)
}

bootstrap()
