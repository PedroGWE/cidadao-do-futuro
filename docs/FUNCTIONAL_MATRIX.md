# Matriz funcional do Semevo

Atualizada em 2026-10-02. Estados: **operacional**, **parcial**, **bloqueado**.

| Aba/módulo | Existente | Ausente ou defeito confirmado | Entidades/endpoints | Correção/critério de aceite | Estado |
|---|---|---|---|---|---|
| Autenticação | cadastro, login, JWT, refresh, logout | login fixa organização no front; refresh sem cookie HttpOnly; ausência de rate limit; módulos novos quebram build | Tenant, User, Role, RefreshToken; `/auth/*` | login multi-organização, cookie seguro, rotação atômica, teste de reuso concorrente | parcial |
| Dashboard | duas rotas e uma tela com valores estáticos | rota duplicada; contratos de resumo inconsistentes | Project, Beneficiary, Transaction, Document | uma rota, indicadores reais, filtros e links | bloqueado |
| Instituição / Dados básicos | consulta/edição e indicador de completude | revisar permissão explícita e auditoria | OrganizationProfile; `/organization-profile` | persistir, validar CPF/CNPJ e isolar tenant | parcial |
| Instituição / Documentos | categorias, upload, download e exclusão | não há edição; substituição apagava arquivo antigo antes do commit | InstitutionalDocument; `/documents/*` | substituição compensável, storage persistente, órfãos tratados | parcial |
| Projetos | CRUD, fases, tarefas e membros na API; listagem web | tela não cobre todos os subfluxos; IDs filhos não eram validados contra o projeto | Project, ProjectPhase, ProjectTask, ProjectMember; `/projects/*` | CRUD completo e nenhum vínculo cruzado | parcial |
| Beneficiários | CRUD, responsáveis, vínculos, tela de cadastro/lista e modelos Prisma | falta validar jornada contra PostgreSQL real e ampliar histórico de atendimentos | Beneficiary, Responsavel, BeneficiarioProjeto; `/beneficiarios/*` | CRUD persistente, duplicidade e isolamento testados em integração | parcial |
| Professores / Conecta | serviços, telas e modelos Prisma reconciliados | portais ainda têm fluxos resumidos e faltam testes de integração | Professor, Turma, Matricula, Atividade; `/professores/*`, `/conecta/*` | jornadas persistentes e permissões testadas | parcial |
| Financeiro | transações, resumo, orçamentos, pagamentos e notas | vínculos não validados; transições permissivas; contrato causa `NaN`; ausência de telas completas | Budget, Transaction, PaymentOrder, Invoice; `/financial/*` | Decimal, transições atômicas, filtros e UI consistente | parcial |
| Editais/captação | busca PNCP/manual, salvos, tela e modelos Prisma | propostas e histórico completos ainda ausentes | Edital, SavedEdital, FundingOpportunity, FundingApplication; `/editais/*` | oportunidades/propostas reais com histórico | parcial |
| Parcerias | cadastro/listagem de parceiros, propostas e vínculo opcional a projeto | contatos, patrocinadores e documentos ainda sem tela dedicada | Partner, Partnership; `/partners`, `/partnerships` | vínculos validados no tenant e propostas persistentes | parcial |
| Prestação de contas | criação por período, consolidação financeira, fluxo de estados e CSV | interface de glosas e PDF ainda ausentes | AccountabilityReport/Item/Gloss; `/accountability/*` | valores Decimal, origem rastreável e exportação protegida | parcial |
| Relatórios | indicadores reais, filtros por período e exportação financeira CSV protegida | falta PDF e relatórios analíticos por entidade | múltiplas entidades; `/reports/summary`, `/reports/financial.csv` | filtros, CSV/PDF e mesmas permissões das consultas | parcial |
| Configurações | organização, perfil, troca de senha, usuários, papéis, atribuição, desativação e convites | preferências avançadas ainda não possuem tela | User, Tenant, Role, UserInvite, AuditLog | sessões revogadas na troca de senha, auditoria e último admin protegido | operacional |
| IA | modelos genéricos | sem interface/módulo/provedor configurado | AIAgent, AIConversation, AITask | estado “não configurado”; ações sempre revalidadas no backend | bloqueado |
| Infraestrutura | Compose de PostgreSQL/Redis | banco era publicado por padrão; sem imagens da aplicação, backup/restauração | Docker/Prisma/storage | rede interna, volumes, migrations no start e guia operacional | parcial |

## Ações visíveis inventariadas

- Menu administrativo: Dashboard, Projetos, Editais, Beneficiários, Professores, Financeiro, Parcerias, Prestação de contas, Dados Básicos, Documentos, Relatórios e Configurações.
- Portal professor: Início, Turmas, Chamada e Atividades.
- Portal aluno: Início, Atividades, Jornada e Perfil.
- A revisão de botões por tela deve ser repetida após o schema voltar a compilar; nenhuma ação será classificada como operacional sem teste contra PostgreSQL.

## Bloqueio de validação local

O host atual não possui Docker, Podman nem PostgreSQL. Portanto migrations, seed, reinício e jornada persistente ainda não foram comprovados neste host. Os comandos e resultados estão registrados em `docs/VALIDATION.md`.
