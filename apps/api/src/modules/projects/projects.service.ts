import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateProjectDto } from './dto/create-project.dto'
import type { UpdateProjectDto } from './dto/update-project.dto'
import type { QueryProjectsDto } from './dto/query-projects.dto'
import type { CreatePhaseDto } from './dto/create-phase.dto'
import type { CreateTaskDto } from './dto/create-task.dto'
import type { UpdateTaskDto } from './dto/update-task.dto'
import type { AddMemberDto } from './dto/add-member.dto'

const PROJECT_SELECT = {
  id: true,
  code: true,
  name: true,
  description: true,
  type: true,
  status: true,
  start_date: true,
  end_date: true,
  total_budget: true,
  approved_budget: true,
  tags: true,
  created_at: true,
  updated_at: true,
  manager: { select: { id: true, name: true, email: true, avatar_url: true } },
  _count: { select: { members: true, tasks: true, phases: true } },
} satisfies Prisma.ProjectSelect

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, q: QueryProjectsDto) {
    const page = q.page ?? 1
    const limit = q.limit ?? 20
    const where: Prisma.ProjectWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      ...(q.status && { status: q.status }),
      ...(q.type && { type: q.type }),
      ...(q.search && {
        OR: [
          { name: { contains: q.search, mode: 'insensitive' } },
          { code: { contains: q.search, mode: 'insensitive' } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        select: PROJECT_SELECT,
        orderBy: { updated_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(tenantId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenant_id: tenantId, deleted_at: null },
      include: {
        manager: { select: { id: true, name: true, email: true, avatar_url: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar_url: true } } },
        },
        phases: { orderBy: { order: 'asc' } },
        _count: { select: { tasks: true, risks: true, documents: true, beneficiaries: true } },
      },
    })
    if (!project) throw new NotFoundException('Projeto não encontrado')
    return project
  }

  async create(tenantId: string, userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        tenant_id: tenantId,
        created_by: userId,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        code: dto.code,
        start_date: dto.start_date ? new Date(dto.start_date) : undefined,
        end_date: dto.end_date ? new Date(dto.end_date) : undefined,
        total_budget: dto.total_budget,
        manager_id: dto.manager_id,
        tags: dto.tags ?? [],
        members: {
          create: { user_id: userId, role: 'GESTOR' },
        },
      },
      select: PROJECT_SELECT,
    })
  }

  async update(tenantId: string, id: string, dto: UpdateProjectDto) {
    await this.assertBelongsToTenant(id, tenantId)
    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.type && { type: dto.type }),
        ...(dto.status && { status: dto.status }),
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.start_date && { start_date: new Date(dto.start_date) }),
        ...(dto.end_date && { end_date: new Date(dto.end_date) }),
        ...(dto.total_budget !== undefined && { total_budget: dto.total_budget }),
        ...(dto.manager_id !== undefined && { manager_id: dto.manager_id }),
        ...(dto.tags && { tags: dto.tags }),
      },
      select: PROJECT_SELECT,
    })
  }

  async remove(tenantId: string, id: string) {
    await this.assertBelongsToTenant(id, tenantId)
    await this.prisma.project.update({
      where: { id },
      data: { deleted_at: new Date() },
    })
  }

  // ── Phases ────────────────────────────────────────────────────

  async findPhases(tenantId: string, projectId: string) {
    await this.assertBelongsToTenant(projectId, tenantId)
    return this.prisma.projectPhase.findMany({
      where: { project_id: projectId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { order: 'asc' },
    })
  }

  async createPhase(tenantId: string, projectId: string, dto: CreatePhaseDto) {
    await this.assertBelongsToTenant(projectId, tenantId)
    return this.prisma.projectPhase.create({
      data: {
        project_id: projectId,
        name: dto.name,
        description: dto.description,
        order: dto.order,
        start_date: dto.start_date ? new Date(dto.start_date) : undefined,
        end_date: dto.end_date ? new Date(dto.end_date) : undefined,
      },
    })
  }

  async updatePhase(
    tenantId: string,
    projectId: string,
    phaseId: string,
    dto: Partial<CreatePhaseDto> & { status?: string },
  ) {
    await this.assertBelongsToTenant(projectId, tenantId)
    return this.prisma.projectPhase.update({
      where: { id: phaseId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.start_date && { start_date: new Date(dto.start_date) }),
        ...(dto.end_date && { end_date: new Date(dto.end_date) }),
      },
    })
  }

  async removePhase(tenantId: string, projectId: string, phaseId: string) {
    await this.assertBelongsToTenant(projectId, tenantId)
    await this.prisma.projectPhase.delete({ where: { id: phaseId } })
  }

  // ── Tasks ─────────────────────────────────────────────────────

  async findTasks(tenantId: string, projectId: string, filters: { phaseId?: string; status?: string }) {
    await this.assertBelongsToTenant(projectId, tenantId)
    return this.prisma.projectTask.findMany({
      where: {
        project_id: projectId,
        ...(filters.phaseId && { phase_id: filters.phaseId }),
        ...(filters.status && { status: filters.status as never }),
      },
      include: {
        assignee: { select: { id: true, name: true, avatar_url: true } },
        phase: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: 'desc' }, { due_date: 'asc' }],
    })
  }

  async createTask(tenantId: string, projectId: string, dto: CreateTaskDto) {
    await this.assertBelongsToTenant(projectId, tenantId)
    return this.prisma.projectTask.create({
      data: {
        project_id: projectId,
        title: dto.title,
        description: dto.description,
        phase_id: dto.phase_id,
        assigned_to: dto.assigned_to,
        due_date: dto.due_date ? new Date(dto.due_date) : undefined,
        priority: dto.priority ?? 'MEDIA',
      },
      include: { assignee: { select: { id: true, name: true, avatar_url: true } } },
    })
  }

  async updateTask(tenantId: string, projectId: string, taskId: string, dto: UpdateTaskDto) {
    await this.assertBelongsToTenant(projectId, tenantId)
    return this.prisma.projectTask.update({
      where: { id: taskId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.phase_id !== undefined && { phase_id: dto.phase_id }),
        ...(dto.assigned_to !== undefined && { assigned_to: dto.assigned_to }),
        ...(dto.due_date && { due_date: new Date(dto.due_date) }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.status && { status: dto.status }),
      },
      include: { assignee: { select: { id: true, name: true, avatar_url: true } } },
    })
  }

  // ── Members ───────────────────────────────────────────────────

  async findMembers(tenantId: string, projectId: string) {
    await this.assertBelongsToTenant(projectId, tenantId)
    return this.prisma.projectMember.findMany({
      where: { project_id: projectId },
      include: { user: { select: { id: true, name: true, email: true, avatar_url: true } } },
      orderBy: { role: 'asc' },
    })
  }

  async addMember(tenantId: string, projectId: string, dto: AddMemberDto) {
    await this.assertBelongsToTenant(projectId, tenantId)
    const userInTenant = await this.prisma.user.findFirst({
      where: { id: dto.user_id, tenant_id: tenantId },
    })
    if (!userInTenant) throw new ForbiddenException('Usuário não pertence ao tenant')

    const existing = await this.prisma.projectMember.findUnique({
      where: { project_id_user_id: { project_id: projectId, user_id: dto.user_id } },
    })
    if (existing) throw new ConflictException('Usuário já é membro do projeto')

    return this.prisma.projectMember.create({
      data: {
        project_id: projectId,
        user_id: dto.user_id,
        role: dto.role ?? 'COLABORADOR',
        start_date: dto.start_date ? new Date(dto.start_date) : undefined,
        end_date: dto.end_date ? new Date(dto.end_date) : undefined,
      },
      include: { user: { select: { id: true, name: true, email: true, avatar_url: true } } },
    })
  }

  async removeMember(tenantId: string, projectId: string, userId: string) {
    await this.assertBelongsToTenant(projectId, tenantId)
    await this.prisma.projectMember.deleteMany({
      where: { project_id: projectId, user_id: userId },
    })
  }

  // ── Private ───────────────────────────────────────────────────

  private async assertBelongsToTenant(projectId: string, tenantId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenant_id: tenantId, deleted_at: null },
      select: { id: true },
    })
    if (!project) throw new NotFoundException('Projeto não encontrado')
  }
}
