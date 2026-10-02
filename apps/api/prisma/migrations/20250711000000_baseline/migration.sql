-- CreateExtension
-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('OSC', 'INSTITUTO', 'FUNDACAO', 'ASSOCIACAO', 'EMPRESA');

-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('CULTURAL', 'ESPORTIVO', 'EDUCACIONAL', 'ASSISTENCIA_SOCIAL', 'SAUDE', 'AMBIENTAL');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('RASCUNHO', 'CAPTACAO', 'APROVADO', 'EM_EXECUCAO', 'CONCLUIDO', 'SUSPENSO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('GESTOR', 'COORDENADOR', 'COLABORADOR', 'VOLUNTARIO');

-- CreateEnum
CREATE TYPE "PhaseStatus" AS ENUM ('NAO_INICIADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'SUSPENSA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'BLOQUEADA');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('IDENTIFICADO', 'EM_MONITORAMENTO', 'MITIGADO', 'OCORRIDO', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "FundingOpportunityType" AS ENUM ('EDITAL', 'CONVENIO', 'EMENDA', 'PATROCINIO', 'LEI_INCENTIVO', 'DOACAO');

-- CreateEnum
CREATE TYPE "FundingOpportunityStatus" AS ENUM ('ABERTO', 'ENCERRADO', 'SUSPENSO', 'EM_BREVE');

-- CreateEnum
CREATE TYPE "FundingApplicationStatus" AS ENUM ('RASCUNHO', 'SUBMETIDO', 'EM_ANALISE', 'APROVADO', 'REPROVADO', 'RECURSO', 'HOMOLOGADO');

-- CreateEnum
CREATE TYPE "IncentiveLawType" AS ENUM ('ROUANET', 'FNC', 'PRONAC', 'ESTADUAL', 'MUNICIPAL', 'ESPORTE', 'CRIANCA');

-- CreateEnum
CREATE TYPE "ConvenioStatus" AS ENUM ('PROPOSTA', 'ASSINADO', 'EM_EXECUCAO', 'PRESTACAO_CONTAS', 'ENCERRADO', 'INADIMPLENTE');

-- CreateEnum
CREATE TYPE "EmendaType" AS ENUM ('INDIVIDUAL', 'BANCADA', 'COMISSAO');

-- CreateEnum
CREATE TYPE "EmendaStatus" AS ENUM ('INDICADA', 'EMPENHADA', 'PAGA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('ATIVO', 'SUSPENSO', 'ENCERRADO', 'REVISAO');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RECEITA', 'DESPESA', 'TRANSFERENCIA', 'DEVOLUCAO');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDENTE', 'APROVADO', 'PAGO', 'CANCELADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDENTE', 'VALIDADA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CONTRATO', 'ESTATUTO', 'CERTIDAO', 'RELATORIO', 'NOTA_FISCAL', 'COMPROVANTE', 'OFICIO', 'ATA', 'OUTROS');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('RASCUNHO', 'PENDENTE_ASSINATURA', 'ASSINADO', 'VENCIDO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('PENDENTE', 'ASSINADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "AccountabilityReportType" AS ENUM ('PARCIAL', 'FINAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "AccountabilityReportStatus" AS ENUM ('RASCUNHO', 'EM_REVISAO', 'SUBMETIDO', 'EM_ANALISE', 'APROVADO', 'REPROVADO', 'PENDENTE_CORRECAO');

-- CreateEnum
CREATE TYPE "GlossStatus" AS ENUM ('PENDENTE', 'ACEITO', 'RECURSO', 'DEFINITIVO');

-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('QUANTITATIVO', 'QUALITATIVO');

-- CreateEnum
CREATE TYPE "MeasurementFrequency" AS ENUM ('DIARIO', 'SEMANAL', 'MENSAL', 'TRIMESTRAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MASCULINO', 'FEMININO', 'NAO_BINARIO', 'PREFIRO_NAO_INFORMAR', 'OUTRO');

-- CreateEnum
CREATE TYPE "Race" AS ENUM ('BRANCA', 'PRETA', 'PARDA', 'AMARELA', 'INDIGENA', 'NAO_DECLARADA');

-- CreateEnum
CREATE TYPE "BeneficiaryStatus" AS ENUM ('ATIVO', 'INATIVO', 'SUSPENSO', 'EGRESSO');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('OFICINA', 'AULA', 'EVENTO', 'REUNIAO', 'VISITA', 'CAPACITACAO', 'OUTROS');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('AGENDADA', 'EM_ANDAMENTO', 'REALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('INSCRITO', 'CONFIRMADO', 'AUSENTE', 'PRESENTE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('EMPRESA', 'GOVERNO', 'OUTRO_OSC', 'PESSOA_FISICA', 'INTERNACIONAL');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PROSPECTO', 'ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('PATROCINIO', 'PARCERIA_TECNICA', 'COEXECUCAO', 'DOACAO', 'VOLUNTARIADO');

-- CreateEnum
CREATE TYPE "PartnershipStatus" AS ENUM ('PROPOSTA', 'ATIVO', 'ENCERRADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "SponsorTier" AS ENUM ('DIAMANTE', 'OURO', 'PRATA', 'BRONZE', 'APOIADOR');

-- CreateEnum
CREATE TYPE "SponsorStatus" AS ENUM ('ATIVO', 'INATIVO', 'PROSPECTO');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'APROVADO', 'REJEITADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO', 'DELEGADO');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('CONFORME', 'NAO_CONFORME', 'PENDENTE', 'NA');

-- CreateEnum
CREATE TYPE "LGPDConsentStatus" AS ENUM ('ATIVO', 'REVOGADO');

-- CreateEnum
CREATE TYPE "AIAgentType" AS ENUM ('JURIDICO', 'FINANCEIRO', 'CAPTACAO', 'GESTAO', 'COMPLIANCE');

-- CreateEnum
CREATE TYPE "AIAgentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "AITaskStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'WHATSAPP', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "OrganizationDocumentStatus" AS ENUM ('VALIDO', 'VENCIDO', 'PENDENTE', 'REJEITADO');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "OrgProfileType" AS ENUM ('EXECUTOR_PROJETOS_SOCIAIS', 'OSC', 'INSTITUTO', 'FUNDACAO', 'ASSOCIACAO');

-- CreateEnum
CREATE TYPE "ProfileDocType" AS ENUM ('CPF', 'CNPJ');

-- CreateEnum
CREATE TYPE "OrgAbrangencia" AS ENUM ('MUNICIPAL', 'ESTADUAL', 'NACIONAL', 'INTERNACIONAL');

-- CreateEnum
CREATE TYPE "EditalFonte" AS ENUM ('PNCP', 'MANUAL');

-- CreateEnum
CREATE TYPE "SavedEditalStatus" AS ENUM ('SALVO', 'EM_PREPARACAO', 'INSCRITO', 'APROVADO', 'REPROVADO', 'ENCERRADO');

-- CreateEnum
CREATE TYPE "ParentescoType" AS ENUM ('PAI', 'MAE', 'AVO', 'TIO', 'TUTOR_LEGAL', 'OUTRO');

-- CreateEnum
CREATE TYPE "VinculoStatus" AS ENUM ('ATIVO', 'INATIVO', 'DESLIGADO', 'EM_ESPERA');

-- CreateEnum
CREATE TYPE "TipoVinculo" AS ENUM ('VOLUNTARIO', 'CLT', 'AUTONOMO_PJ', 'PRESTADOR_SERVICO');

-- CreateEnum
CREATE TYPE "ProfessorStatus" AS ENUM ('ATIVO', 'INATIVO', 'AFASTADO', 'DESLIGADO');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'TRANSFERENCIA', 'DINHEIRO', 'BOLETO');

-- CreateEnum
CREATE TYPE "ConectaMatriculaStatus" AS ENUM ('ATIVA', 'TRANCADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "ConectaAtividadeStatus" AS ENUM ('RASCUNHO', 'PUBLICADA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "ConectaEntregaStatus" AS ENUM ('PENDENTE', 'ENTREGUE', 'AVALIADA');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TenantType" NOT NULL,
    "plan" "TenantPlan" NOT NULL DEFAULT 'FREE',
    "status" "TenantStatus" NOT NULL DEFAULT 'TRIAL',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "logo_url" TEXT,
    "cnpj" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "granted_by" TEXT,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "user_agent" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "trade_name" TEXT,
    "cnpj" TEXT,
    "type" "TenantType" NOT NULL,
    "founded_at" TIMESTAMP(3),
    "mission" TEXT,
    "vision" TEXT,
    "values" TEXT,
    "address" JSONB,
    "social_links" JSONB DEFAULT '{}',
    "bank_accounts" JSONB DEFAULT '[]',
    "certificates" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_documents" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "status" "OrganizationDocumentStatus" NOT NULL DEFAULT 'VALIDO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ProjectType" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'RASCUNHO',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "total_budget" DECIMAL(18,2),
    "approved_budget" DECIMAL(18,2),
    "funding_sources" JSONB DEFAULT '[]',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "manager_id" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ProjectMemberRole" NOT NULL DEFAULT 'COLABORADOR',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_phases" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "PhaseStatus" NOT NULL DEFAULT 'NAO_INICIADA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tasks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "phase_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assigned_to" TEXT,
    "due_date" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDENTE',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIA',
    "attachments" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_risks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "probability" "RiskLevel" NOT NULL,
    "impact" "RiskLevel" NOT NULL,
    "mitigation" TEXT,
    "status" "RiskStatus" NOT NULL DEFAULT 'IDENTIFICADO',
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_indicators" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT,
    "baseline" DECIMAL(18,4),
    "target" DECIMAL(18,4),
    "current_value" DECIMAL(18,4),
    "frequency" "MeasurementFrequency",
    "last_updated" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding_opportunities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "FundingOpportunityType" NOT NULL,
    "source_name" TEXT,
    "source_url" TEXT,
    "total_amount" DECIMAL(18,2),
    "min_amount" DECIMAL(18,2),
    "max_amount" DECIMAL(18,2),
    "opens_at" TIMESTAMP(3),
    "closes_at" TIMESTAMP(3),
    "status" "FundingOpportunityStatus" NOT NULL DEFAULT 'ABERTO',
    "requirements" JSONB DEFAULT '{}',
    "areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funding_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding_applications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT,
    "opportunity_id" TEXT,
    "title" TEXT NOT NULL,
    "status" "FundingApplicationStatus" NOT NULL DEFAULT 'RASCUNHO',
    "submitted_at" TIMESTAMP(3),
    "result_at" TIMESTAMP(3),
    "approved_amount" DECIMAL(18,2),
    "notes" TEXT,
    "documents" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funding_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incentive_laws" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "IncentiveLawType" NOT NULL,
    "description" TEXT,
    "fiscal_benefit_pct" DECIMAL(5,2),
    "max_amount" DECIMAL(18,2),
    "min_amount" DECIMAL(18,2),
    "eligible_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requirements" JSONB DEFAULT '{}',
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_laws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convenios" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT,
    "number" TEXT,
    "concedente" TEXT NOT NULL,
    "interveniente" TEXT,
    "object" TEXT NOT NULL,
    "total_value" DECIMAL(18,2) NOT NULL,
    "counterpart_value" DECIMAL(18,2),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "ConvenioStatus" NOT NULL DEFAULT 'PROPOSTA',
    "siconv_id" TEXT,
    "bank_account" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convenios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emendas_parlamentares" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT,
    "number" TEXT,
    "year" INTEGER NOT NULL,
    "parlamentar_name" TEXT NOT NULL,
    "parlamentar_party" TEXT,
    "type" "EmendaType" NOT NULL,
    "value" DECIMAL(18,2) NOT NULL,
    "status" "EmendaStatus" NOT NULL DEFAULT 'INDICADA',
    "object" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emendas_parlamentares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT,
    "funding_source_id" TEXT,
    "fiscal_year" INTEGER NOT NULL,
    "total_amount" DECIMAL(18,2) NOT NULL,
    "allocated" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "committed" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "spent" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(18,2) NOT NULL,
    "status" "BudgetStatus" NOT NULL DEFAULT 'ATIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_categories" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "planned_amount" DECIMAL(18,2) NOT NULL,
    "committed_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "spent_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unit" TEXT,
    "unit_value" DECIMAL(18,2) NOT NULL,
    "total_value" DECIMAL(18,2) NOT NULL,
    "spent_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" TEXT,
    "type" TEXT,
    "project_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT,
    "cost_center_id" TEXT,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDENTE',
    "description" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "payment_method" TEXT,
    "reference_number" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attachments" JSONB DEFAULT '[]',
    "created_by" TEXT,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "supplier_name" TEXT NOT NULL,
    "supplier_cnpj_cpf" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "bank_data" JSONB,
    "approved_by" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "number" TEXT,
    "supplier_name" TEXT NOT NULL,
    "supplier_cnpj" TEXT,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "tax_amount" DECIMAL(18,2),
    "net_amount" DECIMAL(18,2),
    "file_url" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDENTE',
    "validated_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_reconciliations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "opening_balance" DECIMAL(18,2) NOT NULL,
    "closing_balance" DECIMAL(18,2) NOT NULL,
    "status" TEXT NOT NULL,
    "reconciled_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_statements" (
    "id" TEXT NOT NULL,
    "reconciliation_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "type" TEXT NOT NULL,
    "matched_transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'RASCUNHO',
    "file_url" TEXT,
    "file_size" BIGINT,
    "mime_type" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parent_id" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB DEFAULT '{}',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "changes_description" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_signatures" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "signer_name" TEXT NOT NULL,
    "signer_email" TEXT NOT NULL,
    "signer_cpf" TEXT,
    "role" TEXT,
    "status" "SignatureStatus" NOT NULL DEFAULT 'PENDENTE',
    "signed_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "certificate" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_folders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" TEXT,
    "project_id" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_profiles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nome_organizacao" VARCHAR(100) NOT NULL,
    "tipo_organizacao" "OrgProfileType",
    "tipo_documento" "ProfileDocType",
    "documento" TEXT,
    "abrangencia" "OrgAbrangencia",
    "areas_atuacao" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "municipio" TEXT,
    "uf" VARCHAR(2),
    "telefone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutional_doc_categories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institutional_doc_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutional_doc_types" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "default_validity_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institutional_doc_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutional_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "doc_type_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "status" "OrganizationDocumentStatus" NOT NULL DEFAULT 'VALIDO',
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutional_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accountability_reports" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT,
    "funding_source_id" TEXT,
    "title" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "type" "AccountabilityReportType" NOT NULL,
    "status" "AccountabilityReportStatus" NOT NULL DEFAULT 'RASCUNHO',
    "total_received" DECIMAL(18,2),
    "total_spent" DECIMAL(18,2),
    "balance" DECIMAL(18,2),
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accountability_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accountability_items" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "category" TEXT,
    "document_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accountability_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accountability_glosses" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "item_id" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "response" TEXT,
    "status" "GlossStatus" NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accountability_glosses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicators" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "type" "IndicatorType" NOT NULL,
    "unit" TEXT,
    "calculation_method" TEXT,
    "data_source" TEXT,
    "frequency" "MeasurementFrequency" NOT NULL,
    "baseline" DECIMAL(18,4),
    "target" DECIMAL(18,4),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicator_measurements" (
    "id" TEXT NOT NULL,
    "indicator_id" TEXT NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "evidence_url" TEXT,
    "verified_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indicator_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiaries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "birth_date" TIMESTAMP(3),
    "gender" "Gender",
    "race" "Race",
    "social_vulnerability" JSONB,
    "address" JSONB,
    "contact" JSONB,
    "status" "BeneficiaryStatus" NOT NULL DEFAULT 'ATIVO',
    "enrollment_date" TIMESTAMP(3),
    "exit_date" TIMESTAMP(3),
    "exit_reason" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "foto_url" TEXT,
    "rg_certidao" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf_endereco" TEXT,
    "turma" TEXT,
    "turno" TEXT,
    "escola" TEXT,
    "serie_ano" TEXT,
    "renda_familiar" DECIMAL(18,2),
    "pessoas_residencia" INTEGER,
    "necessidades_especiais" TEXT,
    "alergias" TEXT,
    "medicamentos" TEXT,
    "observacoes_gerais" TEXT,
    "termo_consentimento" BOOLEAN NOT NULL DEFAULT false,
    "data_consentimento" TIMESTAMP(3),
    "autorizacao_uso_imagem" BOOLEAN NOT NULL DEFAULT false,
    "documento_consentimento_url" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiary_activities" (
    "id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "attended_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beneficiary_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ActivityType" NOT NULL,
    "status" "ActivityStatus" NOT NULL DEFAULT 'AGENDADA',
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "location" JSONB,
    "capacity" INTEGER,
    "enrolled_count" INTEGER NOT NULL DEFAULT 0,
    "responsible_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_enrollments" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'INSCRITO',
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_attendances" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "attended_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "cnpj_cpf" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" JSONB,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PROSPECTO',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_contacts" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partnerships" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "project_id" TEXT,
    "type" "PartnershipType" NOT NULL,
    "value" DECIMAL(18,2),
    "in_kind_value" DECIMAL(18,2),
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "PartnershipStatus" NOT NULL DEFAULT 'PROPOSTA',
    "contract_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partnerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsors" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "partner_id" TEXT,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "website" TEXT,
    "tier" "SponsorTier" NOT NULL,
    "investment_amount" DECIMAL(18,2),
    "benefits" JSONB DEFAULT '{}',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "SponsorStatus" NOT NULL DEFAULT 'PROSPECTO',
    "project_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" TEXT NOT NULL,
    "template_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'PENDENTE',
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "started_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_approvals" (
    "id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "approver_id" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDENTE',
    "notes" TEXT,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_requirements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "law_reference" TEXT,
    "type" TEXT,
    "applicable_to" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "due_date_rule" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "requirement_id" TEXT,
    "project_id" TEXT,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'PENDENTE',
    "evidence_url" TEXT,
    "notes" TEXT,
    "checked_by" TEXT,
    "checked_at" TIMESTAMP(3),
    "next_check_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_consents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "data_subject_id" TEXT NOT NULL,
    "data_subject_type" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" "LGPDConsentStatus" NOT NULL DEFAULT 'ATIVO',
    "consented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lgpd_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_agents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" "AIAgentType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AIAgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "config" JSONB NOT NULL DEFAULT '{}',
    "model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "agent_id" TEXT,
    "context_type" TEXT,
    "context_id" TEXT,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tasks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "type" TEXT NOT NULL,
    "status" "AITaskStatus" NOT NULL DEFAULT 'PENDING',
    "input" JSONB,
    "output" JSONB,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_embeddings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB DEFAULT '{}',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "body_template" TEXT NOT NULL,
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invites" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role_id" TEXT,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "token_hash" TEXT NOT NULL,
    "invited_by" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editais" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "fonte" "EditalFonte" NOT NULL,
    "external_id" TEXT,
    "titulo" TEXT NOT NULL,
    "orgao" TEXT,
    "descricao" TEXT,
    "valor_total" DECIMAL(18,2),
    "data_abertura" TIMESTAMP(3),
    "data_encerramento" TIMESTAMP(3),
    "abrangencia" "OrgAbrangencia",
    "uf" TEXT,
    "area_tematica" TEXT,
    "link_oficial" TEXT,
    "requisitos_documentais" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_editais" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "edital_ref" TEXT NOT NULL,
    "fonte" "EditalFonte" NOT NULL,
    "external_id" TEXT,
    "edital_id" TEXT,
    "titulo" TEXT NOT NULL,
    "orgao" TEXT,
    "data_encerramento" TIMESTAMP(3),
    "status" "SavedEditalStatus" NOT NULL DEFAULT 'SALVO',
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_editais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responsaveis" (
    "id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "parentesco" "ParentescoType" NOT NULL,
    "cpf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responsaveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiarios_projetos" (
    "id" TEXT NOT NULL,
    "beneficiary_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "data_ingresso" TIMESTAMP(3) NOT NULL,
    "data_desligamento" TIMESTAMP(3),
    "status" "VinculoStatus" NOT NULL DEFAULT 'ATIVO',
    "turma" TEXT,
    "turno" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiarios_projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professores" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "telefone" TEXT,
    "email" TEXT,
    "foto_url" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "formacao_academica" TEXT,
    "especializacao" TEXT,
    "disciplinas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tipo_vinculo" "TipoVinculo" NOT NULL,
    "forma_pagamento" "FormaPagamento",
    "dados_bancarios" JSONB,
    "dia_pagamento" INTEGER,
    "comprovante_formacao_url" TEXT,
    "certificados_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contrato_url" TEXT,
    "status" "ProfessorStatus" NOT NULL DEFAULT 'ATIVO',
    "data_admissao" TIMESTAMP(3),
    "data_desligamento" TIMESTAMP(3),
    "observacoes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professores_projetos" (
    "id" TEXT NOT NULL,
    "professor_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3),
    "status" "ProfessorStatus" NOT NULL DEFAULT 'ATIVO',
    "carga_horaria_semanal" INTEGER,
    "dias_horarios" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professores_projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_professores" (
    "id" TEXT NOT NULL,
    "professor_id" TEXT NOT NULL,
    "valor_hora_aula" DECIMAL(18,2),
    "valor_mensal" DECIMAL(18,2),
    "data_vigencia" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_professores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turmas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT,
    "professor_id" TEXT,
    "nome" TEXT NOT NULL,
    "horario" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matriculas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "turma_id" TEXT NOT NULL,
    "aluno_id" TEXT NOT NULL,
    "status" "ConectaMatriculaStatus" NOT NULL DEFAULT 'ATIVA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matriculas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conecta_atividades" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "turma_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "prazo" TIMESTAMP(3),
    "status" "ConectaAtividadeStatus" NOT NULL DEFAULT 'RASCUNHO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conecta_atividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas_atividades" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "atividade_id" TEXT NOT NULL,
    "matricula_id" TEXT NOT NULL,
    "status" "ConectaEntregaStatus" NOT NULL DEFAULT 'PENDENTE',
    "conteudo" TEXT,
    "nota" DECIMAL(5,2),
    "entregue_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entregas_atividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presencas" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "turma_id" TEXT NOT NULL,
    "matricula_id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "presente" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presencas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_desenvolvimento" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "matricula_id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "nota" DECIMAL(5,2),
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_desenvolvimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_cnpj_key" ON "tenants"("cnpj");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_cnpj_idx" ON "tenants"("cnpj");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "tenants_deleted_at_idx" ON "tenants"("deleted_at");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "roles_tenant_id_idx" ON "roles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_name_key" ON "roles"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "user_roles_granted_by_idx" ON "user_roles"("granted_by");

-- CreateIndex
CREATE INDEX "user_roles_expires_at_idx" ON "user_roles"("expires_at");

-- CreateIndex
CREATE INDEX "permissions_resource_idx" ON "permissions"("resource");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resource_id_idx" ON "audit_logs"("resource", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_tenant_id_key" ON "organizations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_cnpj_key" ON "organizations"("cnpj");

-- CreateIndex
CREATE INDEX "organizations_tenant_id_idx" ON "organizations"("tenant_id");

-- CreateIndex
CREATE INDEX "organizations_cnpj_idx" ON "organizations"("cnpj");

-- CreateIndex
CREATE INDEX "organization_documents_org_id_idx" ON "organization_documents"("org_id");

-- CreateIndex
CREATE INDEX "organization_documents_status_idx" ON "organization_documents"("status");

-- CreateIndex
CREATE INDEX "organization_documents_expires_at_idx" ON "organization_documents"("expires_at");

-- CreateIndex
CREATE INDEX "projects_tenant_id_idx" ON "projects"("tenant_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_type_idx" ON "projects"("type");

-- CreateIndex
CREATE INDEX "projects_manager_id_idx" ON "projects"("manager_id");

-- CreateIndex
CREATE INDEX "projects_deleted_at_idx" ON "projects"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "projects_tenant_id_code_key" ON "projects"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "project_members_project_id_idx" ON "project_members"("project_id");

-- CreateIndex
CREATE INDEX "project_members_user_id_idx" ON "project_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");

-- CreateIndex
CREATE INDEX "project_phases_project_id_idx" ON "project_phases"("project_id");

-- CreateIndex
CREATE INDEX "project_phases_status_idx" ON "project_phases"("status");

-- CreateIndex
CREATE INDEX "project_tasks_project_id_idx" ON "project_tasks"("project_id");

-- CreateIndex
CREATE INDEX "project_tasks_phase_id_idx" ON "project_tasks"("phase_id");

-- CreateIndex
CREATE INDEX "project_tasks_assigned_to_idx" ON "project_tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "project_tasks_status_idx" ON "project_tasks"("status");

-- CreateIndex
CREATE INDEX "project_tasks_priority_idx" ON "project_tasks"("priority");

-- CreateIndex
CREATE INDEX "project_tasks_due_date_idx" ON "project_tasks"("due_date");

-- CreateIndex
CREATE INDEX "project_risks_project_id_idx" ON "project_risks"("project_id");

-- CreateIndex
CREATE INDEX "project_risks_owner_id_idx" ON "project_risks"("owner_id");

-- CreateIndex
CREATE INDEX "project_risks_status_idx" ON "project_risks"("status");

-- CreateIndex
CREATE INDEX "project_indicators_project_id_idx" ON "project_indicators"("project_id");

-- CreateIndex
CREATE INDEX "funding_opportunities_tenant_id_idx" ON "funding_opportunities"("tenant_id");

-- CreateIndex
CREATE INDEX "funding_opportunities_type_idx" ON "funding_opportunities"("type");

-- CreateIndex
CREATE INDEX "funding_opportunities_status_idx" ON "funding_opportunities"("status");

-- CreateIndex
CREATE INDEX "funding_opportunities_closes_at_idx" ON "funding_opportunities"("closes_at");

-- CreateIndex
CREATE INDEX "funding_applications_tenant_id_idx" ON "funding_applications"("tenant_id");

-- CreateIndex
CREATE INDEX "funding_applications_project_id_idx" ON "funding_applications"("project_id");

-- CreateIndex
CREATE INDEX "funding_applications_opportunity_id_idx" ON "funding_applications"("opportunity_id");

-- CreateIndex
CREATE INDEX "funding_applications_status_idx" ON "funding_applications"("status");

-- CreateIndex
CREATE INDEX "incentive_laws_tenant_id_idx" ON "incentive_laws"("tenant_id");

-- CreateIndex
CREATE INDEX "incentive_laws_type_idx" ON "incentive_laws"("type");

-- CreateIndex
CREATE INDEX "incentive_laws_status_idx" ON "incentive_laws"("status");

-- CreateIndex
CREATE INDEX "convenios_tenant_id_idx" ON "convenios"("tenant_id");

-- CreateIndex
CREATE INDEX "convenios_project_id_idx" ON "convenios"("project_id");

-- CreateIndex
CREATE INDEX "convenios_status_idx" ON "convenios"("status");

-- CreateIndex
CREATE INDEX "convenios_number_idx" ON "convenios"("number");

-- CreateIndex
CREATE INDEX "emendas_parlamentares_tenant_id_idx" ON "emendas_parlamentares"("tenant_id");

-- CreateIndex
CREATE INDEX "emendas_parlamentares_project_id_idx" ON "emendas_parlamentares"("project_id");

-- CreateIndex
CREATE INDEX "emendas_parlamentares_status_idx" ON "emendas_parlamentares"("status");

-- CreateIndex
CREATE INDEX "emendas_parlamentares_year_idx" ON "emendas_parlamentares"("year");

-- CreateIndex
CREATE INDEX "budgets_tenant_id_idx" ON "budgets"("tenant_id");

-- CreateIndex
CREATE INDEX "budgets_project_id_idx" ON "budgets"("project_id");

-- CreateIndex
CREATE INDEX "budgets_fiscal_year_idx" ON "budgets"("fiscal_year");

-- CreateIndex
CREATE INDEX "budgets_status_idx" ON "budgets"("status");

-- CreateIndex
CREATE INDEX "budget_categories_budget_id_idx" ON "budget_categories"("budget_id");

-- CreateIndex
CREATE INDEX "budget_items_category_id_idx" ON "budget_items"("category_id");

-- CreateIndex
CREATE INDEX "cost_centers_tenant_id_idx" ON "cost_centers"("tenant_id");

-- CreateIndex
CREATE INDEX "cost_centers_parent_id_idx" ON "cost_centers"("parent_id");

-- CreateIndex
CREATE INDEX "cost_centers_project_id_idx" ON "cost_centers"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_tenant_id_code_key" ON "cost_centers"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "transactions_tenant_id_idx" ON "transactions"("tenant_id");

-- CreateIndex
CREATE INDEX "transactions_project_id_idx" ON "transactions"("project_id");

-- CreateIndex
CREATE INDEX "transactions_cost_center_id_idx" ON "transactions"("cost_center_id");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "transactions_created_by_idx" ON "transactions"("created_by");

-- CreateIndex
CREATE INDEX "payment_orders_tenant_id_idx" ON "payment_orders"("tenant_id");

-- CreateIndex
CREATE INDEX "payment_orders_transaction_id_idx" ON "payment_orders"("transaction_id");

-- CreateIndex
CREATE INDEX "payment_orders_status_idx" ON "payment_orders"("status");

-- CreateIndex
CREATE INDEX "payment_orders_due_date_idx" ON "payment_orders"("due_date");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_idx" ON "invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "invoices_transaction_id_idx" ON "invoices"("transaction_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_issue_date_idx" ON "invoices"("issue_date");

-- CreateIndex
CREATE INDEX "bank_reconciliations_tenant_id_idx" ON "bank_reconciliations"("tenant_id");

-- CreateIndex
CREATE INDEX "bank_reconciliations_account_id_idx" ON "bank_reconciliations"("account_id");

-- CreateIndex
CREATE INDEX "bank_reconciliations_period_start_period_end_idx" ON "bank_reconciliations"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "bank_reconciliations_status_idx" ON "bank_reconciliations"("status");

-- CreateIndex
CREATE INDEX "account_statements_reconciliation_id_idx" ON "account_statements"("reconciliation_id");

-- CreateIndex
CREATE INDEX "account_statements_matched_transaction_id_idx" ON "account_statements"("matched_transaction_id");

-- CreateIndex
CREATE INDEX "account_statements_date_idx" ON "account_statements"("date");

-- CreateIndex
CREATE INDEX "documents_tenant_id_idx" ON "documents"("tenant_id");

-- CreateIndex
CREATE INDEX "documents_project_id_idx" ON "documents"("project_id");

-- CreateIndex
CREATE INDEX "documents_type_idx" ON "documents"("type");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_parent_id_idx" ON "documents"("parent_id");

-- CreateIndex
CREATE INDEX "documents_deleted_at_idx" ON "documents"("deleted_at");

-- CreateIndex
CREATE INDEX "document_versions_document_id_idx" ON "document_versions"("document_id");

-- CreateIndex
CREATE INDEX "document_versions_created_by_idx" ON "document_versions"("created_by");

-- CreateIndex
CREATE INDEX "document_signatures_document_id_idx" ON "document_signatures"("document_id");

-- CreateIndex
CREATE INDEX "document_signatures_status_idx" ON "document_signatures"("status");

-- CreateIndex
CREATE INDEX "document_signatures_signer_email_idx" ON "document_signatures"("signer_email");

-- CreateIndex
CREATE INDEX "document_folders_tenant_id_idx" ON "document_folders"("tenant_id");

-- CreateIndex
CREATE INDEX "document_folders_parent_id_idx" ON "document_folders"("parent_id");

-- CreateIndex
CREATE INDEX "document_folders_project_id_idx" ON "document_folders"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_profiles_tenant_id_key" ON "organization_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "organization_profiles_tenant_id_idx" ON "organization_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "institutional_doc_categories_tenant_id_idx" ON "institutional_doc_categories"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "institutional_doc_categories_tenant_id_name_key" ON "institutional_doc_categories"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "institutional_doc_types_category_id_idx" ON "institutional_doc_types"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "institutional_doc_types_category_id_name_key" ON "institutional_doc_types"("category_id", "name");

-- CreateIndex
CREATE INDEX "institutional_documents_tenant_id_idx" ON "institutional_documents"("tenant_id");

-- CreateIndex
CREATE INDEX "institutional_documents_status_idx" ON "institutional_documents"("status");

-- CreateIndex
CREATE INDEX "institutional_documents_valid_until_idx" ON "institutional_documents"("valid_until");

-- CreateIndex
CREATE UNIQUE INDEX "institutional_documents_tenant_id_doc_type_id_key" ON "institutional_documents"("tenant_id", "doc_type_id");

-- CreateIndex
CREATE INDEX "accountability_reports_tenant_id_idx" ON "accountability_reports"("tenant_id");

-- CreateIndex
CREATE INDEX "accountability_reports_project_id_idx" ON "accountability_reports"("project_id");

-- CreateIndex
CREATE INDEX "accountability_reports_type_idx" ON "accountability_reports"("type");

-- CreateIndex
CREATE INDEX "accountability_reports_status_idx" ON "accountability_reports"("status");

-- CreateIndex
CREATE INDEX "accountability_reports_period_start_period_end_idx" ON "accountability_reports"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "accountability_items_report_id_idx" ON "accountability_items"("report_id");

-- CreateIndex
CREATE INDEX "accountability_items_transaction_id_idx" ON "accountability_items"("transaction_id");

-- CreateIndex
CREATE INDEX "accountability_glosses_report_id_idx" ON "accountability_glosses"("report_id");

-- CreateIndex
CREATE INDEX "accountability_glosses_item_id_idx" ON "accountability_glosses"("item_id");

-- CreateIndex
CREATE INDEX "accountability_glosses_status_idx" ON "accountability_glosses"("status");

-- CreateIndex
CREATE INDEX "indicators_tenant_id_idx" ON "indicators"("tenant_id");

-- CreateIndex
CREATE INDEX "indicators_project_id_idx" ON "indicators"("project_id");

-- CreateIndex
CREATE INDEX "indicators_type_idx" ON "indicators"("type");

-- CreateIndex
CREATE UNIQUE INDEX "indicators_tenant_id_code_key" ON "indicators"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "indicator_measurements_indicator_id_idx" ON "indicator_measurements"("indicator_id");

-- CreateIndex
CREATE INDEX "indicator_measurements_date_idx" ON "indicator_measurements"("date");

-- CreateIndex
CREATE INDEX "indicator_measurements_verified_by_idx" ON "indicator_measurements"("verified_by");

-- CreateIndex
CREATE INDEX "beneficiaries_tenant_id_idx" ON "beneficiaries"("tenant_id");

-- CreateIndex
CREATE INDEX "beneficiaries_project_id_idx" ON "beneficiaries"("project_id");

-- CreateIndex
CREATE INDEX "beneficiaries_status_idx" ON "beneficiaries"("status");

-- CreateIndex
CREATE INDEX "beneficiaries_cpf_idx" ON "beneficiaries"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiaries_tenant_id_cpf_key" ON "beneficiaries"("tenant_id", "cpf");

-- CreateIndex
CREATE INDEX "beneficiary_activities_beneficiary_id_idx" ON "beneficiary_activities"("beneficiary_id");

-- CreateIndex
CREATE INDEX "beneficiary_activities_activity_id_idx" ON "beneficiary_activities"("activity_id");

-- CreateIndex
CREATE INDEX "activities_tenant_id_idx" ON "activities"("tenant_id");

-- CreateIndex
CREATE INDEX "activities_project_id_idx" ON "activities"("project_id");

-- CreateIndex
CREATE INDEX "activities_type_idx" ON "activities"("type");

-- CreateIndex
CREATE INDEX "activities_status_idx" ON "activities"("status");

-- CreateIndex
CREATE INDEX "activities_start_at_idx" ON "activities"("start_at");

-- CreateIndex
CREATE INDEX "activities_responsible_id_idx" ON "activities"("responsible_id");

-- CreateIndex
CREATE INDEX "activity_enrollments_activity_id_idx" ON "activity_enrollments"("activity_id");

-- CreateIndex
CREATE INDEX "activity_enrollments_beneficiary_id_idx" ON "activity_enrollments"("beneficiary_id");

-- CreateIndex
CREATE INDEX "activity_enrollments_status_idx" ON "activity_enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "activity_enrollments_activity_id_beneficiary_id_key" ON "activity_enrollments"("activity_id", "beneficiary_id");

-- CreateIndex
CREATE INDEX "activity_attendances_activity_id_idx" ON "activity_attendances"("activity_id");

-- CreateIndex
CREATE INDEX "activity_attendances_beneficiary_id_idx" ON "activity_attendances"("beneficiary_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_attendances_activity_id_beneficiary_id_key" ON "activity_attendances"("activity_id", "beneficiary_id");

-- CreateIndex
CREATE INDEX "partners_tenant_id_idx" ON "partners"("tenant_id");

-- CreateIndex
CREATE INDEX "partners_type_idx" ON "partners"("type");

-- CreateIndex
CREATE INDEX "partners_status_idx" ON "partners"("status");

-- CreateIndex
CREATE INDEX "partners_cnpj_cpf_idx" ON "partners"("cnpj_cpf");

-- CreateIndex
CREATE INDEX "partner_contacts_partner_id_idx" ON "partner_contacts"("partner_id");

-- CreateIndex
CREATE INDEX "partnerships_tenant_id_idx" ON "partnerships"("tenant_id");

-- CreateIndex
CREATE INDEX "partnerships_partner_id_idx" ON "partnerships"("partner_id");

-- CreateIndex
CREATE INDEX "partnerships_project_id_idx" ON "partnerships"("project_id");

-- CreateIndex
CREATE INDEX "partnerships_type_idx" ON "partnerships"("type");

-- CreateIndex
CREATE INDEX "partnerships_status_idx" ON "partnerships"("status");

-- CreateIndex
CREATE INDEX "sponsors_tenant_id_idx" ON "sponsors"("tenant_id");

-- CreateIndex
CREATE INDEX "sponsors_partner_id_idx" ON "sponsors"("partner_id");

-- CreateIndex
CREATE INDEX "sponsors_tier_idx" ON "sponsors"("tier");

-- CreateIndex
CREATE INDEX "sponsors_status_idx" ON "sponsors"("status");

-- CreateIndex
CREATE INDEX "workflow_templates_tenant_id_idx" ON "workflow_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "workflow_templates_type_idx" ON "workflow_templates"("type");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_templates_tenant_id_name_key" ON "workflow_templates"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "workflow_instances_tenant_id_idx" ON "workflow_instances"("tenant_id");

-- CreateIndex
CREATE INDEX "workflow_instances_template_id_idx" ON "workflow_instances"("template_id");

-- CreateIndex
CREATE INDEX "workflow_instances_resource_type_resource_id_idx" ON "workflow_instances"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "workflow_instances_status_idx" ON "workflow_instances"("status");

-- CreateIndex
CREATE INDEX "workflow_approvals_instance_id_idx" ON "workflow_approvals"("instance_id");

-- CreateIndex
CREATE INDEX "workflow_approvals_approver_id_idx" ON "workflow_approvals"("approver_id");

-- CreateIndex
CREATE INDEX "workflow_approvals_status_idx" ON "workflow_approvals"("status");

-- CreateIndex
CREATE INDEX "legal_requirements_tenant_id_idx" ON "legal_requirements"("tenant_id");

-- CreateIndex
CREATE INDEX "legal_requirements_type_idx" ON "legal_requirements"("type");

-- CreateIndex
CREATE INDEX "compliance_checks_tenant_id_idx" ON "compliance_checks"("tenant_id");

-- CreateIndex
CREATE INDEX "compliance_checks_requirement_id_idx" ON "compliance_checks"("requirement_id");

-- CreateIndex
CREATE INDEX "compliance_checks_project_id_idx" ON "compliance_checks"("project_id");

-- CreateIndex
CREATE INDEX "compliance_checks_status_idx" ON "compliance_checks"("status");

-- CreateIndex
CREATE INDEX "compliance_checks_next_check_at_idx" ON "compliance_checks"("next_check_at");

-- CreateIndex
CREATE INDEX "lgpd_consents_tenant_id_idx" ON "lgpd_consents"("tenant_id");

-- CreateIndex
CREATE INDEX "lgpd_consents_data_subject_id_data_subject_type_idx" ON "lgpd_consents"("data_subject_id", "data_subject_type");

-- CreateIndex
CREATE INDEX "lgpd_consents_status_idx" ON "lgpd_consents"("status");

-- CreateIndex
CREATE INDEX "ai_agents_tenant_id_idx" ON "ai_agents"("tenant_id");

-- CreateIndex
CREATE INDEX "ai_agents_type_idx" ON "ai_agents"("type");

-- CreateIndex
CREATE INDEX "ai_agents_status_idx" ON "ai_agents"("status");

-- CreateIndex
CREATE INDEX "ai_conversations_tenant_id_idx" ON "ai_conversations"("tenant_id");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");

-- CreateIndex
CREATE INDEX "ai_conversations_agent_id_idx" ON "ai_conversations"("agent_id");

-- CreateIndex
CREATE INDEX "ai_conversations_context_type_context_id_idx" ON "ai_conversations"("context_type", "context_id");

-- CreateIndex
CREATE INDEX "ai_tasks_tenant_id_idx" ON "ai_tasks"("tenant_id");

-- CreateIndex
CREATE INDEX "ai_tasks_agent_id_idx" ON "ai_tasks"("agent_id");

-- CreateIndex
CREATE INDEX "ai_tasks_type_idx" ON "ai_tasks"("type");

-- CreateIndex
CREATE INDEX "ai_tasks_status_idx" ON "ai_tasks"("status");

-- CreateIndex
CREATE INDEX "ai_tasks_created_at_idx" ON "ai_tasks"("created_at");

-- CreateIndex
CREATE INDEX "document_embeddings_tenant_id_idx" ON "document_embeddings"("tenant_id");

-- CreateIndex
CREATE INDEX "document_embeddings_document_id_idx" ON "document_embeddings"("document_id");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_idx" ON "notifications"("tenant_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_channel_idx" ON "notifications"("channel");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notification_templates_tenant_id_idx" ON "notification_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "notification_templates_type_idx" ON "notification_templates"("type");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_tenant_id_name_key" ON "notification_templates"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "system_settings_tenant_id_idx" ON "system_settings"("tenant_id");

-- CreateIndex
CREATE INDEX "system_settings_key_idx" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_tenant_id_key_key" ON "system_settings"("tenant_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "user_invites_token_hash_key" ON "user_invites"("token_hash");

-- CreateIndex
CREATE INDEX "user_invites_tenant_id_idx" ON "user_invites"("tenant_id");

-- CreateIndex
CREATE INDEX "user_invites_token_hash_idx" ON "user_invites"("token_hash");

-- CreateIndex
CREATE INDEX "user_invites_status_idx" ON "user_invites"("status");

-- CreateIndex
CREATE INDEX "user_invites_expires_at_idx" ON "user_invites"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_invites_tenant_id_email_key" ON "user_invites"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "editais_tenant_id_idx" ON "editais"("tenant_id");

-- CreateIndex
CREATE INDEX "editais_fonte_external_id_idx" ON "editais"("fonte", "external_id");

-- CreateIndex
CREATE INDEX "saved_editais_tenant_id_idx" ON "saved_editais"("tenant_id");

-- CreateIndex
CREATE INDEX "saved_editais_status_idx" ON "saved_editais"("status");

-- CreateIndex
CREATE UNIQUE INDEX "saved_editais_tenant_id_edital_ref_key" ON "saved_editais"("tenant_id", "edital_ref");

-- CreateIndex
CREATE INDEX "responsaveis_beneficiary_id_idx" ON "responsaveis"("beneficiary_id");

-- CreateIndex
CREATE INDEX "beneficiarios_projetos_project_id_idx" ON "beneficiarios_projetos"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiarios_projetos_beneficiary_id_project_id_key" ON "beneficiarios_projetos"("beneficiary_id", "project_id");

-- CreateIndex
CREATE INDEX "professores_tenant_id_idx" ON "professores"("tenant_id");

-- CreateIndex
CREATE INDEX "professores_status_idx" ON "professores"("status");

-- CreateIndex
CREATE UNIQUE INDEX "professores_tenant_id_cpf_key" ON "professores"("tenant_id", "cpf");

-- CreateIndex
CREATE INDEX "professores_projetos_project_id_idx" ON "professores_projetos"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "professores_projetos_professor_id_project_id_key" ON "professores_projetos"("professor_id", "project_id");

-- CreateIndex
CREATE INDEX "historico_professores_professor_id_data_vigencia_idx" ON "historico_professores"("professor_id", "data_vigencia");

-- CreateIndex
CREATE INDEX "turmas_tenant_id_idx" ON "turmas"("tenant_id");

-- CreateIndex
CREATE INDEX "turmas_professor_id_idx" ON "turmas"("professor_id");

-- CreateIndex
CREATE INDEX "matriculas_tenant_id_idx" ON "matriculas"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "matriculas_turma_id_aluno_id_key" ON "matriculas"("turma_id", "aluno_id");

-- CreateIndex
CREATE INDEX "conecta_atividades_tenant_id_turma_id_idx" ON "conecta_atividades"("tenant_id", "turma_id");

-- CreateIndex
CREATE INDEX "entregas_atividades_tenant_id_idx" ON "entregas_atividades"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_atividades_atividade_id_matricula_id_key" ON "entregas_atividades"("atividade_id", "matricula_id");

-- CreateIndex
CREATE INDEX "presencas_tenant_id_turma_id_idx" ON "presencas"("tenant_id", "turma_id");

-- CreateIndex
CREATE UNIQUE INDEX "presencas_matricula_id_data_key" ON "presencas"("matricula_id", "data");

-- CreateIndex
CREATE INDEX "notas_desenvolvimento_tenant_id_matricula_id_idx" ON "notas_desenvolvimento"("tenant_id", "matricula_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_documents" ADD CONSTRAINT "organization_documents_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_risks" ADD CONSTRAINT "project_risks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_risks" ADD CONSTRAINT "project_risks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_indicators" ADD CONSTRAINT "project_indicators_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_opportunities" ADD CONSTRAINT "funding_opportunities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_applications" ADD CONSTRAINT "funding_applications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_applications" ADD CONSTRAINT "funding_applications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_applications" ADD CONSTRAINT "funding_applications_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "funding_opportunities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incentive_laws" ADD CONSTRAINT "incentive_laws_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emendas_parlamentares" ADD CONSTRAINT "emendas_parlamentares_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emendas_parlamentares" ADD CONSTRAINT "emendas_parlamentares_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "budget_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_statements" ADD CONSTRAINT "account_statements_reconciliation_id_fkey" FOREIGN KEY ("reconciliation_id") REFERENCES "bank_reconciliations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_statements" ADD CONSTRAINT "account_statements_matched_transaction_id_fkey" FOREIGN KEY ("matched_transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "document_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_profiles" ADD CONSTRAINT "organization_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutional_doc_categories" ADD CONSTRAINT "institutional_doc_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutional_doc_types" ADD CONSTRAINT "institutional_doc_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "institutional_doc_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutional_documents" ADD CONSTRAINT "institutional_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutional_documents" ADD CONSTRAINT "institutional_documents_doc_type_id_fkey" FOREIGN KEY ("doc_type_id") REFERENCES "institutional_doc_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutional_documents" ADD CONSTRAINT "institutional_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accountability_reports" ADD CONSTRAINT "accountability_reports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accountability_reports" ADD CONSTRAINT "accountability_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accountability_reports" ADD CONSTRAINT "accountability_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accountability_items" ADD CONSTRAINT "accountability_items_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "accountability_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accountability_items" ADD CONSTRAINT "accountability_items_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accountability_glosses" ADD CONSTRAINT "accountability_glosses_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "accountability_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accountability_glosses" ADD CONSTRAINT "accountability_glosses_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "accountability_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicator_measurements" ADD CONSTRAINT "indicator_measurements_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "indicators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicator_measurements" ADD CONSTRAINT "indicator_measurements_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_activities" ADD CONSTRAINT "beneficiary_activities_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_activities" ADD CONSTRAINT "beneficiary_activities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_enrollments" ADD CONSTRAINT "activity_enrollments_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_enrollments" ADD CONSTRAINT "activity_enrollments_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attendances" ADD CONSTRAINT "activity_attendances_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attendances" ADD CONSTRAINT "activity_attendances_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_contacts" ADD CONSTRAINT "partner_contacts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "workflow_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_started_by_fkey" FOREIGN KEY ("started_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_approvals" ADD CONSTRAINT "workflow_approvals_instance_id_fkey" FOREIGN KEY ("instance_id") REFERENCES "workflow_instances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_approvals" ADD CONSTRAINT "workflow_approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_requirements" ADD CONSTRAINT "legal_requirements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "legal_requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lgpd_consents" ADD CONSTRAINT "lgpd_consents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "ai_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tasks" ADD CONSTRAINT "ai_tasks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tasks" ADD CONSTRAINT "ai_tasks_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "ai_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_embeddings" ADD CONSTRAINT "document_embeddings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_embeddings" ADD CONSTRAINT "document_embeddings_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invites" ADD CONSTRAINT "user_invites_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editais" ADD CONSTRAINT "editais_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_editais" ADD CONSTRAINT "saved_editais_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_editais" ADD CONSTRAINT "saved_editais_edital_id_fkey" FOREIGN KEY ("edital_id") REFERENCES "editais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsaveis" ADD CONSTRAINT "responsaveis_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiarios_projetos" ADD CONSTRAINT "beneficiarios_projetos_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiarios_projetos" ADD CONSTRAINT "beneficiarios_projetos_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores" ADD CONSTRAINT "professores_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores_projetos" ADD CONSTRAINT "professores_projetos_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores_projetos" ADD CONSTRAINT "professores_projetos_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_professores" ADD CONSTRAINT "historico_professores_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "turmas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conecta_atividades" ADD CONSTRAINT "conecta_atividades_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conecta_atividades" ADD CONSTRAINT "conecta_atividades_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "turmas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_atividades" ADD CONSTRAINT "entregas_atividades_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_atividades" ADD CONSTRAINT "entregas_atividades_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "conecta_atividades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_atividades" ADD CONSTRAINT "entregas_atividades_matricula_id_fkey" FOREIGN KEY ("matricula_id") REFERENCES "matriculas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "turmas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_matricula_id_fkey" FOREIGN KEY ("matricula_id") REFERENCES "matriculas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_desenvolvimento" ADD CONSTRAINT "notas_desenvolvimento_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_desenvolvimento" ADD CONSTRAINT "notas_desenvolvimento_matricula_id_fkey" FOREIGN KEY ("matricula_id") REFERENCES "matriculas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
