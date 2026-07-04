# API Reference

Base URL: `https://seu-dominio.com/api/v1`

Todas as rotas (exceto `/auth/login`, `/auth/register`, `/auth/refresh`) requerem o header:
```
Authorization: Bearer <accessToken>
```

---

## Autenticação

### POST `/auth/register`
Cria uma nova organização e usuário administrador.

**Body:**
```json
{
  "organizationName": "Instituto Exemplo",
  "tenantSlug": "instituto-exemplo",
  "name": "João Silva",
  "email": "joao@exemplo.org",
  "password": "senha-segura-123"
}
```

**Response `201`:**
```json
{
  "accessToken": "eyJ...",
  "user": { "id": "...", "name": "João Silva", "email": "..." },
  "tenant": { "id": "...", "name": "Instituto Exemplo", "slug": "instituto-exemplo" }
}
```

---

### POST `/auth/login`
Autentica um usuário em um tenant específico.

**Body:**
```json
{
  "tenantSlug": "instituto-exemplo",
  "email": "joao@exemplo.org",
  "password": "senha-segura-123"
}
```

**Response `200`:**
```json
{
  "accessToken": "eyJ...",
  "user": { "id": "...", "name": "João Silva", "email": "...", "roles": [] }
}
```
O `refreshToken` é retornado em cookie HTTP-only.

---

### POST `/auth/refresh`
Renova o access token usando o refresh token (cookie).

**Response `200`:**
```json
{ "accessToken": "eyJ..." }
```

---

### POST `/auth/logout`
Revoga o refresh token atual.

**Response `200`:** `{ "message": "Logout realizado com sucesso" }`

---

### GET `/auth/me`
Retorna os dados do usuário autenticado.

---

## Usuários

### GET `/users/me`
Retorna o perfil completo do usuário logado.

### GET `/users`
Lista usuários do tenant. Requer permissão `users:list`.

---

## Tenant

### GET `/tenants/me`
Retorna os dados do tenant atual.

### PATCH `/tenants/me`
Atualiza dados do tenant (nome, CNPJ, endereço, etc.).

### GET `/tenants/me/stats`
Retorna estatísticas consolidadas: total de projetos, usuários, receitas, despesas.

### GET `/tenants/me/roles`
Lista papéis (roles) do tenant.

### GET `/tenants/me/invites`
Lista convites pendentes.

### POST `/tenants/me/invites`
Envia convite para um novo usuário.

**Body:**
```json
{
  "email": "colaborador@exemplo.org",
  "roleId": "uuid-do-papel"
}
```

### DELETE `/tenants/me/invites/:id`
Revoga um convite pendente.

### POST `/invites/accept`
Aceita um convite (rota pública).

**Body:**
```json
{
  "token": "token-do-convite",
  "name": "Maria Santos",
  "password": "nova-senha-123"
}
```

---

## Projetos

### GET `/projects`
Lista projetos com filtros e paginação.

**Query params:** `page`, `limit`, `search`, `status`, `type`

**Response:**
```json
{
  "data": [ { "id": "...", "code": "PRJ-001", "name": "...", "status": "EM_ANDAMENTO", ... } ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

### POST `/projects`
Cria um novo projeto.

**Body:**
```json
{
  "name": "Projeto Educação Digital",
  "code": "PRJ-001",
  "type": "EDUCACAO",
  "description": "...",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "budget": 150000.00,
  "funder": "Prefeitura de SP"
}
```

### GET `/projects/:id`
Retorna detalhes completos do projeto.

### PATCH `/projects/:id`
Atualiza dados do projeto.

### DELETE `/projects/:id`
Soft delete do projeto.

### GET `/projects/:id/phases`
Lista fases do projeto.

### POST `/projects/:id/phases`
Cria uma nova fase.

**Body:**
```json
{
  "name": "Fase 1 - Diagnóstico",
  "order": 1,
  "startDate": "2025-01-01",
  "endDate": "2025-03-31"
}
```

### PATCH `/projects/:id/phases/:phaseId`
Atualiza uma fase.

### DELETE `/projects/:id/phases/:phaseId`
Remove uma fase.

### GET `/projects/:id/tasks`
Lista tarefas do projeto. Query params: `phaseId`, `status`, `assignedTo`.

### POST `/projects/:id/tasks`
Cria uma tarefa.

**Body:**
```json
{
  "title": "Levantamento de beneficiários",
  "phaseId": "uuid-da-fase",
  "assignedTo": "uuid-do-usuario",
  "priority": "ALTA",
  "dueDate": "2025-02-15"
}
```

### PATCH `/projects/:id/tasks/:taskId`
Atualiza uma tarefa (inclusive status).

### GET `/projects/:id/members`
Lista membros do projeto.

### POST `/projects/:id/members`
Adiciona um membro ao projeto.

**Body:**
```json
{
  "userId": "uuid-do-usuario",
  "role": "COORDENADOR"
}
```

### DELETE `/projects/:id/members/:userId`
Remove um membro do projeto.

---

## Financeiro

### GET `/financial/summary`
Retorna resumo financeiro do tenant.

**Response:**
```json
{
  "totalReceitas": 250000.00,
  "totalDespesas": 180000.00,
  "saldo": 70000.00,
  "pendentes": 15000.00
}
```

### GET `/financial/transactions`
Lista transações com filtros e paginação.

**Query params:** `page`, `limit`, `type` (RECEITA|DESPESA|TRANSFERENCIA|DEVOLUCAO), `status` (PENDENTE|APROVADO|PAGO|CANCELADO), `projectId`, `startDate`, `endDate`

### POST `/financial/transactions`
Cria uma transação.

**Body:**
```json
{
  "type": "DESPESA",
  "description": "Contratação de palestrante",
  "amount": 2500.00,
  "projectId": "uuid-do-projeto",
  "dueDate": "2025-03-10",
  "categoryId": "uuid-da-categoria"
}
```

### GET `/financial/transactions/:id`
Retorna detalhes de uma transação.

### PATCH `/financial/transactions/:id/approve`
Aprova uma transação pendente. Requer permissão `financial:approve`.

### PATCH `/financial/transactions/:id/pay`
Marca uma transação como paga.

**Body:**
```json
{
  "paidAt": "2025-03-10",
  "receipt": "url-do-comprovante"
}
```

### PATCH `/financial/transactions/:id/cancel`
Cancela uma transação.

---

### GET `/financial/payment-orders`
Lista ordens de pagamento.

### POST `/financial/payment-orders`
Cria uma ordem de pagamento.

### PATCH `/financial/payment-orders/:id/approve`
Aprova uma ordem de pagamento.

---

### POST `/financial/invoices`
Registra uma nota fiscal.

### PATCH `/financial/invoices/:id/validate`
Valida uma nota fiscal.

---

### GET `/financial/budgets/summary`
Retorna resumo de orçamentos por exercício fiscal.

### GET `/financial/budgets`
Lista orçamentos.

### POST `/financial/budgets`
Cria um orçamento.

**Body:**
```json
{
  "name": "Orçamento 2025",
  "projectId": "uuid-do-projeto",
  "fiscalYear": 2025,
  "totalAmount": 150000.00
}
```

### GET `/financial/budgets/:id`
Retorna detalhes do orçamento com categorias e itens.

### PATCH `/financial/budgets/:id/status`
Atualiza status do orçamento (DRAFT → APROVADO → EXECUTANDO → ENCERRADO).

### POST `/financial/budgets/:id/categories`
Adiciona uma categoria ao orçamento.

### POST `/financial/budgets/:id/categories/:catId/items`
Adiciona um item a uma categoria.

---

## Códigos de Erro

| Código | Significado |
|---|---|
| `400` | Dados inválidos (body malformado ou validação falhou) |
| `401` | Não autenticado (token ausente ou expirado) |
| `403` | Sem permissão para a ação |
| `404` | Recurso não encontrado |
| `409` | Conflito (ex: email já cadastrado) |
| `500` | Erro interno do servidor |

**Formato de erro:**
```json
{
  "statusCode": 400,
  "message": "Descrição do erro",
  "error": "Bad Request"
}
```
