# Operação do Semevo

## Instalação nova

1. Instale Docker Engine com Compose v2. PostgreSQL padrão é suficiente; nenhuma extensão externa é obrigatória.
2. Copie `infra/docker/.env.example` para `infra/docker/.env` e substitua todas as senhas e segredos.
3. Execute `docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml build`.
4. Execute `docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d`.
5. A API executa `prisma migrate deploy` antes de iniciar. Não use `prisma db push` em produção.
6. Crie o primeiro administrador com variáveis `ADMIN_*` e `pnpm --filter @cidadao/api db:seed:admin` dentro do container da API. A senha aleatória é exibida uma única vez.

PostgreSQL e Redis ficam somente na rede interna. Apenas o frontend publica porta por padrão. Para desenvolvimento, acrescente `-f infra/docker/docker-compose.dev.yml` para publicar banco e Redis exclusivamente em `127.0.0.1`.

## Atualização existente

1. Faça backup antes da atualização.
2. Revise migrations novas e procure operações destrutivas.
3. Baixe o código, reconstrua as imagens e execute `prisma migrate deploy`.
4. Reinicie um serviço por vez quando houver proxy/replicação externa.
5. Valide login, healthcheck, upload/download e indicadores.

Nunca apague volumes ou use `migrate reset` numa instalação existente.

## Desenvolvimento nativo no Windows

Sem Docker, use PostgreSQL 16 oficial limitado a `127.0.0.1` e configure `apps/api/.env.local`:

```env
DATABASE_URL=postgresql://postgres@127.0.0.1:5432/semevo?schema=public
```

```powershell
$env:DATABASE_URL='postgresql://postgres@127.0.0.1:5432/semevo?schema=public'
pnpm --filter @cidadao/api exec prisma migrate deploy
pnpm --filter @cidadao/api db:seed
pnpm dev
```

`.env.local` é ignorado pelo Git. O seed padrão provisiona somente cadastros estruturais e não cria organizações, usuários ou dados fictícios.

## Banco existente sem histórico Prisma

Compare o schema real com a migration baseline antes de marcar qualquer migration como aplicada. Após revisão e backup, use `prisma migrate resolve --applied <migration>` somente quando o banco já contiver exatamente a estrutura correspondente. Em divergência, crie uma migration corretiva não destrutiva.

## Backup

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner > semevo-$(date +%F-%H%M).dump
```

Copie também o volume/diretório de uploads em janela consistente. Proteja backups com criptografia e política de retenção.

## Restauração

Restaure primeiro em ambiente separado e valide antes de substituir produção:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml exec -T postgres \
  pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner < backup.dump
```

A opção `--clean` é destrutiva para o banco de destino e exige confirmação explícita e backup prévio.
