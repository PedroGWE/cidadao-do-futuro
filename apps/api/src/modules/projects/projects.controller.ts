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
import { ProjectsService } from './projects.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { QueryProjectsDto } from './dto/query-projects.dto'
import { CreatePhaseDto } from './dto/create-phase.dto'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { AddMemberDto } from './dto/add-member.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../common/decorators/permissions.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload'

@Controller('projects')
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  // ── Projects ──────────────────────────────────────────────────

  @Get()
  findAll(@CurrentUser('tenantId') tid: string, @Query() q: QueryProjectsDto) {
    return this.projects.findAll(tid, q)
  }

  @Post()
  @RequirePermissions('projects:create')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProjectDto) {
    return this.projects.create(user.tenantId, user.sub, dto)
  }

  @Get(':id')
  findOne(@CurrentUser('tenantId') tid: string, @Param('id') id: string) {
    return this.projects.findOne(tid, id)
  }

  @Patch(':id')
  @RequirePermissions('projects:update')
  update(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projects.update(tid, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('projects:delete')
  remove(@CurrentUser('tenantId') tid: string, @Param('id') id: string) {
    return this.projects.remove(tid, id)
  }

  // ── Phases ────────────────────────────────────────────────────

  @Get(':id/phases')
  findPhases(@CurrentUser('tenantId') tid: string, @Param('id') id: string) {
    return this.projects.findPhases(tid, id)
  }

  @Post(':id/phases')
  @RequirePermissions('projects:update')
  createPhase(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Body() dto: CreatePhaseDto,
  ) {
    return this.projects.createPhase(tid, id, dto)
  }

  @Patch(':id/phases/:phaseId')
  @RequirePermissions('projects:update')
  updatePhase(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Param('phaseId') phaseId: string,
    @Body() dto: Partial<CreatePhaseDto>,
  ) {
    return this.projects.updatePhase(tid, id, phaseId, dto)
  }

  @Delete(':id/phases/:phaseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('projects:update')
  removePhase(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Param('phaseId') phaseId: string,
  ) {
    return this.projects.removePhase(tid, id, phaseId)
  }

  // ── Tasks ─────────────────────────────────────────────────────

  @Get(':id/tasks')
  findTasks(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Query('phaseId') phaseId?: string,
    @Query('status') status?: string,
  ) {
    return this.projects.findTasks(tid, id, { phaseId, status })
  }

  @Post(':id/tasks')
  @RequirePermissions('projects:update')
  createTask(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.projects.createTask(tid, id, dto)
  }

  @Patch(':id/tasks/:taskId')
  @RequirePermissions('projects:update')
  updateTask(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.projects.updateTask(tid, id, taskId, dto)
  }

  // ── Members ───────────────────────────────────────────────────

  @Get(':id/members')
  findMembers(@CurrentUser('tenantId') tid: string, @Param('id') id: string) {
    return this.projects.findMembers(tid, id)
  }

  @Post(':id/members')
  @RequirePermissions('projects:update')
  addMember(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.projects.addMember(tid, id, dto)
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('projects:update')
  removeMember(
    @CurrentUser('tenantId') tid: string,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.projects.removeMember(tid, id, userId)
  }
}
