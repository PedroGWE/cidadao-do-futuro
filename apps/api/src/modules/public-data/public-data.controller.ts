import { Controller, Get, Param, Query } from '@nestjs/common'
import { PublicDataService } from './public-data.service'

@Controller('public-data')
export class PublicDataController {
  constructor(private readonly service: PublicDataService) {}

  @Get('ibge/states')
  states() { return this.service.states() }

  @Get('ibge/municipalities')
  municipalities(@Query('uf') uf?: string) { return this.service.municipalities(uf) }

  @Get('ibge/aggregates/:aggregateId/:locality')
  indicators(@Param('aggregateId') aggregateId: string, @Param('locality') locality: string) {
    return this.service.indicators(aggregateId, locality)
  }

  @Get('transparency/sanctions/:cnpj')
  sanctions(@Param('cnpj') cnpj: string) { return this.service.sanctions(cnpj) }
}
