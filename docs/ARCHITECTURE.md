# Arquitetura do Sistema

## Visão Geral

O Cidadão do Futuro é um monorepo multi-tenant construído sobre uma arquitetura de três camadas: API REST (NestJS), aplicação web (Next.js) e banco de dados relacional (PostgreSQL). A comunicação entre os serviços é feita via HTTP/JSON, com autenticação baseada em JWT.

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                    ┌──────▼──────┐
                    │    Nginx    │  Reverse Proxy + SSL
                    └──┬──────┬──┘
                       │      │
              /api/*   │      │  /*
         ┌─────────────▼──┐ ┌─▼───────────────┐
         │   NestJS API   │ │   Next.js Web   │
         │   porta 3001   │ │   porta 3000    │
         └────────┬───────┘ └────────┬────────┘
                  │                  │ (chamadas API)
         ┌────────▼──────────────────▼────────┐
         │           PostgreSQL 16             │
         │         + Redis 7 (cache)           │
         └─────────────────────────────────────┘
```

## Multi-Tenancy

Cada organização (tenant) possui isolamento de dados via coluna `tenant_id` em todas as tabelas. A estratégia adotada é **shared database, shared schema** com row-level isolation:

- O `tenant_id` é sempre derivado do JWT, nunca do payload da requisição
- Todas as queries do Prisma incluem `where: { tenant_id }` automaticamente via serviços
- Constraints únicas incluem `tenant_id` (ex: `@@unique([tenant_id, email])`)

```
JWT payload → { sub, tenantId, roles, permissions }
     ↓
JwtAuthGuard extrai tenantId
     ↓
Todos os serviços filtram por tenantId
```

## Autenticação e Autorização

### Fluxo de Autenticação

```
1. POST /auth/login { tenantSlug, email, password }
2. API valida credenciais → gera accessToken (15min) + refreshToken (7d)
3. refreshToken salvo no banco (tabela RefreshToken) e em cookie HTTP-only
4. accessToken retornado no body → armazenado no Zustand (memória)
5. Requests subsequentes: Authorization: Bearer <accessToken>
6. Ao expirar: interceptor axios chama POST /auth/refresh automaticamente
7. Se refresh falhar: redirect para /login
```

### Sistema de Permissões (RBAC)

```
User → UserRole → Role → Permission[]
                          ↓
                   @RequirePermissions('projects:create')
                          ↓
                   RolesGuard verifica JWT payload
```

Permissões são definidas no formato `recurso:ação` (ex: `projects:create`, `financial:approve`).

## Estrutura da API (NestJS)

```
src/
├── app.module.ts              # Módulo raiz
├── main.ts                    # Bootstrap (Fastify adapter)
├── config/
│   └── env.ts                 # Validação de variáveis de ambiente (Zod)
├── common/
│   ├── decorators/            # @CurrentUser, @Public, @RequirePermissions
│   ├── filters/               # GlobalHttpExceptionFilter
│   └── guards/                # JwtAuthGuard, RolesGuard
└── modules/
    ├── auth/                  # Login, registro, refresh, logout
    ├── users/                 # Perfil e listagem de usuários
    ├── tenants/               # Gestão do tenant e convites
    ├── projects/              # Projetos, fases, tarefas, membros
    ├── financial/             # Transações, orçamentos, pagamentos
    └── prisma/                # PrismaService singleton
```

### Padrão por Módulo

Cada módulo segue o padrão NestJS:
```
module.ts     → importações e providers
controller.ts → rotas HTTP, DTOs de entrada, validação
service.ts    → lógica de negócio, acesso ao Prisma
dto/          → classes de validação com class-validator
```

## Estrutura do Frontend (Next.js)

```
src/
├── pages/
│   ├── index.tsx              # Landing / redirect
│   ├── login.tsx              # Login multi-tenant
│   ├── register.tsx           # Cadastro de organização
│   └── [tenant]/
│       ├── index.tsx          # Redirect para dashboard
│       ├── dashboard.tsx      # Visão geral / KPIs
│       ├── projetos.tsx       # Gestão de projetos
│       └── financeiro.tsx     # Gestão financeira
├── components/
│   ├── layout/
│   │   └── DashboardLayout    # Sidebar + Header
│   └── ui/
│       ├── Badge              # Badge de status
│       ├── Modal              # Modal genérico
│       └── Spinner            # Loading state
├── hooks/
│   └── useAuth.ts             # Autenticação (Zustand + API)
├── services/
│   ├── financial.ts           # Cliente API financeiro
│   └── projects.ts            # Cliente API projetos
├── stores/
│   └── auth.store.ts          # Estado de autenticação (Zustand)
└── lib/
    └── api.ts                 # Instância Axios com interceptors
```

## Modelo de Dados (Domínios)

O schema Prisma possui ~45 modelos organizados em domínios:

| Domínio | Modelos Principais |
|---|---|
| Identidade | Tenant, User, Role, Permission, RefreshToken |
| Organizações | Organization, OrganizationDocument |
| Projetos | Project, ProjectPhase, ProjectTask, ProjectMember, ProjectRisk |
| Financeiro | Budget, Transaction, PaymentOrder, Invoice, CostCenter |
| Captação | FundingOpportunity, FundingApplication, Convenio, EmendaParlamentar |
| Prestação de Contas | AccountabilityReport, AccountabilityItem |
| Impacto Social | Beneficiary, Activity, Indicator, IndicatorMeasurement |
| Parcerias | Partner, Partnership, Sponsor |
| Compliance | LGPDConsent, ComplianceCheck, AuditLog |
| Documentos | Document, DocumentVersion, DocumentSignature |
| IA | AIAgent, AIConversation, AITask, DocumentEmbedding |
| Sistema | Notification, WorkflowTemplate, SystemSetting |

## Infraestrutura

### Desenvolvimento

```bash
docker compose up -d   # PostgreSQL + Redis
pnpm dev               # API (3001) + Web (3000) via Turbo
```

### Produção

```
Nginx (443/80)
  ├── /api/* → PM2: NestJS (3001)
  └── /*     → PM2: Next.js (3000)

PostgreSQL (RDS ou VPS)
Redis (ElastiCache ou VPS)
```

### Variáveis de Ambiente Críticas

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Segredo do access token (min 32 chars) |
| `JWT_REFRESH_SECRET` | Segredo do refresh token (min 32 chars) |
| `REDIS_URL` | URL do Redis |
| `CORS_ORIGINS` | Origens permitidas para CORS |
