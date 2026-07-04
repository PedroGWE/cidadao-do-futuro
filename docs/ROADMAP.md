# Roadmap de Melhorias

Este documento registra as melhorias planejadas para o Cidadão do Futuro, organizadas por prioridade e módulo.

---

## Prioridade Alta — Fundação Técnica

### 1. Testes Automatizados
- [ ] **Testes unitários** nos services da API (Jest + mocks do Prisma)
- [ ] **Testes de integração** nos controllers (supertest + banco de testes)
- [ ] **Testes E2E** no frontend (Playwright) — fluxos críticos: login, criar projeto, criar transação
- [ ] Configurar cobertura mínima de 80% na pipeline CI
- [ ] Adicionar `pnpm test` ao Turbo e ao workflow do GitHub Actions

### 2. CI/CD com GitHub Actions
- [ ] Pipeline de CI: lint → build → test em cada PR
- [ ] Pipeline de CD: build → push Docker image → deploy no servidor
- [ ] Secrets configurados no GitHub (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Deploy automático para ambiente de staging ao mergear em `main`

### 3. Migrações do Banco de Dados
- [ ] Criar e versionar todas as migrations Prisma (atualmente sem arquivos de migration)
- [ ] Criar seed completo com dados de demonstração
- [ ] Script de reset seguro para staging

### 4. Tratamento de Erros Robusto
- [ ] Erros de validação do Prisma mapeados para respostas HTTP descritivas
- [ ] Timeout e retry nas chamadas de API do frontend
- [ ] Página de erro 500/404 customizada no Next.js
- [ ] Logging estruturado com Pino (já incluído no NestJS/Fastify)

---

## Prioridade Alta — Módulos Faltantes

### 5. Módulos de Negócio Não Implementados
O schema já define os modelos, faltam os módulos NestJS e páginas correspondentes:

- [ ] **Captação de Recursos** (`FundingOpportunity`, `FundingApplication`)
  - CRUD de editais, convênios, emendas parlamentares
  - Pipeline de candidatura com status
  - Integração com portal de transparência (futuro)

- [ ] **Prestação de Contas** (`AccountabilityReport`)
  - Geração de relatórios por projeto/período
  - Vinculação de notas fiscais e comprovantes
  - Fluxo de aprovação multi-etapas

- [ ] **Impacto Social** (`Beneficiary`, `Activity`, `Indicator`)
  - Cadastro e gestão de beneficiários (com anonimização LGPD)
  - Registro de atividades e frequência
  - Painel de indicadores com metas vs. realizados
  - Exportação de relatórios de impacto

- [ ] **Parcerias** (`Partner`, `Partnership`, `Sponsor`)
  - CRM leve para parceiros e patrocinadores
  - Gestão de contratos de parceria
  - Portal do parceiro (futuro)

- [ ] **Documentos** (`Document`, `DocumentVersion`, `DocumentSignature`)
  - Upload e versionamento de arquivos
  - Integração com S3/R2 para armazenamento
  - Assinatura digital via DocuSign ou ClickSign

- [ ] **Workflows de Aprovação** (`WorkflowTemplate`, `WorkflowInstance`)
  - Templates configuráveis por tipo de documento/transação
  - Notificações de aprovação pendente
  - Histórico de aprovações com registro de quem e quando

- [ ] **Conformidade e LGPD** (`LGPDConsent`, `ComplianceCheck`)
  - Termo de consentimento na coleta de dados de beneficiários
  - Painel de compliance com requisitos legais por projeto
  - Relatório de auditorias (AuditLog)

### 6. Organizações
- [ ] Módulo completo para `Organization` (CNPJ, endereço, contas bancárias)
- [ ] Vinculação de projetos a organizações
- [ ] Documentos institucionais (estatuto, CNPJ, certidões)

---

## Prioridade Média — Produto

### 7. Frontend — Páginas Faltantes
- [ ] Página de configurações do tenant (perfil da organização)
- [ ] Gestão de usuários e permissões
- [ ] Página de detalhes do projeto (fases, tarefas, membros, riscos)
- [ ] Relatórios financeiros com gráficos (recharts ou Chart.js)
- [ ] Página de captação de recursos
- [ ] Notificações em tempo real (WebSocket ou SSE)

### 8. Dashboard Aprimorado
- [ ] Gráfico de receitas vs. despesas por mês
- [ ] Mapa de projetos por região geográfica
- [ ] Indicadores de impacto consolidados
- [ ] Alertas de projetos com prazo vencendo
- [ ] Cards de editais abertos relevantes

### 9. Notificações
- [ ] E-mail transacional (Resend ou SendGrid) para: convites, aprovações, alertas
- [ ] Notificações in-app com contador no header
- [ ] Webhook para WhatsApp (Z-API ou Evolution API) para alertas críticos
- [ ] Templates configuráveis por tenant

### 10. Exportações e Relatórios
- [ ] Exportar transações para XLSX/CSV
- [ ] Relatório financeiro em PDF (prestação de contas simplificada)
- [ ] Exportar lista de beneficiários (com filtros LGPD)
- [ ] Relatório de indicadores de impacto em PDF

---

## Prioridade Média — Técnica

### 11. Performance
- [ ] Paginação em cursor (cursor-based) para listas grandes
- [ ] Cache com Redis nas rotas de dashboard e sumário financeiro
- [ ] Otimizar queries N+1 com `include` seletivo no Prisma
- [ ] Lazy loading de módulos pesados no Next.js

### 12. Segurança
- [ ] Rate limiting por IP e por usuário (NestJS ThrottlerModule)
- [ ] Helmet para headers de segurança HTTP
- [ ] Validação de CNPJ e CPF no backend
- [ ] Sanitização de inputs em campos de texto livre
- [ ] Auditoria automática de todas as mutations (middleware Prisma)
- [ ] Rotação periódica de segredos JWT

### 13. Observabilidade
- [ ] Health check endpoint (`/health`) com status do banco e Redis
- [ ] Métricas com Prometheus + Grafana
- [ ] Tracing com OpenTelemetry
- [ ] Alertas de erro via Sentry

---

## Prioridade Baixa — Inovação

### 14. Agentes de IA
O schema já prevê modelos para IA (`AIAgent`, `AIConversation`, `AITask`, `DocumentEmbedding`):

- [ ] **Agente Financeiro** — análise de despesas, identificação de anomalias
- [ ] **Agente de Captação** — busca automática de editais compatíveis com o perfil da OSC
- [ ] **Agente Jurídico** — checklist de conformidade legal por tipo de projeto
- [ ] **Agente de Prestação de Contas** — geração de minutas de relatórios
- [ ] RAG (Retrieval-Augmented Generation) sobre documentos do tenant

### 15. Integrações Externas
- [ ] **SICONV / Transferegov** — consulta de convênios federais
- [ ] **Portal da Transparência** — cruzamento de dados de transferências
- [ ] **Open Finance** — conciliação bancária automática
- [ ] **eSocial** — gestão de colaboradores e voluntários
- [ ] **NFS-e** — consulta e validação de notas fiscais eletrônicas

### 16. App Mobile
- [ ] React Native (Expo) para coleta de dados em campo
- [ ] Registro de frequência de beneficiários offline
- [ ] Assinatura de documentos pelo celular

### 17. Multi-idioma
- [ ] Internacionalização (i18n) com next-intl
- [ ] Suporte a Inglês e Espanhol (para OSCs com atuação internacional)

---

## Dívidas Técnicas

| Item | Impacto | Esforço |
|---|---|---|
| Ausência de testes | Alto | Médio |
| Falta de migrations versionadas | Alto | Baixo |
| `node_modules` sem lock consistente entre apps | Médio | Baixo |
| Secrets expostos em `.env.production` commitado | Alto | Baixo |
| Ausência de rate limiting | Médio | Baixo |
| Sem health check endpoint | Médio | Baixo |
| Módulos NestJS sem service tests | Alto | Alto |

> **Atenção:** O arquivo `apps/web/.env.production` está versionado no repositório. Mover as credenciais de produção para variáveis de ambiente do servidor e adicionar o arquivo ao `.gitignore`.

---

## Histórico de Versões

| Versão | Data | Descrição |
|---|---|---|
| 0.1.0 | 2025-07 | MVP — Auth, Projetos, Financeiro, Dashboard |
