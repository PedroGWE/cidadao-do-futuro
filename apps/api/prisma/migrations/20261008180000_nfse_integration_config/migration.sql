CREATE TABLE "nfse_integrations" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'FOCUS',
  "issuer_cnpj" VARCHAR(14) NOT NULL,
  "issuer_city_code" VARCHAR(7) NOT NULL,
  "environment" "FiscalEnvironment" NOT NULL DEFAULT 'HOMOLOGACAO',
  "token_encrypted" TEXT NOT NULL,
  "webhook_secret_encrypted" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "configured_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "nfse_integrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "nfse_integrations_tenant_id_key" ON "nfse_integrations"("tenant_id");
ALTER TABLE "nfse_integrations" ADD CONSTRAINT "nfse_integrations_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
