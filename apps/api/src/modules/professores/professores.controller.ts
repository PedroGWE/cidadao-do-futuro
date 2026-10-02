import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ProfessoresService } from './professores.service'
import { CreateProfessorDto } from './dto/create-professor.dto'
import { UpdateProfessorDto } from './dto/update-professor.dto'
import { QueryProfessoresDto } from './dto/query-professores.dto'
import { CreateVinculoProfessorDto } from './dto/create-vinculo-professor.dto'
import { UpdateRemuneracaoDto } from './dto/update-remuneracao.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload'

@Controller('professores')
export class ProfessoresController {
  constructor(private professores: ProfessoresService) {}

  // ── CRUD principal ────────────────────────────────────────────

  @Get()
  findAll(@CurrentUser('tenantId') tid: string, @Query() q: QueryProfessoresDto) {
    return this.professores.findAll(tid, q)
  }

  @Post()
  @RequirePermissions('professores:create')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProfessorDto) {
    return this.professores.create(user.tenantId, user.sub, dto)
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const hasFinanceiro = (user.permissions ?? []).some(
      (p) => p === '*' || p === 'professores:financeiro',
    )
    return hasFinanceiro
      ? this.professores.findOne(user.tenantId, id)
      : this.professores.findOnePublic(user.tenantId, id)
  }

  @Patch(':id')
  @RequirePermissions('professores:update')
  update(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Body() dto: UpdateProfessorDto,
  ) {
    return this.professores.update(tid, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('professores:delete')
  remove(@CurrentUser('tenantId') tid: string, @Param('id') id: string) {
    return this.professores.remove(tid, id)
  }

  // ── Vínculos com projetos ─────────────────────────────────────

  @Get(':id/vinculos')
  listVinculos(@CurrentUser('tenantId') tid: string, @Param('id') id: string) {
    return this.professores.listVinculos(tid, id)
  }

  @Post(':id/vinculos')
  @RequirePermissions('professores:update')
  addVinculo(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Body() dto: CreateVinculoProfessorDto,
  ) {
    return this.professores.addVinculo(tid, id, dto)
  }

  @Patch(':id/vinculos/:vId')
  @RequirePermissions('professores:update')
  updateVinculo(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Param('vId') vId: string,
    @Body() dto: Partial<CreateVinculoProfessorDto>,
  ) {
    return this.professores.updateVinculo(tid, id, vId, dto)
  }

  @Delete(':id/vinculos/:vId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('professores:update')
  removeVinculo(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Param('vId') vId: string,
  ) {
    return this.professores.removeVinculo(tid, id, vId)
  }

  // ── Histórico de remuneração ──────────────────────────────────

  @Get(':id/historico')
  @RequirePermissions('professores:financeiro')
  listHistorico(@CurrentUser('tenantId') tid: string, @Param('id') id: string) {
    return this.professores.listHistorico(tid, id)
  }

  @Post(':id/historico')
  @RequirePermissions('professores:financeiro')
  addHistorico(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateRemuneracaoDto,
  ) {
    return this.professores.addHistorico(user.tenantId, id, user.sub, dto)
  }
}
