# Inventario do Banco de Dados - cidadao-do-futuro

> Auditoria gerada em: 2026-07-11T09:08-03:00
> Fonte da verdade: apps/api/prisma/schema.prisma (schema.prisma:2645 linhas)
> Metodologia: parse estatico do schema + verificacao de existencia do diretorio prisma/migrations/ e historico git
> Limitacao: nao foi possivel conectar ao banco de dados real para inspecionar migrations aplicadas em _prisma_migrations

## 1. Tabela de Models (78 models)

| # | Model | Campos Principais (escalares/enums) | tenantId -> FK | Relacoes (campo->model) | Indices @@index | Unicidades @@unique |
|---|---|---|---|---|---|---|
| 1 | Tenant | id:String, slug:String, name:String, type:TenantType, plan:TenantPlan, status:TenantStatus, settings:Json, logo_url:String?, cnpj:String?, created_at:DateTime, updated_at:DateTime, deleted_at:DateTime? | — | — | slug; cnpj; status; deleted_at | — |
| 2 | User | id:String, tenant_id:String, email:String, password_hash:String, name:String, phone:String?, avatar_url:String?, status:UserStatus, email_verified_at:DateTime?, last_login_at:DateTime?, created_at:DateTime, updated_at:DateTime, deleted_at:DateTime? | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; email; status; deleted_at | tenant_id, email |
| 3 | Role | id:String, tenant_id:String, name:String, description:String?, is_system:Boolean, permissions:Json, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id | tenant_id, name |
| 4 | UserRole | user_id:String, role_id:String, granted_by:String?, granted_at:DateTime, expires_at:DateTime? | — | user->User, role->Role, granted_by_user?->User | user_id; role_id; granted_by; expires_at | — |
| 5 | Permission | id:String, resource:String, action:String, description:String? | — | — | resource | resource, action |
| 6 | RefreshToken | id:String, user_id:String, token_hash:String, expires_at:DateTime, revoked_at:DateTime?, user_agent:String?, ip_address:String?, created_at:DateTime | — | user->User | user_id; token_hash; expires_at | — |
| 7 | AuditLog | id:String, tenant_id:String, user_id:String?, action:String, resource:String, resource_id:String?, old_value:Json?, new_value:Json?, ip_address:String?, user_agent:String?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, user?->User | tenant_id; user_id; resource, resource_id; action; created_at | — |
| 8 | Organization | id:String, tenant_id:String, legal_name:String, trade_name:String?, cnpj:String?, type:TenantType, founded_at:DateTime?, mission:String?, vision:String?, values:String?, address:Json?, social_links:Json?, bank_accounts:Json?, certificates:Json?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; cnpj | — |
| 9 | OrganizationDocument | id:String, org_id:String, type:String, name:String, file_url:String, issued_at:DateTime?, expires_at:DateTime?, status:OrganizationDocumentStatus, created_at:DateTime | — | organization->Organization | org_id; status; expires_at | — |
| 10 | Project | id:String, tenant_id:String, code:String?, name:String, description:String?, type:ProjectType, status:ProjectStatus, start_date:DateTime?, end_date:DateTime?, total_budget:Decimal?, approved_budget:Decimal?, funding_sources:Json?, tags:String[], manager_id:String?, created_by:String?, created_at:DateTime, updated_at:DateTime, deleted_at:DateTime? | tenant_id -> Tenant.id (FK) | tenant->Tenant, manager?->User, creator?->User | tenant_id; status; type; manager_id; deleted_at | tenant_id, code |
| 11 | ProjectMember | id:String, project_id:String, user_id:String, role:ProjectMemberRole, start_date:DateTime?, end_date:DateTime?, created_at:DateTime | — | project->Project, user->User | project_id; user_id | project_id, user_id |
| 12 | ProjectPhase | id:String, project_id:String, name:String, description:String?, order:Int, start_date:DateTime?, end_date:DateTime?, status:PhaseStatus, created_at:DateTime | — | project->Project | project_id; status | — |
| 13 | ProjectTask | id:String, project_id:String, phase_id:String?, title:String, description:String?, assigned_to:String?, due_date:DateTime?, status:TaskStatus, priority:TaskPriority, attachments:Json?, created_at:DateTime, updated_at:DateTime | — | project->Project, phase?->ProjectPhase, assignee?->User | project_id; phase_id; assigned_to; status; priority; due_date | — |
| 14 | ProjectRisk | id:String, project_id:String, title:String, description:String?, category:String?, probability:RiskLevel, impact:RiskLevel, mitigation:String?, status:RiskStatus, owner_id:String?, created_at:DateTime, updated_at:DateTime | — | project->Project, owner?->User | project_id; owner_id; status | — |
| 15 | ProjectIndicator | id:String, project_id:String, name:String, description:String?, unit:String?, baseline:Decimal?, target:Decimal?, current_value:Decimal?, frequency:MeasurementFrequency?, last_updated:DateTime?, created_at:DateTime | — | project->Project | project_id | — |
| 16 | FundingOpportunity | id:String, tenant_id:String, title:String, description:String?, type:FundingOpportunityType, source_name:String?, source_url:String?, total_amount:Decimal?, min_amount:Decimal?, max_amount:Decimal?, opens_at:DateTime?, closes_at:DateTime?, status:FundingOpportunityStatus, requirements:Json?, areas:String[], tags:String[], created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; type; status; closes_at | — |
| 17 | FundingApplication | id:String, tenant_id:String, project_id:String?, opportunity_id:String?, title:String, status:FundingApplicationStatus, submitted_at:DateTime?, result_at:DateTime?, approved_amount:Decimal?, notes:String?, documents:Json?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, project?->Project, opportunity?->FundingOpportunity | tenant_id; project_id; opportunity_id; status | — |
| 18 | IncentiveLaw | id:String, tenant_id:String, name:String, type:IncentiveLawType, description:String?, fiscal_benefit_pct:Decimal?, max_amount:Decimal?, min_amount:Decimal?, eligible_areas:String[], requirements:Json?, valid_from:DateTime?, valid_until:DateTime?, status:String?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; type; status | — |
| 19 | Convenio | id:String, tenant_id:String, project_id:String?, number:String?, concedente:String, interveniente:String?, object:String, total_value:Decimal, counterpart_value:Decimal?, start_date:DateTime?, end_date:DateTime?, status:ConvenioStatus, siconv_id:String?, bank_account:Json?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, project?->Project | tenant_id; project_id; status; number | — |
| 20 | EmendaParlamentar | id:String, tenant_id:String, project_id:String?, number:String?, year:Int, parlamentar_name:String, parlamentar_party:String?, type:EmendaType, value:Decimal, status:EmendaStatus, object:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, project?->Project | tenant_id; project_id; status; year | — |
| 21 | Budget | id:String, tenant_id:String, project_id:String?, funding_source_id:String?, fiscal_year:Int, total_amount:Decimal, allocated:Decimal, committed:Decimal, spent:Decimal, balance:Decimal, status:BudgetStatus, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, project?->Project | tenant_id; project_id; fiscal_year; status | — |
| 22 | BudgetCategory | id:String, budget_id:String, name:String, code:String?, planned_amount:Decimal, committed_amount:Decimal, spent_amount:Decimal, created_at:DateTime | — | budget->Budget | budget_id | — |
| 23 | BudgetItem | id:String, category_id:String, description:String, quantity:Decimal, unit:String?, unit_value:Decimal, total_value:Decimal, spent_value:Decimal, created_at:DateTime, updated_at:DateTime | — | category->BudgetCategory | category_id | — |
| 24 | CostCenter | id:String, tenant_id:String, code:String?, name:String, description:String?, parent_id:String?, type:String?, project_id:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, parent?->CostCenter, project?->Project | tenant_id; parent_id; project_id | tenant_id, code |
| 25 | Transaction | id:String, tenant_id:String, project_id:String?, cost_center_id:String?, type:TransactionType, status:TransactionStatus, description:String, amount:Decimal, date:DateTime, due_date:DateTime?, paid_at:DateTime?, payment_method:String?, reference_number:String?, category:String?, tags:String[], attachments:Json?, created_by:String?, approved_by:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, project?->Project, cost_center?->CostCenter, creator?->User, approver?->User | tenant_id; project_id; cost_center_id; type; status; date; created_by | — |
| 26 | PaymentOrder | id:String, tenant_id:String, transaction_id:String?, supplier_name:String, supplier_cnpj_cpf:String?, amount:Decimal, due_date:DateTime, status:String, bank_data:Json?, approved_by:String?, paid_at:DateTime?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, transaction?->Transaction, approver?->User | tenant_id; transaction_id; status; due_date | — |
| 27 | Invoice | id:String, tenant_id:String, transaction_id:String?, number:String?, supplier_name:String, supplier_cnpj:String?, issue_date:DateTime, amount:Decimal, tax_amount:Decimal?, net_amount:Decimal?, file_url:String?, status:InvoiceStatus, validated_by:String?, notes:String?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, transaction?->Transaction, validator?->User | tenant_id; transaction_id; status; issue_date | — |
| 28 | BankReconciliation | id:String, tenant_id:String, account_id:String, period_start:DateTime, period_end:DateTime, opening_balance:Decimal, closing_balance:Decimal, status:String, reconciled_by:String?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; account_id; period_start, period_end; status | — |
| 29 | AccountStatement | id:String, reconciliation_id:String, date:DateTime, description:String, amount:Decimal, type:String, matched_transaction_id:String?, created_at:DateTime | — | reconciliation->BankReconciliation, matched_transaction?->Transaction | reconciliation_id; matched_transaction_id; date | — |
| 30 | Document | id:String, tenant_id:String, project_id:String?, name:String, description:String?, type:DocumentType, status:DocumentStatus, file_url:String?, file_size:BigInt?, mime_type:String?, version:Int, parent_id:String?, tags:String[], metadata:Json?, created_by:String?, created_at:DateTime, updated_at:DateTime, deleted_at:DateTime? | tenant_id -> Tenant.id (FK) | tenant->Tenant, project?->Project, creator?->User, parent?->Document | tenant_id; project_id; type; status; parent_id; deleted_at | — |
| 31 | DocumentVersion | id:String, document_id:String, version:Int, file_url:String, changes_description:String?, created_by:String?, created_at:DateTime | — | document->Document, creator?->User | document_id; created_by | — |
| 32 | DocumentSignature | id:String, document_id:String, signer_name:String, signer_email:String, signer_cpf:String?, role:String?, status:SignatureStatus, signed_at:DateTime?, ip_address:String?, certificate:Json?, created_at:DateTime | — | document->Document | document_id; status; signer_email | — |
| 33 | DocumentFolder | id:String, tenant_id:String, name:String, parent_id:String?, project_id:String?, description:String?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, parent?->DocumentFolder, project?->Project | tenant_id; parent_id; project_id | — |
| 34 | OrganizationProfile | id:String, tenant_id:String, nome_organizacao:String, tipo_organizacao:OrgProfileType?, tipo_documento:ProfileDocType?, documento:String?, abrangencia:OrgAbrangencia?, areas_atuacao:String[], municipio:String?, uf:String?, telefone:String?, email:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id | — |
| 35 | Edital | id:String, tenant_id:String?, fonte:EditalFonte, external_id:String?, titulo:String, orgao:String?, descricao:String?, valor_total:Decimal?, data_abertura:DateTime?, data_encerramento:DateTime?, abrangencia:OrgAbrangencia?, uf:String?, area_tematica:String?, link_oficial:String?, requisitos_documentais:String[], created_by:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant?->Tenant | tenant_id; fonte, external_id; uf; data_encerramento | — |
| 36 | SavedEdital | id:String, tenant_id:String, edital_ref:String, fonte:EditalFonte, external_id:String?, edital_id:String?, titulo:String, orgao:String?, data_encerramento:DateTime?, status:SavedEditalStatus, notas:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, edital?->Edital | tenant_id; status; data_encerramento | tenant_id, edital_ref |
| 37 | InstitutionalDocCategory | id:String, tenant_id:String, name:String, order:Int, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id | tenant_id, name |
| 38 | InstitutionalDocType | id:String, category_id:String, name:String, required:Boolean, default_validity_days:Int?, created_at:DateTime | — | category->InstitutionalDocCategory | category_id | category_id, name |
| 39 | InstitutionalDocument | id:String, tenant_id:String, doc_type_id:String, file_url:String, file_name:String, mime_type:String, size_bytes:Int, sent_at:DateTime, valid_until:DateTime?, status:OrganizationDocumentStatus, uploaded_by:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, doc_type->InstitutionalDocType, uploader?->User | tenant_id; status; valid_until | tenant_id, doc_type_id |
| 40 | AccountabilityReport | id:String, tenant_id:String, project_id:String?, funding_source_id:String?, title:String, period_start:DateTime, period_end:DateTime, type:AccountabilityReportType, status:AccountabilityReportStatus, total_received:Decimal?, total_spent:Decimal?, balance:Decimal?, submitted_at:DateTime?, approved_at:DateTime?, notes:String?, created_by:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, project?->Project, creator?->User | tenant_id; project_id; type; status; period_start, period_end | — |
| 41 | AccountabilityItem | id:String, report_id:String, transaction_id:String?, description:String, amount:Decimal, category:String?, document_ids:String[], notes:String?, status:String?, created_at:DateTime | — | report->AccountabilityReport, transaction?->Transaction | report_id; transaction_id | — |
| 42 | AccountabilityGloss | id:String, report_id:String, item_id:String?, amount:Decimal, reason:String, response:String?, status:GlossStatus, created_at:DateTime | — | report->AccountabilityReport, item?->AccountabilityItem | report_id; item_id; status | — |
| 43 | Indicator | id:String, tenant_id:String, project_id:String?, name:String, description:String?, code:String?, type:IndicatorType, unit:String?, calculation_method:String?, data_source:String?, frequency:MeasurementFrequency, baseline:Decimal?, target:Decimal?, created_by:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, project?->Project, creator?->User | tenant_id; project_id; type | tenant_id, code |
| 44 | IndicatorMeasurement | id:String, indicator_id:String, value:Decimal, date:DateTime, notes:String?, evidence_url:String?, verified_by:String?, created_at:DateTime | — | indicator->Indicator, verifier?->User | indicator_id; date; verified_by | — |
| 45 | Beneficiary | id:String, tenant_id:String, project_id:String?, name:String, cpf:String?, birth_date:DateTime?, gender:Gender?, race:Race?, social_vulnerability:Json?, address:Json?, contact:Json?, status:BeneficiaryStatus, enrollment_date:DateTime?, exit_date:DateTime?, exit_reason:String?, telefone:String?, email:String?, foto_url:String?, rg_certidao:String?, cep:String?, logradouro:String?, numero:String?, complemento:String?, bairro:String?, cidade:String?, uf_endereco:String?, turma:String?, turno:String?, escola:String?, serie_ano:String?, renda_familiar:Decimal?, pessoas_residencia:Int?, necessidades_especiais:String?, alergias:String?, medicamentos:String?, observacoes_gerais:String?, termo_consentimento:Boolean, data_consentimento:DateTime?, autorizacao_uso_imagem:Boolean, documento_consentimento_url:String?, created_by:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, project?->Project | tenant_id; project_id; status; cpf | tenant_id, cpf |
| 46 | BeneficiaryActivity | id:String, beneficiary_id:String, activity_id:String, attended_at:DateTime, notes:String?, created_at:DateTime | — | beneficiary->Beneficiary, activity->Activity | beneficiary_id; activity_id | — |
| 47 | Activity | id:String, tenant_id:String, project_id:String?, title:String, description:String?, type:ActivityType, status:ActivityStatus, start_at:DateTime, end_at:DateTime?, location:Json?, capacity:Int?, enrolled_count:Int, responsible_id:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, project?->Project, responsible?->User | tenant_id; project_id; type; status; start_at; responsible_id | — |
| 48 | ActivityEnrollment | id:String, activity_id:String, beneficiary_id:String, status:EnrollmentStatus, enrolled_at:DateTime, created_at:DateTime | — | activity->Activity, beneficiary->Beneficiary | activity_id; beneficiary_id; status | activity_id, beneficiary_id |
| 49 | ActivityAttendance | id:String, activity_id:String, beneficiary_id:String, attended_at:DateTime, notes:String?, created_at:DateTime | — | activity->Activity, beneficiary->Beneficiary | activity_id; beneficiary_id | activity_id, beneficiary_id |
| 50 | Partner | id:String, tenant_id:String, name:String, type:PartnerType, cnpj_cpf:String?, email:String?, phone:String?, website:String?, address:Json?, status:PartnerStatus, tags:String[], notes:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; type; status; cnpj_cpf | — |
| 51 | PartnerContact | id:String, partner_id:String, name:String, role:String?, email:String?, phone:String?, is_primary:Boolean, created_at:DateTime | — | partner->Partner | partner_id | — |
| 52 | Partnership | id:String, tenant_id:String, partner_id:String, project_id:String?, type:PartnershipType, value:Decimal?, in_kind_value:Decimal?, description:String?, start_date:DateTime?, end_date:DateTime?, status:PartnershipStatus, contract_url:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, partner->Partner, project?->Project | tenant_id; partner_id; project_id; type; status | — |
| 53 | Sponsor | id:String, tenant_id:String, partner_id:String?, name:String, logo_url:String?, website:String?, tier:SponsorTier, investment_amount:Decimal?, benefits:Json?, start_date:DateTime?, end_date:DateTime?, status:SponsorStatus, project_ids:String[], created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, partner?->Partner | tenant_id; partner_id; tier; status | — |
| 54 | WorkflowTemplate | id:String, tenant_id:String, name:String, description:String?, type:String, steps:Json, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; type | tenant_id, name |
| 55 | WorkflowInstance | id:String, template_id:String?, tenant_id:String, resource_type:String, resource_id:String, status:WorkflowStatus, current_step:Int, started_by:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, template?->WorkflowTemplate, starter?->User | tenant_id; template_id; resource_type, resource_id; status | — |
| 56 | WorkflowApproval | id:String, instance_id:String, step:Int, approver_id:String?, status:ApprovalStatus, notes:String?, decided_at:DateTime?, created_at:DateTime | — | instance->WorkflowInstance, approver?->User | instance_id; approver_id; status | — |
| 57 | LegalRequirement | id:String, tenant_id:String, name:String, description:String?, law_reference:String?, type:String?, applicable_to:String[], due_date_rule:String?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; type | — |
| 58 | ComplianceCheck | id:String, tenant_id:String, requirement_id:String?, project_id:String?, status:ComplianceStatus, evidence_url:String?, notes:String?, checked_by:String?, checked_at:DateTime?, next_check_at:DateTime?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, requirement?->LegalRequirement, project?->Project, checker?->User | tenant_id; requirement_id; project_id; status; next_check_at | — |
| 59 | LGPDConsent | id:String, tenant_id:String, data_subject_id:String, data_subject_type:String, purpose:String, status:LGPDConsentStatus, consented_at:DateTime, revoked_at:DateTime?, ip_address:String?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; data_subject_id, data_subject_type; status | — |
| 60 | Responsavel | id:String, beneficiary_id:String, nome_completo:String, parentesco:ParentescoType, cpf:String?, telefone:String?, email:String?, endereco:Json?, created_at:DateTime, updated_at:DateTime | — | beneficiary->Beneficiary | beneficiary_id | — |
| 61 | BeneficiarioProjeto | id:String, beneficiary_id:String, project_id:String, data_ingresso:DateTime, data_desligamento:DateTime?, status:VinculoStatus, turma:String?, turno:String?, created_at:DateTime, updated_at:DateTime | — | beneficiary->Beneficiary, project->Project | beneficiary_id; project_id; status | beneficiary_id, project_id |
| 62 | Professor | id:String, tenant_id:String, nome_completo:String, cpf:String, rg:String?, data_nascimento:DateTime?, telefone:String?, email:String?, foto_url:String?, cep:String?, logradouro:String?, numero:String?, complemento:String?, bairro:String?, cidade:String?, uf:String?, formacao_academica:String?, especializacao:String?, disciplinas:String[], tipo_vinculo:TipoVinculo, forma_pagamento:FormaPagamento?, dados_bancarios:Json?, dia_pagamento:Int?, comprovante_formacao_url:String?, certificados_urls:String[], contrato_url:String?, status:ProfessorStatus, data_admissao:DateTime?, data_desligamento:DateTime?, observacoes:String?, created_by:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; status; cpf | tenant_id, cpf |
| 63 | ProfessorProjeto | id:String, professor_id:String, project_id:String, data_inicio:DateTime, data_fim:DateTime?, status:ProfessorStatus, carga_horaria_semanal:Int?, dias_horarios:Json?, created_at:DateTime, updated_at:DateTime | — | professor->Professor, project->Project | professor_id; project_id; status | professor_id, project_id |
| 64 | HistoricoProfessor | id:String, professor_id:String, valor_hora_aula:Decimal?, valor_mensal:Decimal?, data_vigencia:DateTime, motivo:String?, created_by:String?, created_at:DateTime | — | professor->Professor | professor_id; data_vigencia | — |
| 65 | Turma | id:String, tenant_id:String, nome:String, descricao:String?, projeto_id:String?, professor_id:String?, horario:String?, status:TaskStatus, created_at:DateTime, updated_at:DateTime, deleted_at:DateTime? | tenant_id -> Tenant.id (FK) | tenant->Tenant, projeto?->Project, professor?->User | tenant_id; projeto_id; professor_id; status; deleted_at | — |
| 66 | Matricula | id:String, tenant_id:String, turma_id:String, aluno_id:String, status:ConectaMatriculaStatus, data_matricula:DateTime, data_conclusao:DateTime?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, turma->Turma, aluno->Beneficiary | tenant_id; turma_id; aluno_id; status | turma_id, aluno_id |
| 67 | Atividade | id:String, tenant_id:String, turma_id:String, projeto_id:String?, titulo:String, enunciado:String?, prazo:DateTime?, status:ConectaAtividadeStatus, created_by:String?, created_at:DateTime, updated_at:DateTime, deleted_at:DateTime? | tenant_id -> Tenant.id (FK) | tenant->Tenant, turma->Turma, projeto?->Project, criador?->User | tenant_id; turma_id; status; deleted_at | — |
| 68 | EntregaAtividade | id:String, tenant_id:String, atividade_id:String, matricula_id:String, resposta:String?, anexo_url:String?, status:ConectaEntregaStatus, nota:Decimal?, feedback:String?, entregue_em:DateTime?, avaliado_em:DateTime?, avaliado_por:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, atividade->Atividade, matricula->Matricula, avaliador?->User | tenant_id; atividade_id; matricula_id; status | atividade_id, matricula_id |
| 69 | Presenca | id:String, tenant_id:String, turma_id:String, matricula_id:String, data:DateTime, presente:Boolean, anotacao:String?, registrado_por:String?, registrado_em:DateTime, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, turma->Turma, matricula->Matricula, registrador?->User | tenant_id; turma_id; matricula_id; data | turma_id, matricula_id, data |
| 70 | NotaDesenvolvimento | id:String, tenant_id:String, matricula_id:String, categoria:String, descricao:String?, nota:Decimal?, data:DateTime, avaliado_por:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, matricula->Matricula, avaliador?->User | tenant_id; matricula_id; data | — |
| 71 | AIAgent | id:String, tenant_id:String, type:AIAgentType, name:String, status:AIAgentStatus, config:Json, model:String?, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; type; status | — |
| 72 | AIConversation | id:String, tenant_id:String, user_id:String?, agent_id:String?, context_type:String?, context_id:String?, messages:Json, tokens_used:Int, created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, user?->User, agent?->AIAgent | tenant_id; user_id; agent_id; context_type, context_id | — |
| 73 | AITask | id:String, tenant_id:String, agent_id:String?, type:String, status:AITaskStatus, input:Json?, output:Json?, tokens_used:Int, error:String?, started_at:DateTime?, completed_at:DateTime?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, agent?->AIAgent | tenant_id; agent_id; type; status; created_at | — |
| 74 | DocumentEmbedding | id:String, tenant_id:String, document_id:String?, chunk_index:Int, content:String, embedding:Unsupported("vector(1536)")?, metadata:Json?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, document?->Document | tenant_id; document_id | — |
| 75 | Notification | id:String, tenant_id:String, user_id:String?, type:String, title:String, body:String, data:Json?, channel:NotificationChannel, status:NotificationStatus, sent_at:DateTime?, read_at:DateTime?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, user?->User | tenant_id; user_id; type; channel; status; created_at | — |
| 76 | NotificationTemplate | id:String, tenant_id:String, name:String, type:String, subject:String?, body_template:String, channels:String[], created_at:DateTime, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant | tenant_id; type | tenant_id, name |
| 77 | SystemSetting | id:String, tenant_id:String, key:String, value:Json, description:String?, updated_by:String?, updated_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, updater?->User | tenant_id; key | tenant_id, key |
| 78 | UserInvite | id:String, tenant_id:String, email:String, role_id:String?, status:InviteStatus, token_hash:String, invited_by:String?, expires_at:DateTime, accepted_at:DateTime?, created_at:DateTime | tenant_id -> Tenant.id (FK) | tenant->Tenant, role?->Role, inviter?->User | tenant_id; token_hash; status; expires_at | tenant_id, email |

## 2. Campos de Dados Pessoais/Sensiveis

| Model | Campo | Tipo | Classificacao LGPD | Evidencia schema.prisma |
|---|---|---|---|---|
| Tenant | name | String | Razao/nome social organizacional | apps/api/prisma/schema.prisma:505 |
| Tenant | cnpj | String? | CNPJ da organizacao | apps/api/prisma/schema.prisma:511 |
| User | email | String | E-mail pessoal | apps/api/prisma/schema.prisma:578 |
| User | password_hash | String | Credencial (hash senha) | apps/api/prisma/schema.prisma:579 |
| User | name | String | Nome pessoal | apps/api/prisma/schema.prisma:580 |
| User | phone | String? | Telefone pessoal | apps/api/prisma/schema.prisma:581 |
| User | avatar_url | String? | Imagem/biometria facial | apps/api/prisma/schema.prisma:582 |
| Organization | legal_name | String | Razao social | apps/api/prisma/schema.prisma:734 |
| Organization | trade_name | String? | Nome fantasia | apps/api/prisma/schema.prisma:735 |
| Organization | cnpj | String? | CNPJ | apps/api/prisma/schema.prisma:736 |
| Organization | address | Json? | Endereco da sede | apps/api/prisma/schema.prisma:742 |
| Organization | bank_accounts | Json? | Dados bancarios organizacionais | apps/api/prisma/schema.prisma:744 |
| OrganizationProfile | nome_organizacao | String | Nome da organizacao | apps/api/prisma/schema.prisma:1438 |
| OrganizationProfile | documento | String? | CPF/CNPJ do responsavel/organizacao | apps/api/prisma/schema.prisma:1441 |
| OrganizationProfile | telefone | String? | Telefone | apps/api/prisma/schema.prisma:1446 |
| OrganizationProfile | email | String? | E-mail | apps/api/prisma/schema.prisma:1447 |
| RefreshToken | token_hash | String | Token de refresh | apps/api/prisma/schema.prisma:686 |
| RefreshToken | user_agent | String? | User agent | apps/api/prisma/schema.prisma:689 |
| RefreshToken | ip_address | String? | Endereco IP | apps/api/prisma/schema.prisma:690 |
| AuditLog | ip_address | String? | Endereco IP | apps/api/prisma/schema.prisma:711 |
| AuditLog | user_agent | String? | User agent | apps/api/prisma/schema.prisma:712 |
| AuditLog | old_value | Json? | Dados historicos (possivelmente PII) | apps/api/prisma/schema.prisma:709 |
| AuditLog | new_value | Json? | Dados historicos (possivelmente PII) | apps/api/prisma/schema.prisma:710 |
| PaymentOrder | supplier_name | String | Nome do fornecedor | apps/api/prisma/schema.prisma:1233 |
| PaymentOrder | supplier_cnpj_cpf | String? | CPF/CNPJ do fornecedor | apps/api/prisma/schema.prisma:1234 |
| PaymentOrder | bank_data | Json? | Dados bancarios do fornecedor | apps/api/prisma/schema.prisma:1238 |
| Invoice | supplier_name | String | Nome do fornecedor | apps/api/prisma/schema.prisma:1260 |
| Invoice | supplier_cnpj | String? | CNPJ do fornecedor | apps/api/prisma/schema.prisma:1261 |
| DocumentSignature | signer_name | String | Nome do signatario | apps/api/prisma/schema.prisma:1391 |
| DocumentSignature | signer_email | String | E-mail do signatario | apps/api/prisma/schema.prisma:1392 |
| DocumentSignature | signer_cpf | String? | CPF do signatario | apps/api/prisma/schema.prisma:1393 |
| DocumentSignature | ip_address | String? | Endereco IP | apps/api/prisma/schema.prisma:1397 |
| DocumentSignature | certificate | Json? | Certificado digital | apps/api/prisma/schema.prisma:1398 |
| Partner | name | String | Nome do parceiro | apps/api/prisma/schema.prisma:1895 |
| Partner | cnpj_cpf | String? | CPF/CNPJ | apps/api/prisma/schema.prisma:1897 |
| Partner | email | String? | E-mail | apps/api/prisma/schema.prisma:1898 |
| Partner | phone | String? | Telefone | apps/api/prisma/schema.prisma:1899 |
| Partner | address | Json? | Endereco | apps/api/prisma/schema.prisma:1901 |
| PartnerContact | name | String | Nome do contato | apps/api/prisma/schema.prisma:1924 |
| PartnerContact | email | String? | E-mail | apps/api/prisma/schema.prisma:1926 |
| PartnerContact | phone | String? | Telefone | apps/api/prisma/schema.prisma:1927 |
| Convenio | bank_account | Json? | Dados bancarios do convenio | apps/api/prisma/schema.prisma:1051 |
| EmendaParlamentar | parlamentar_name | String | Nome do parlamentar | apps/api/prisma/schema.prisma:1072 |
| EmendaParlamentar | parlamentar_party | String? | Partido | apps/api/prisma/schema.prisma:1073 |
| Beneficiary | name | String | Nome do beneficiario | apps/api/prisma/schema.prisma:1723 |
| Beneficiary | cpf | String? | CPF | apps/api/prisma/schema.prisma:1724 |
| Beneficiary | birth_date | DateTime? | Data de nascimento | apps/api/prisma/schema.prisma:1725 |
| Beneficiary | gender | Gender? | Genero | apps/api/prisma/schema.prisma:1726 |
| Beneficiary | race | Race? | Raca/cor | apps/api/prisma/schema.prisma:1727 |
| Beneficiary | social_vulnerability | Json? | Vulnerabilidade social | apps/api/prisma/schema.prisma:1728 |
| Beneficiary | address | Json? | Endereco | apps/api/prisma/schema.prisma:1729 |
| Beneficiary | contact | Json? | Contato | apps/api/prisma/schema.prisma:1730 |
| Beneficiary | telefone | String? | Telefone | apps/api/prisma/schema.prisma:1737 |
| Beneficiary | email | String? | E-mail | apps/api/prisma/schema.prisma:1738 |
| Beneficiary | foto_url | String? | Foto/biometria facial | apps/api/prisma/schema.prisma:1739 |
| Beneficiary | rg_certidao | String? | RG/certidao | apps/api/prisma/schema.prisma:1740 |
| Beneficiary | cep | String? | CEP | apps/api/prisma/schema.prisma:1743 |
| Beneficiary | logradouro | String? | Logradouro | apps/api/prisma/schema.prisma:1744 |
| Beneficiary | numero | String? | Numero | apps/api/prisma/schema.prisma:1745 |
| Beneficiary | complemento | String? | Complemento | apps/api/prisma/schema.prisma:1746 |
| Beneficiary | bairro | String? | Bairro | apps/api/prisma/schema.prisma:1747 |
| Beneficiary | cidade | String? | Cidade | apps/api/prisma/schema.prisma:1748 |
| Beneficiary | uf_endereco | String? | UF endereco | apps/api/prisma/schema.prisma:1749 |
| Beneficiary | turma | String? | Turma do beneficiario (potencialmente menor) | apps/api/prisma/schema.prisma:1752 |
| Beneficiary | turno | String? | Turno escolar | apps/api/prisma/schema.prisma:1753 |
| Beneficiary | escola | String? | Escola | apps/api/prisma/schema.prisma:1756 |
| Beneficiary | serie_ano | String? | Serie/ano escolar | apps/api/prisma/schema.prisma:1757 |
| Beneficiary | renda_familiar | Decimal? | Renda familiar | apps/api/prisma/schema.prisma:1758 |
| Beneficiary | pessoas_residencia | Int? | Composicao familiar | apps/api/prisma/schema.prisma:1759 |
| Beneficiary | necessidades_especiais | String? | Necessidades especiais/saude | apps/api/prisma/schema.prisma:1762 |
| Beneficiary | alergias | String? | Alergias/saude | apps/api/prisma/schema.prisma:1763 |
| Beneficiary | medicamentos | String? | Medicamentos/saude | apps/api/prisma/schema.prisma:1764 |
| Beneficiary | observacoes_gerais | String? | Observacoes gerais (possivelmente PII/saude) | apps/api/prisma/schema.prisma:1765 |
| Beneficiary | termo_consentimento | Boolean | Consentimento LGPD | apps/api/prisma/schema.prisma:1768 |
| Beneficiary | data_consentimento | DateTime? | Data do consentimento | apps/api/prisma/schema.prisma:1769 |
| Beneficiary | autorizacao_uso_imagem | Boolean | Autorizacao uso imagem | apps/api/prisma/schema.prisma:1770 |
| Beneficiary | documento_consentimento_url | String? | Documento de consentimento | apps/api/prisma/schema.prisma:1771 |
| Responsavel | nome_completo | String | Nome do responsavel legal | apps/api/prisma/schema.prisma:2143 |
| Responsavel | parentesco | ParentescoType | Parentesco | apps/api/prisma/schema.prisma:2144 |
| Responsavel | cpf | String? | CPF | apps/api/prisma/schema.prisma:2145 |
| Responsavel | telefone | String? | Telefone | apps/api/prisma/schema.prisma:2146 |
| Responsavel | email | String? | E-mail | apps/api/prisma/schema.prisma:2147 |
| Responsavel | endereco | Json? | Endereco | apps/api/prisma/schema.prisma:2148 |
| BeneficiarioProjeto | beneficiary_id | String | Vinculo com beneficiario (potencialmente menor) | apps/api/prisma/schema.prisma:2160 |
| Professor | nome_completo | String | Nome do professor | apps/api/prisma/schema.prisma:2187 |
| Professor | cpf | String | CPF | apps/api/prisma/schema.prisma:2188 |
| Professor | rg | String? | RG | apps/api/prisma/schema.prisma:2189 |
| Professor | data_nascimento | DateTime? | Data de nascimento | apps/api/prisma/schema.prisma:2190 |
| Professor | telefone | String? | Telefone | apps/api/prisma/schema.prisma:2191 |
| Professor | email | String? | E-mail | apps/api/prisma/schema.prisma:2192 |
| Professor | foto_url | String? | Foto/biometria facial | apps/api/prisma/schema.prisma:2193 |
| Professor | cep | String? | CEP | apps/api/prisma/schema.prisma:2194 |
| Professor | logradouro | String? | Logradouro | apps/api/prisma/schema.prisma:2195 |
| Professor | numero | String? | Numero | apps/api/prisma/schema.prisma:2196 |
| Professor | complemento | String? | Complemento | apps/api/prisma/schema.prisma:2197 |
| Professor | bairro | String? | Bairro | apps/api/prisma/schema.prisma:2198 |
| Professor | cidade | String? | Cidade | apps/api/prisma/schema.prisma:2199 |
| Professor | uf | String? | UF | apps/api/prisma/schema.prisma:2200 |
| Professor | dados_bancarios | Json? | Dados bancarios do professor | apps/api/prisma/schema.prisma:2206 |
| Professor | observacoes | String? | Observacoes (possivelmente PII) | apps/api/prisma/schema.prisma:2214 |
| Turma | nome | String | Nome da turma (identifica grupo de beneficiarios) | apps/api/prisma/schema.prisma:2294 |
| Matricula | aluno_id | String | Vinculo com beneficiario/aluno | apps/api/prisma/schema.prisma:2323 |
| Atividade | turma_id | String | Vinculo com turma de beneficiarios | apps/api/prisma/schema.prisma:2348 |
| EntregaAtividade | matricula_id | String | Vinculo com matricula/aluno | apps/api/prisma/schema.prisma:2376 |
| Presenca | matricula_id | String | Vinculo com matricula/aluno | apps/api/prisma/schema.prisma:2405 |
| NotaDesenvolvimento | matricula_id | String | Vinculo com matricula/aluno | apps/api/prisma/schema.prisma:2430 |
| LGPDConsent | data_subject_id | String | ID do titular | apps/api/prisma/schema.prisma:2118 |
| LGPDConsent | ip_address | String? | Endereco IP | apps/api/prisma/schema.prisma:2124 |
| UserInvite | email | String | E-mail do convidado | apps/api/prisma/schema.prisma:2625 |
| UserInvite | token_hash | String | Token de convite | apps/api/prisma/schema.prisma:2628 |
| DocumentEmbedding | content | String | Conteudo de documento (possivelmente PII) | apps/api/prisma/schema.prisma:2530 |
| AIConversation | messages | Json | Mensagens de chat (possivelmente PII) | apps/api/prisma/schema.prisma:2482 |
| Notification | title | String | Notificacao direcionada | apps/api/prisma/schema.prisma:2553 |
| Notification | body | String | Corpo da notificacao | apps/api/prisma/schema.prisma:2554 |
| Notification | data | Json? | Payload (possivelmente PII) | apps/api/prisma/schema.prisma:2555 |

## 3. Enums (67 enums)

- **TenantType**: OSC, INSTITUTO, FUNDACAO, ASSOCIACAO, EMPRESA
- **TenantPlan**: FREE, BASIC, PROFESSIONAL, ENTERPRISE
- **TenantStatus**: ACTIVE, INACTIVE, SUSPENDED, TRIAL
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED
- **ProjectType**: CULTURAL, ESPORTIVO, EDUCACIONAL, ASSISTENCIA_SOCIAL, SAUDE, AMBIENTAL
- **ProjectStatus**: RASCUNHO, CAPTACAO, APROVADO, EM_EXECUCAO, CONCLUIDO, SUSPENSO, CANCELADO
- **ProjectMemberRole**: GESTOR, COORDENADOR, COLABORADOR, VOLUNTARIO
- **PhaseStatus**: NAO_INICIADA, EM_ANDAMENTO, CONCLUIDA, SUSPENSA, CANCELADA
- **TaskStatus**: PENDENTE, EM_ANDAMENTO, CONCLUIDA, CANCELADA, BLOQUEADA
- **TaskPriority**: BAIXA, MEDIA, ALTA, URGENTE
- **RiskLevel**: LOW, MEDIUM, HIGH, CRITICAL
- **RiskStatus**: IDENTIFICADO, EM_MONITORAMENTO, MITIGADO, OCORRIDO, ENCERRADO
- **FundingOpportunityType**: EDITAL, CONVENIO, EMENDA, PATROCINIO, LEI_INCENTIVO, DOACAO
- **FundingOpportunityStatus**: ABERTO, ENCERRADO, SUSPENSO, EM_BREVE
- **FundingApplicationStatus**: RASCUNHO, SUBMETIDO, EM_ANALISE, APROVADO, REPROVADO, RECURSO, HOMOLOGADO
- **IncentiveLawType**: ROUANET, FNC, PRONAC, ESTADUAL, MUNICIPAL, ESPORTE, CRIANCA
- **ConvenioStatus**: PROPOSTA, ASSINADO, EM_EXECUCAO, PRESTACAO_CONTAS, ENCERRADO, INADIMPLENTE
- **EmendaType**: INDIVIDUAL, BANCADA, COMISSAO
- **EmendaStatus**: INDICADA, EMPENHADA, PAGA, CANCELADA
- **BudgetStatus**: ATIVO, SUSPENSO, ENCERRADO, REVISAO
- **TransactionType**: RECEITA, DESPESA, TRANSFERENCIA, DEVOLUCAO
- **TransactionStatus**: PENDENTE, APROVADO, PAGO, CANCELADO, ESTORNADO
- **InvoiceStatus**: PENDENTE, VALIDADA, REJEITADA
- **DocumentType**: CONTRATO, ESTATUTO, CERTIDAO, RELATORIO, NOTA_FISCAL, COMPROVANTE, OFICIO, ATA, OUTROS
- **DocumentStatus**: RASCUNHO, PENDENTE_ASSINATURA, ASSINADO, VENCIDO, ARQUIVADO
- **SignatureStatus**: PENDENTE, ASSINADO, REJEITADO
- **AccountabilityReportType**: PARCIAL, FINAL, ANUAL
- **AccountabilityReportStatus**: RASCUNHO, EM_REVISAO, SUBMETIDO, EM_ANALISE, APROVADO, REPROVADO, PENDENTE_CORRECAO
- **GlossStatus**: PENDENTE, ACEITO, RECURSO, DEFINITIVO
- **IndicatorType**: QUANTITATIVO, QUALITATIVO
- **MeasurementFrequency**: DIARIO, SEMANAL, MENSAL, TRIMESTRAL, ANUAL
- **Gender**: MASCULINO, FEMININO, NAO_BINARIO, PREFIRO_NAO_INFORMAR, OUTRO
- **Race**: BRANCA, PRETA, PARDA, AMARELA, INDIGENA, NAO_DECLARADA
- **BeneficiaryStatus**: ATIVO, INATIVO, SUSPENSO, EGRESSO
- **ActivityType**: OFICINA, AULA, EVENTO, REUNIAO, VISITA, CAPACITACAO, OUTROS
- **ActivityStatus**: AGENDADA, EM_ANDAMENTO, REALIZADA, CANCELADA
- **EnrollmentStatus**: INSCRITO, CONFIRMADO, AUSENTE, PRESENTE, CANCELADO
- **PartnerType**: EMPRESA, GOVERNO, OUTRO_OSC, PESSOA_FISICA, INTERNACIONAL
- **PartnerStatus**: PROSPECTO, ATIVO, INATIVO
- **PartnershipType**: PATROCINIO, PARCERIA_TECNICA, COEXECUCAO, DOACAO, VOLUNTARIADO
- **PartnershipStatus**: PROPOSTA, ATIVO, ENCERRADO, CANCELADO
- **SponsorTier**: DIAMANTE, OURO, PRATA, BRONZE, APOIADOR
- **SponsorStatus**: ATIVO, INATIVO, PROSPECTO
- **WorkflowStatus**: PENDENTE, EM_ANDAMENTO, APROVADO, REJEITADO, CANCELADO
- **ApprovalStatus**: PENDENTE, APROVADO, REJEITADO, DELEGADO
- **ComplianceStatus**: CONFORME, NAO_CONFORME, PENDENTE, NA
- **LGPDConsentStatus**: ATIVO, REVOGADO
- **AIAgentType**: JURIDICO, FINANCEIRO, CAPTACAO, GESTAO, COMPLIANCE
- **AIAgentStatus**: ACTIVE, INACTIVE, MAINTENANCE
- **AITaskStatus**: PENDING, PROCESSING, DONE, FAILED
- **NotificationChannel**: IN_APP, EMAIL, WHATSAPP, PUSH
- **NotificationStatus**: PENDING, SENT, READ, FAILED
- **OrganizationDocumentStatus**: VALIDO, VENCIDO, PENDENTE, REJEITADO
- **InviteStatus**: PENDING, ACCEPTED, EXPIRED, REVOKED
- **OrgProfileType**: EXECUTOR_PROJETOS_SOCIAIS, OSC, INSTITUTO, FUNDACAO, ASSOCIACAO
- **ProfileDocType**: CPF, CNPJ
- **OrgAbrangencia**: MUNICIPAL, ESTADUAL, NACIONAL, INTERNACIONAL
- **EditalFonte**: PNCP, MANUAL
- **SavedEditalStatus**: SALVO, EM_PREPARACAO, INSCRITO, APROVADO, REPROVADO, ENCERRADO
- **ParentescoType**: PAI, MAE, AVO, TIO, TUTOR_LEGAL, OUTRO
- **VinculoStatus**: ATIVO, INATIVO, DESLIGADO, EM_ESPERA
- **TipoVinculo**: VOLUNTARIO, CLT, AUTONOMO_PJ, PRESTADOR_SERVICO
- **ProfessorStatus**: ATIVO, INATIVO, AFASTADO, DESLIGADO
- **FormaPagamento**: PIX, TRANSFERENCIA, DINHEIRO, BOLETO
- **ConectaMatriculaStatus**: ATIVA, TRANCADA, CONCLUIDA
- **ConectaAtividadeStatus**: RASCUNHO, PUBLICADA, ENCERRADA
- **ConectaEntregaStatus**: PENDENTE, ENTREGUE, AVALIADA

## 4. Migrations Aplicadas

**NENHUMA migration versionada encontrada no repositorio.**

- Diretorio `apps/api/prisma/migrations/` nao existe.
- Nenhum arquivo `migration.sql` ou `migration_lock.toml` encontrado.
- Historico git nao contem commits em `apps/api/prisma/migrations/`.
- Script `db:migrate` em `apps/api/package.json:13` aponta para `prisma migrate dev`, mas nao ha migrations persistidas.

## 5. Divergencias Schema vs Migrations

| Tipo | Descricao | Evidencia |
|---|---|---|
| ALERTA CRITICO | Nao ha migrations versionadas. Todo o schema (78 models, 67 enums) nao possui migration correspondente no repositorio. | apps/api/prisma/: ausencia de pasta migrations; git log: sem historico de migrations |
| RISCO OPERACIONAL | Deploy/atualizacao de banco depende de `prisma migrate dev` (interativo) ou `prisma db push`, sem rastreabilidade de alteracoes. | apps/api/package.json:13 |
| RISCO LGPD | Campo `OrganizationProfile.documento` armazena CPF/CNPJ sem criptografia declarada no schema. | apps/api/prisma/schema.prisma:1441 |
| RISCO LGPD | Models `Beneficiary` e `Professor` concentram multiplos dados pessoais sensiveis (CPF, RG, endereco, saude, dados bancarios, imagem). | schema.prisma:1719-1794; 2184-2228 |
| RISCO SEGURANCA | `Edital.tenant_id` e opcional (String?) permitindo catalogo publico; validar RLS/policies. | apps/api/prisma/schema.prisma:1464 |
| RISCO SEGURANCA | `User.password_hash`, `RefreshToken.token_hash` e `UserInvite.token_hash` armazenam hashes/tokens; verificar algoritmo no codigo. | schema.prisma:579, 686, 2628 |
