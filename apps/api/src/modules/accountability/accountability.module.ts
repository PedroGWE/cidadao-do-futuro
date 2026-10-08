import { Module } from '@nestjs/common'
import { AccountabilityController, FiscalWebhookController } from './accountability.controller'
import { AccountabilityService } from './accountability.service'
import { FiscalNotesService } from './fiscal-notes.service'
import { FocusNfseClient } from './focus-nfse.client'
import { DocumentsModule } from '../documents/documents.module'

@Module({ imports: [DocumentsModule], controllers: [AccountabilityController, FiscalWebhookController], providers: [AccountabilityService, FiscalNotesService, FocusNfseClient] })
export class AccountabilityModule {}
