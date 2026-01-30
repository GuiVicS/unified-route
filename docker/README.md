# API Bridge - Instalação via Docker

Guia completo para instalar o API Bridge usando Docker.

## Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- 512MB RAM mínimo
- 1GB espaço em disco

## Instalação Rápida

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/api-bridge.git
cd api-bridge/docker
```

### 2. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Gere as chaves de segurança
echo "MASTER_KEY=$(openssl rand -base64 32)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 64)" >> .env
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env

# Edite o arquivo .env com suas configurações
nano .env
```

### 3. Inicie os containers

```bash
# Build e start
docker compose up -d

# Acompanhe os logs
docker compose logs -f
```

### 4. Acesse o painel

Abra seu navegador em: `http://localhost:3000`

## Comandos Úteis

```bash
# Ver status dos containers
docker compose ps

# Parar os containers
docker compose down

# Reiniciar a aplicação
docker compose restart apibridge

# Ver logs em tempo real
docker compose logs -f apibridge

# Acessar o banco de dados
docker compose exec postgres psql -U apibridge -d apibridge

# Backup do banco de dados
docker compose exec postgres pg_dump -U apibridge apibridge > backup.sql

# Restaurar backup
cat backup.sql | docker compose exec -T postgres psql -U apibridge -d apibridge
```

## Atualização

```bash
# Baixe a nova versão
git pull

# Rebuild e restart
docker compose up -d --build
```

## Configuração Avançada

### Usar PostgreSQL Externo

Se você já tem um PostgreSQL, edite o `docker-compose.yml`:

1. Remova ou comente o serviço `postgres`
2. Configure as variáveis `DATABASE_*` no `.env` com seu servidor

```yaml
services:
  apibridge:
    environment:
      DATABASE_HOST: seu-servidor-postgres.com
      DATABASE_PORT: 5432
      DATABASE_SSL: "true"
      # ... outras configurações
```

### Proxy Reverso (Nginx)

Exemplo de configuração Nginx:

```nginx
server {
    listen 80;
    server_name api.suaempresa.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.suaempresa.com;

    ssl_certificate /etc/letsencrypt/live/api.suaempresa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.suaempresa.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL com Traefik

```yaml
# Adicione ao docker-compose.yml
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=seu@email.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

  apibridge:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.apibridge.rule=Host(`api.suaempresa.com`)"
      - "traefik.http.routers.apibridge.entrypoints=websecure"
      - "traefik.http.routers.apibridge.tls.certresolver=letsencrypt"
```

## Troubleshooting

### Container não inicia

```bash
# Verifique os logs
docker compose logs apibridge

# Verifique se o PostgreSQL está pronto
docker compose logs postgres
```

### Erro de conexão com banco

```bash
# Teste a conexão
docker compose exec postgres pg_isready -U apibridge

# Verifique as variáveis
docker compose config
```

### Reset completo

```bash
# Remove containers, volumes e networks
docker compose down -v

# Rebuild do zero
docker compose up -d --build
```

## Segurança em Produção

1. **Altere TODAS as chaves** no arquivo `.env`
2. **Use HTTPS** com certificado válido
3. **Restrinja acesso** à porta do PostgreSQL (5432)
4. **Configure firewall** para permitir apenas portas necessárias
5. **Faça backups** regulares do banco de dados
6. **Monitore logs** para atividades suspeitas
