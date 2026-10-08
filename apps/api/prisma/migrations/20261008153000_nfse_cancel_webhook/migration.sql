ALTER TYPE "FiscalNoteStatus" ADD VALUE IF NOT EXISTS 'CANCELANDO' BEFORE 'CANCELADA';

ALTER TABLE "fiscal_notes"
  ADD COLUMN "cancel_requested_at" TIMESTAMP(3),
  ADD COLUMN "cancelled_at" TIMESTAMP(3),
  ADD COLUMN "cancellation_reason" TEXT,
  ADD COLUMN "webhook_received_at" TIMESTAMP(3);
