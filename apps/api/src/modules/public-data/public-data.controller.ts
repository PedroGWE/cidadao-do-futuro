import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common'
import { PublicDataService } from './public-data.service'

@Controller('public-data')
export class PublicDataController {
  constructor(private readonly service: PublicDataService) {}

  @Get('ibge/states')
  states() { return this.service.states() }

  @Get('ibge/municipalities')
  async municipalities(@Query('uf') uf?: string) {
    try { return await this.service.municipalities(uf) }
    catch (error) { throw new BadRequestException((error as Error).message) }
  }

  @Get('ibge/aggregates/:aggregateId/:locality')
  async indicators(@Param('aggregateId') aggregateId: string, @Param('locality') locality: string) {
    try { return await this.service.indicators(aggregateId, locality) }
    catch (error) { throw new BadRequestException((error as Error).message) }
  }

  @Get('transparency/sanctions/:cnpj')
  async sanctions(@Param('cnpj') cnpj: string) {
    try { return await this.service.sanctions(cnpj) }
    catch (error) { throw new BadRequestException((error as Error).message) }
  }
}
