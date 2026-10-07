CREATE TYPE "TransferegovIntegrationStatus" AS ENUM ('NOT_CONFIGURED', 'READY', 'SYNCING', 'ERROR');
ALTER TYPE "ProjectType" ADD VALUE IF NOT EXISTS 'OUTROS';
CREATE TYPE "TransferegovEntityType" AS ENUM ('PROPOSTA', 'INSTRUMENTO');
CREATE TYPE "TransferegovSyncStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');

CREATE TABLE "transferegov_integrations" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "cnpj" VARCHAR(14) NOT NULL,
  "automatic_sync" BOOLEAN NOT NULL DEFAULT false,
  "sync_interval_hours" INTEGER NOT NULL DEFAULT 24,
  "status" "TransferegovIntegrationStatus" NOT NULL DEFAULT 'READY',
  "last_attempt_at" TIMESTAMP(3),
  "last_success_at" TIMESTAMP(3),
  "next_sync_at" TIMESTAMP(3),
  "last_error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "transferegov_integrations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transferegov_records" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "project_id" TEXT,
  "source" TEXT NOT NULL DEFAULT 'TRANSFEREGOV_PUBLIC_API',
  "source_module" TEXT NOT NULL DEFAULT 'GESTAO_PARCERIAS',
  "entity_type" "TransferegovEntityType" NOT NULL,
  "external_id" TEXT NOT NULL,
  "proposal_external_id" TEXT,
  "program_external_id" TEXT,
  "proposal_number" TEXT,
  "proposal_year" INTEGER,
  "instrument_number" TEXT,
  "instrument_type" TEXT,
  "title" TEXT,
  "proponent_name" TEXT,
  "proponent_cnpj" VARCHAR(14),
  "grantor_name" TEXT,
  "program_name" TEXT,
  "official_status" TEXT,
  "transfer_amount" DECIMAL(18,2),
  "counterpart_amount" DECIMAL(18,2),
  "global_amount" DECIMAL(18,2),
  "signed_at" TIMESTAMP(3),
  "valid_from" TIMESTAMP(3),
  "valid_until" TIMESTAMP(3),
  "official_url" TEXT,
  "source_reference_at" TIMESTAMP(3),
  "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_success_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "content_hash" TEXT NOT NULL,
  "raw_data" JSONB NOT NULL,
  "imported_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "transferegov_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transferegov_sync_runs" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "integration_id" TEXT NOT NULL,
  "trigger" TEXT NOT NULL,
  "status" "TransferegovSyncStatus" NOT NULL DEFAULT 'PENDING',
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "source_reference_at" TIMESTAMP(3),
  "consulted" INTEGER NOT NULL DEFAULT 0,
  "created_count" INTEGER NOT NULL DEFAULT 0,
  "updated_count" INTEGER NOT NULL DEFAULT 0,
  "ignored_count" INTEGER NOT NULL DEFAULT 0,
  "rejected_count" INTEGER NOT NULL DEFAULT 0,
  "error_message" TEXT,
  "cursor" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "transferegov_sync_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transferegov_changes" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "record_id" TEXT NOT NULL,
  "field_name" TEXT NOT NULL,
  "old_value" JSONB,
  "new_value" JSONB,
  "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "transferegov_changes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "transferegov_integrations_tenant_id_key" ON "transferegov_integrations"("tenant_id");
CREATE INDEX "transferegov_integrations_automatic_sync_next_sync_at_idx" ON "transferegov_integrations"("automatic_sync", "next_sync_at");
CREATE UNIQUE INDEX "transferegov_records_identity_key" ON "transferegov_records"("tenant_id", "source", "source_module", "entity_type", "external_id");
CREATE INDEX "transferegov_records_tenant_type_status_idx" ON "transferegov_records"("tenant_id", "entity_type", "official_status");
CREATE INDEX "transferegov_records_tenant_proposal_idx" ON "transferegov_records"("tenant_id", "proposal_external_id");
CREATE INDEX "transferegov_records_project_id_idx" ON "transferegov_records"("project_id");
CREATE INDEX "transferegov_sync_runs_tenant_created_at_idx" ON "transferegov_sync_runs"("tenant_id", "created_at");
CREATE INDEX "transferegov_sync_runs_integration_status_idx" ON "transferegov_sync_runs"("integration_id", "status");
CREATE INDEX "transferegov_changes_tenant_detected_at_idx" ON "transferegov_changes"("tenant_id", "detected_at");
CREATE INDEX "transferegov_changes_record_id_idx" ON "transferegov_changes"("record_id");

ALTER TABLE "transferegov_integrations" ADD CONSTRAINT "transferegov_integrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transferegov_records" ADD CONSTRAINT "transferegov_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transferegov_records" ADD CONSTRAINT "transferegov_records_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transferegov_sync_runs" ADD CONSTRAINT "transferegov_sync_runs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transferegov_sync_runs" ADD CONSTRAINT "transferegov_sync_runs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "transferegov_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transferegov_changes" ADD CONSTRAINT "transferegov_changes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transferegov_changes" ADD CONSTRAINT "transferegov_changes_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "transferegov_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
