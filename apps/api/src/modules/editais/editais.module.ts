import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentsModule } from '../documents/documents.module'
import { EditaisController } from './editais.controller'
import { EditaisService } from './editais.service'
import { CacheService, InMemoryCacheService, RedisCacheService } from './cache/cache.service'
import { EDITAL_PROVIDERS } from './providers/edital-provider'
import { PncpProvider } from './providers/pncp.provider'
import { ManualProvider } from './providers/manual.provider'

@Module({
  imports: [DocumentsModule],
  controllers: [EditaisController],
  providers: [
    EditaisService,
    PncpProvider,
    ManualProvider,
    {
      provide: CacheService,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL')
        return url ? new RedisCacheService(url) : new InMemoryCacheService()
      },
    },
    {
      provide: EDITAL_PROVIDERS,
      inject: [PncpProvider, ManualProvider],
      useFactory: (pncp: PncpProvider, manual: ManualProvider) => [pncp, manual],
    },
  ],
})
export class EditaisModule {}
