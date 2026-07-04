# Deploy em Produção

## Pré-requisitos no Servidor

- Ubuntu 22.04 LTS (ou similar)
- Node.js 20 LTS
- pnpm 9
- PM2
- Nginx
- PostgreSQL 16 (local ou externo)
- Redis 7 (local ou externo)
- Certificado SSL (Let's Encrypt via Certbot)

## Configuração Inicial do Servidor

```bash
# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2
npm install -g pm2

# Instalar Nginx
sudo apt-get install -y nginx

# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx
```

## Deploy da Aplicação

```bash
# 1. Clonar o repositório
git clone https://github.com/PedroGWE/cidadao-do-futuro.git /var/www/cidadao-do-futuro
cd /var/www/cidadao-do-futuro

# 2. Instalar dependências
pnpm install --frozen-lockfile

# 3. Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
# Editar apps/api/.env com as credenciais de produção

# 4. Build
pnpm build

# 5. Rodar migrations
pnpm db:migrate

# 6. Iniciar com PM2
pm2 start infra/pm2/ecosystem.config.js
pm2 save
pm2 startup
```

## Configuração do Nginx

```bash
# Copiar configuração
sudo cp infra/nginx/projeto.gtmcorepro.com.conf /etc/nginx/sites-available/cidadao-do-futuro
sudo ln -s /etc/nginx/sites-available/cidadao-do-futuro /etc/nginx/sites-enabled/

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com.br

# Recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx
```

## Variáveis de Ambiente de Produção (`apps/api/.env`)

```env
NODE_ENV=production
PORT=3001

# Banco de dados
DATABASE_URL=postgresql://usuario:senha@host:5432/cidadao_futuro?schema=public

# JWT — gerar com: openssl rand -base64 64
JWT_SECRET=gerar-segredo-forte-aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=gerar-outro-segredo-forte-aqui
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://:senha@localhost:6379

# CORS
CORS_ORIGINS=https://seu-dominio.com.br
```

## Atualização (Deploy Contínuo)

```bash
cd /var/www/cidadao-do-futuro
git pull origin main
pnpm install --frozen-lockfile
pnpm build
pnpm db:migrate
pm2 restart all
```

Ou usando o script incluído:

```bash
bash infra/scripts/deploy.sh
```

## Monitoramento

```bash
pm2 status          # Status dos processos
pm2 logs            # Logs em tempo real
pm2 monit           # Dashboard de monitoramento
```

## Backup do Banco de Dados

```bash
# Backup manual
pg_dump -U postgres cidadao_futuro > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U postgres cidadao_futuro < backup_20250101.sql
```

Recomenda-se configurar backup automático diário via cron:

```bash
0 3 * * * pg_dump -U postgres cidadao_futuro | gzip > /backups/cidadao_$(date +\%Y\%m\%d).sql.gz
```
