CREATE TYPE "FiscalNoteStatus" AS ENUM ('RASCUNHO', 'ENVIANDO', 'PROCESSANDO', 'CONSULTA_PENDENTE', 'AUTORIZADA', 'REJEITADA', 'CANCELADA');
CREATE TYPE "FiscalEnvironment" AS ENUM ('HOMOLOGACAO', 'PRODUCAO');

CREATE TABLE "fiscal_notes" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "report_id" TEXT NOT NULL,
  "transaction_id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "environment" "FiscalEnvironment" NOT NULL DEFAULT 'HOMOLOGACAO',
  "status" "FiscalNoteStatus" NOT NULL DEFAULT 'RASCUNHO',
  "issuer_cnpj" TEXT NOT NULL,
  "issuer_city_code" TEXT NOT NULL,
  "customer_document" TEXT NOT NULL,
  "customer_name" TEXT NOT NULL,
  "customer_city_code" TEXT NOT NULL,
  "customer_zip" TEXT NOT NULL,
  "customer_street" TEXT NOT NULL,
  "customer_number" TEXT NOT NULL,
  "customer_district" TEXT NOT NULL,
  "customer_email" TEXT,
  "service_city_code" TEXT NOT NULL,
  "service_code" TEXT NOT NULL,
  "nbs_code" TEXT,
  "service_description" TEXT NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "competence_date" DATE NOT NULL,
  "simples_code" TEXT NOT NULL,
  "special_regime_code" TEXT NOT NULL,
  "iss_code" TEXT NOT NULL,
  "iss_withholding_code" TEXT NOT NULL,
  "municipal_service_code" TEXT,
  "provider_message" TEXT,
  "access_key" TEXT,
  "number" TEXT,
  "xml_path" TEXT,
  "danfse_path" TEXT,
  "xml_storage_key" TEXT,
  "pdf_storage_key" TEXT,
  "issued_at" TIMESTAMP(3),
  "created_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "fiscal_notes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fiscal_notes_reference_key" ON "fiscal_notes"("reference");
CREATE UNIQUE INDEX "fiscal_notes_tenant_id_transaction_id_key" ON "fiscal_notes"("tenant_id", "transaction_id");
CREATE INDEX "fiscal_notes_tenant_id_report_id_idx" ON "fiscal_notes"("tenant_id", "report_id");
CREATE INDEX "fiscal_notes_tenant_id_status_idx" ON "fiscal_notes"("tenant_id", "status");
ALTER TABLE "fiscal_notes" ADD CONSTRAINT "fiscal_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fiscal_notes" ADD CONSTRAINT "fiscal_notes_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "accountability_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fiscal_notes" ADD CONSTRAINT "fiscal_notes_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
