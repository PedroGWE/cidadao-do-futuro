.PHONY: up down restart logs db-migrate db-studio dev build

# Docker
up:
	docker compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env up -d

down:
	docker compose -f infra/docker/docker-compose.yml down

restart:
	docker compose -f infra/docker/docker-compose.yml restart

logs:
	docker compose -f infra/docker/docker-compose.yml logs -f

tools:
	docker compose -f infra/docker/docker-compose.yml --profile tools up -d

# Database
db-migrate:
	pnpm --filter @cidadao/api db:migrate

db-generate:
	pnpm --filter @cidadao/api db:generate

db-studio:
	pnpm --filter @cidadao/api db:studio

db-reset:
	pnpm --filter @cidadao/api exec prisma migrate reset --force

# Dev
dev:
	pnpm dev

build:
	pnpm build

setup:
	cp infra/docker/.env.example infra/docker/.env
	cp apps/api/.env.example apps/api/.env
	docker compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env up -d
	@echo "⏳ Aguardando banco de dados..."
	@sleep 3
	pnpm --filter @cidadao/api db:generate
	pnpm --filter @cidadao/api db:migrate
	@echo "✅ Ambiente pronto. Execute: make dev"
