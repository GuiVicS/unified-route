import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/PageHeader';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Server, 
  Database, 
  Settings, 
  Globe, 
  Shield, 
  CheckCircle2,
  AlertTriangle,
  Terminal,
  FileCode,
  Key,
  Container,
  HardDrive,
  Store,
  ShoppingBag,
  Brain,
  Plug,
  ExternalLink,
  Copy,
  Zap
} from 'lucide-react';

function StepCard({ step, icon: Icon, title, children }: { 
  step: number; 
  icon: React.ElementType; 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <Card className="gradient-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
            {step}
          </div>
          <Icon className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

function EasyPanelTab() {
  const envVars = `DATABASE_HOST=apibridge_postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=SuaSenhaSegura123!
DATABASE_NAME=apibridge
DATABASE_SSL=false

MASTER_KEY=sua-chave-master-gerada
JWT_SECRET=seu-jwt-secret-gerado
SESSION_SECRET=seu-session-secret

ADMIN_EMAIL=admin@suaempresa.com
ADMIN_PASSWORD=SuaSenhaAdmin123!

PORT=3000
BASE_URL=https://api.suaempresa.com`;

  return (
    <div className="space-y-6">
      <Alert>
        <Server className="h-4 w-4" />
        <AlertTitle>Requisitos</AlertTitle>
        <AlertDescription>
          Acesso ao painel do EasyPanel com permissões para criar projetos e serviços.
        </AlertDescription>
      </Alert>

      <StepCard step={1} icon={Container} title="Criar Projeto">
        <p className="text-muted-foreground">
          Acesse o EasyPanel e clique em <strong>"New Project"</strong>. Dê um nome como <code className="px-1 py-0.5 rounded bg-secondary">apibridge</code>.
        </p>
      </StepCard>

      <StepCard step={2} icon={Database} title="Adicionar PostgreSQL">
        <p className="text-muted-foreground mb-3">
          Dentro do projeto, clique em <strong>"+ Service"</strong> → <strong>"Database"</strong> → <strong>"PostgreSQL"</strong>.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Nome: postgres</Badge>
          <Badge variant="outline">Versão: 16</Badge>
          <Badge variant="outline">Porta padrão: 5432</Badge>
        </div>
      </StepCard>

      <StepCard step={3} icon={FileCode} title="Adicionar Aplicação">
        <p className="text-muted-foreground mb-3">
          Clique em <strong>"+ Service"</strong> → <strong>"App"</strong>. Escolha uma das opções:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="font-medium text-sm mb-1">Via GitHub</p>
            <p className="text-xs text-muted-foreground">Conecte seu repositório para deploy automático</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="font-medium text-sm mb-1">Via Docker Image</p>
            <p className="text-xs text-muted-foreground">Use: <code>ghcr.io/seu-usuario/apibridge:latest</code></p>
          </div>
        </div>
      </StepCard>

      <StepCard step={4} icon={Settings} title="Configurar Variáveis de Ambiente">
        <p className="text-muted-foreground mb-3">
          Na aba <strong>"Environment"</strong> do serviço, adicione as variáveis:
        </p>
        <CodeBlock code={envVars} filename=".env" />
        <Alert className="mt-4">
          <Key className="h-4 w-4" />
          <AlertTitle>Gerar Chaves de Segurança</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Execute no terminal para gerar chaves seguras:</p>
            <CodeBlock 
              code={`openssl rand -base64 32  # MASTER_KEY e SESSION_SECRET
openssl rand -base64 64  # JWT_SECRET`}
            />
          </AlertDescription>
        </Alert>
      </StepCard>

      <StepCard step={5} icon={Globe} title="Configurar Domínio e SSL">
        <p className="text-muted-foreground mb-3">
          Na aba <strong>"Domains"</strong> do serviço da aplicação:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Adicione seu domínio (ex: <code className="px-1 py-0.5 rounded bg-secondary">api.suaempresa.com</code>)</li>
          <li>Ative <strong>"HTTPS"</strong> para certificado SSL automático</li>
          <li>Configure a porta do container como <strong>3000</strong></li>
        </ul>
      </StepCard>

      <StepCard step={6} icon={CheckCircle2} title="Acessar o Assistente">
        <p className="text-muted-foreground">
          Após o deploy, acesse seu domínio. O <strong>Assistente de Instalação</strong> será exibido automaticamente para configurar a primeira conta de administrador.
        </p>
      </StepCard>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">Container não inicia?</p>
            <p className="text-muted-foreground">Verifique os logs em "Logs" e confirme se todas as variáveis de ambiente estão configuradas.</p>
          </div>
          <div>
            <p className="font-medium">Erro de conexão com banco?</p>
            <p className="text-muted-foreground">O <code>DATABASE_HOST</code> deve ser <code>nomedoprojeto_nomedoservico</code> (ex: apibridge_postgres).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DockerComposeTab() {
  const dockerCompose = `version: "3.8"

services:
  apibridge:
    image: ghcr.io/seu-usuario/apibridge:latest
    # ou build local:
    # build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: \${DATABASE_USER}
      DATABASE_PASSWORD: \${DATABASE_PASSWORD}
      DATABASE_NAME: \${DATABASE_NAME}
      MASTER_KEY: \${MASTER_KEY}
      JWT_SECRET: \${JWT_SECRET}
      SESSION_SECRET: \${SESSION_SECRET}
      ADMIN_EMAIL: \${ADMIN_EMAIL}
      ADMIN_PASSWORD: \${ADMIN_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: \${DATABASE_USER}
      POSTGRES_PASSWORD: \${DATABASE_PASSWORD}
      POSTGRES_DB: \${DATABASE_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DATABASE_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:`;

  const envExample = `DATABASE_USER=apibridge
DATABASE_PASSWORD=SuaSenhaSegura123!
DATABASE_NAME=apibridge

MASTER_KEY=
JWT_SECRET=
SESSION_SECRET=

ADMIN_EMAIL=admin@suaempresa.com
ADMIN_PASSWORD=SuaSenhaAdmin123!`;

  const commands = `# Clonar repositório
git clone https://github.com/seu-usuario/api-bridge.git
cd api-bridge/docker

# Copiar arquivo de exemplo
cp .env.example .env

# Gerar chaves de segurança
echo "MASTER_KEY=$(openssl rand -base64 32)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 64)" >> .env
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env

# Editar configurações
nano .env

# Subir containers
docker compose up -d

# Acompanhar logs
docker compose logs -f`;

  const usefulCommands = `# Ver status dos containers
docker compose ps

# Parar containers
docker compose down

# Reiniciar aplicação
docker compose restart apibridge

# Logs em tempo real
docker compose logs -f apibridge

# Acessar banco de dados
docker compose exec postgres psql -U apibridge -d apibridge

# Backup do banco
docker compose exec postgres pg_dump -U apibridge apibridge > backup.sql

# Restaurar backup
cat backup.sql | docker compose exec -T postgres psql -U apibridge -d apibridge`;

  return (
    <div className="space-y-6">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Requisitos</AlertTitle>
        <AlertDescription className="flex flex-wrap gap-2 mt-2">
          <Badge>Docker 20.10+</Badge>
          <Badge>Docker Compose 2.0+</Badge>
          <Badge>512MB RAM</Badge>
          <Badge>1GB Disco</Badge>
        </AlertDescription>
      </Alert>

      <StepCard step={1} icon={Terminal} title="Clonar e Configurar">
        <CodeBlock code={commands} filename="Terminal" />
      </StepCard>

      <StepCard step={2} icon={FileCode} title="Arquivo .env">
        <p className="text-muted-foreground mb-3">
          Configure as variáveis de ambiente no arquivo <code>.env</code>:
        </p>
        <CodeBlock code={envExample} filename=".env" />
      </StepCard>

      <StepCard step={3} icon={Container} title="Docker Compose">
        <p className="text-muted-foreground mb-3">
          Estrutura do arquivo <code>docker-compose.yml</code>:
        </p>
        <CodeBlock code={dockerCompose} filename="docker-compose.yml" showLineNumbers />
      </StepCard>

      <StepCard step={4} icon={Settings} title="Comandos Úteis">
        <CodeBlock code={usefulCommands} filename="Terminal" />
      </StepCard>

      <StepCard step={5} icon={Globe} title="Acessar o Painel">
        <p className="text-muted-foreground">
          Após os containers subirem, acesse: <code className="px-2 py-1 rounded bg-primary/10 text-primary">http://localhost:3000</code>
        </p>
      </StepCard>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">Container não inicia?</p>
            <CodeBlock code="docker compose logs apibridge" />
          </div>
          <div>
            <p className="font-medium">Erro de conexão com banco?</p>
            <CodeBlock code={`docker compose exec postgres pg_isready -U apibridge
docker compose config  # Verificar variáveis`} />
          </div>
          <div>
            <p className="font-medium">Reset completo?</p>
            <CodeBlock code={`docker compose down -v  # Remove tudo
docker compose up -d --build  # Rebuild`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VPSTab() {
  const installDeps = `# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Verificar instalações
node --version  # v20.x.x
psql --version  # 16.x`;

  const configDb = `# Acessar PostgreSQL
sudo -u postgres psql

# Criar usuário e banco
CREATE USER apibridge WITH PASSWORD 'SuaSenhaSegura123!';
CREATE DATABASE apibridge OWNER apibridge;
GRANT ALL PRIVILEGES ON DATABASE apibridge TO apibridge;
\\q`;

  const cloneAndConfig = `# Clonar projeto
cd /opt
sudo git clone https://github.com/seu-usuario/api-bridge.git
cd api-bridge

# Instalar dependências
npm install

# Criar arquivo de ambiente
sudo cp .env.example .env
sudo nano .env

# Build da aplicação
npm run build`;

  const envConfig = `DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=apibridge
DATABASE_PASSWORD=SuaSenhaSegura123!
DATABASE_NAME=apibridge
DATABASE_SSL=false

MASTER_KEY=sua-chave-master
JWT_SECRET=seu-jwt-secret
SESSION_SECRET=seu-session-secret

ADMIN_EMAIL=admin@suaempresa.com
ADMIN_PASSWORD=SuaSenhaAdmin123!

PORT=3000
BASE_URL=https://api.suaempresa.com`;

  const pm2Config = `# Instalar PM2
sudo npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "apibridge" -- start

# Configurar startup automático
pm2 startup
pm2 save

# Comandos úteis
pm2 status
pm2 logs apibridge
pm2 restart apibridge`;

  const systemdConfig = `[Unit]
Description=API Bridge
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/api-bridge
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=apibridge
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target`;

  const nginxConfig = `server {
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
}`;

  const sslConfig = `# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d api.suaempresa.com

# Renovação automática
sudo certbot renew --dry-run`;

  return (
    <div className="space-y-6">
      <Alert>
        <HardDrive className="h-4 w-4" />
        <AlertTitle>Requisitos do Servidor</AlertTitle>
        <AlertDescription className="flex flex-wrap gap-2 mt-2">
          <Badge>Ubuntu 22.04+</Badge>
          <Badge>Node.js 20+</Badge>
          <Badge>PostgreSQL 16+</Badge>
          <Badge>1GB RAM</Badge>
          <Badge>Nginx</Badge>
        </AlertDescription>
      </Alert>

      <StepCard step={1} icon={Terminal} title="Instalar Dependências">
        <CodeBlock code={installDeps} filename="Terminal" />
      </StepCard>

      <StepCard step={2} icon={Database} title="Configurar Banco de Dados">
        <CodeBlock code={configDb} filename="Terminal" />
      </StepCard>

      <StepCard step={3} icon={FileCode} title="Clonar e Configurar Projeto">
        <CodeBlock code={cloneAndConfig} filename="Terminal" />
      </StepCard>

      <StepCard step={4} icon={Settings} title="Variáveis de Ambiente">
        <CodeBlock code={envConfig} filename="/opt/api-bridge/.env" />
      </StepCard>

      <StepCard step={5} icon={Server} title="Configurar Serviço">
        <Tabs defaultValue="pm2" className="w-full">
          <TabsList className="mb-3">
            <TabsTrigger value="pm2">PM2</TabsTrigger>
            <TabsTrigger value="systemd">Systemd</TabsTrigger>
          </TabsList>
          <TabsContent value="pm2">
            <CodeBlock code={pm2Config} filename="Terminal" />
          </TabsContent>
          <TabsContent value="systemd">
            <p className="text-muted-foreground mb-3 text-sm">
              Crie o arquivo <code>/etc/systemd/system/apibridge.service</code>:
            </p>
            <CodeBlock code={systemdConfig} filename="apibridge.service" />
            <CodeBlock 
              code={`sudo systemctl daemon-reload
sudo systemctl enable apibridge
sudo systemctl start apibridge`}
            />
          </TabsContent>
        </Tabs>
      </StepCard>

      <StepCard step={6} icon={Globe} title="Configurar Nginx">
        <p className="text-muted-foreground mb-3">
          Crie o arquivo <code>/etc/nginx/sites-available/apibridge</code>:
        </p>
        <CodeBlock code={nginxConfig} filename="apibridge.conf" />
        <CodeBlock 
          code={`sudo ln -s /etc/nginx/sites-available/apibridge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx`}
        />
      </StepCard>

      <StepCard step={7} icon={Shield} title="Configurar SSL com Let's Encrypt">
        <CodeBlock code={sslConfig} filename="Terminal" />
      </StepCard>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">Aplicação não inicia?</p>
            <CodeBlock code={`pm2 logs apibridge
# ou
sudo journalctl -u apibridge -f`} />
          </div>
          <div>
            <p className="font-medium">Erro 502 Bad Gateway?</p>
            <p className="text-muted-foreground">Verifique se a aplicação está rodando na porta 3000.</p>
          </div>
          <div>
            <p className="font-medium">Permissões?</p>
            <CodeBlock code="sudo chown -R www-data:www-data /opt/api-bridge" />
          </div>
        </CardContent>
      </Card>

      <Alert className="border-primary/50 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Segurança em Produção</AlertTitle>
        <AlertDescription className="mt-2 space-y-1">
          <p>✓ Altere TODAS as chaves no arquivo .env</p>
          <p>✓ Configure firewall (ufw) permitindo apenas 22, 80, 443</p>
          <p>✓ Restrinja acesso SSH por chave</p>
          <p>✓ Configure backups automáticos do banco</p>
          <p>✓ Monitore logs regularmente</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function ProvidersTab() {
  // === YAMPI ===
  const yampiExample = `// Exemplo de requisição via API Bridge para Yampi
const response = await fetch('https://seu-apibridge.com/api/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Token': 'ab_SeuTokenDeCliente'
  },
  body: JSON.stringify({
    connectionId: 'conn-yampi-001',
    method: 'GET',
    path: '/orders',
    query: {
      page: '1',
      limit: '20',
      include: 'customer,items'
    }
  })
});

const data = await response.json();
console.log(data);`;

  const yampiCurl = `# Listar pedidos da Yampi
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-yampi-001",
    "method": "GET",
    "path": "/orders",
    "query": {
      "page": "1",
      "limit": "20",
      "include": "customer,items"
    }
  }'

# Buscar pedido por ID
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-yampi-001",
    "method": "GET",
    "path": "/orders/12345"
  }'

# Listar produtos
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-yampi-001",
    "method": "GET",
    "path": "/catalog/products",
    "query": { "limit": "50" }
  }'

# Atualizar status do pedido
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-yampi-001",
    "method": "PUT",
    "path": "/orders/12345/status",
    "body": { "status_id": 5 }
  }'`;

  const yampiEndpoints = `# Endpoints Principais da Yampi

## Pedidos
GET  /orders                    # Listar pedidos
GET  /orders/{id}               # Pedido por ID
GET  /orders/number/{number}    # Pedido por número
PUT  /orders/{id}/status        # Atualizar status

## Produtos  
GET  /catalog/products          # Listar produtos
GET  /catalog/products/{id}     # Produto por ID
GET  /catalog/products/{id}/skus # SKUs do produto

## Clientes
GET  /customers                 # Listar clientes
GET  /customers/{id}            # Cliente por ID
GET  /customers/{id}/orders     # Pedidos do cliente

## Categorias e Marcas
GET  /catalog/categories        # Listar categorias
GET  /catalog/brands            # Listar marcas

## Checkout
GET  /checkout/carts            # Listar carrinhos
GET  /checkout/carts/{id}       # Carrinho por ID`;

  // === SHOPIFY ===
  const shopifyExample = `// Exemplo de requisição via API Bridge para Shopify
const response = await fetch('https://seu-apibridge.com/api/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Token': 'ab_SeuTokenDeCliente'
  },
  body: JSON.stringify({
    connectionId: 'conn-shopify-001',
    method: 'GET',
    path: '/products.json',
    query: {
      limit: '50',
      status: 'active'
    }
  })
});

const data = await response.json();
console.log(data.products);`;

  const shopifyCurl = `# Listar produtos do Shopify
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-shopify-001",
    "method": "GET",
    "path": "/products.json",
    "query": { "limit": "50", "status": "active" }
  }'

# Buscar pedidos recentes
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-shopify-001",
    "method": "GET",
    "path": "/orders.json",
    "query": { "status": "any", "limit": "25" }
  }'

# Criar produto
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-shopify-001",
    "method": "POST",
    "path": "/products.json",
    "body": {
      "product": {
        "title": "Novo Produto",
        "body_html": "<strong>Descrição do produto</strong>",
        "vendor": "Minha Loja",
        "product_type": "Categoria",
        "variants": [
          { "price": "99.00", "sku": "SKU123" }
        ]
      }
    }
  }'

# Atualizar estoque
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-shopify-001",
    "method": "POST",
    "path": "/inventory_levels/set.json",
    "body": {
      "inventory_item_id": 123456789,
      "location_id": 987654321,
      "available": 100
    }
  }'`;

  const shopifyEndpoints = `# Endpoints Principais do Shopify

## Produtos
GET  /products.json                    # Listar produtos
GET  /products/{id}.json               # Produto por ID
GET  /products/count.json              # Total de produtos
POST /products.json                    # Criar produto
PUT  /products/{id}.json               # Atualizar produto

## Pedidos
GET  /orders.json                      # Listar pedidos
GET  /orders/{id}.json                 # Pedido por ID
GET  /orders/count.json                # Total de pedidos
PUT  /orders/{id}.json                 # Atualizar pedido

## Clientes
GET  /customers.json                   # Listar clientes
GET  /customers/{id}.json              # Cliente por ID
GET  /customers/search.json?query=     # Buscar clientes

## Inventário
GET  /inventory_levels.json            # Níveis de estoque
POST /inventory_levels/set.json        # Definir estoque

## Coleções
GET  /custom_collections.json          # Coleções personalizadas
GET  /smart_collections.json           # Coleções inteligentes`;

  // === OPENAI ===
  const openaiExample = `// Exemplo de requisição via API Bridge para OpenAI
const response = await fetch('https://seu-apibridge.com/api/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Token': 'ab_SeuTokenDeCliente'
  },
  body: JSON.stringify({
    connectionId: 'conn-openai-001',
    method: 'POST',
    path: '/chat/completions',
    body: {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Você é um assistente útil.' },
        { role: 'user', content: 'Olá, como você pode me ajudar?' }
      ],
      max_tokens: 500
    }
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`;

  const openaiCurl = `# Chat Completion com GPT-4
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-openai-001",
    "method": "POST",
    "path": "/chat/completions",
    "body": {
      "model": "gpt-4",
      "messages": [
        { "role": "system", "content": "Você é um assistente útil." },
        { "role": "user", "content": "Olá, como posso usar a API?" }
      ],
      "max_tokens": 500
    }
  }'

# Gerar imagem com DALL-E
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-openai-001",
    "method": "POST",
    "path": "/images/generations",
    "body": {
      "model": "dall-e-3",
      "prompt": "Um gato programando em um computador",
      "n": 1,
      "size": "1024x1024"
    }
  }'

# Gerar embeddings
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-openai-001",
    "method": "POST",
    "path": "/embeddings",
    "body": {
      "model": "text-embedding-3-small",
      "input": "Texto para gerar embedding"
    }
  }'

# Listar modelos disponíveis
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-openai-001",
    "method": "GET",
    "path": "/models"
  }'

# Text-to-Speech
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-openai-001",
    "method": "POST",
    "path": "/audio/speech",
    "body": {
      "model": "tts-1",
      "input": "Olá, este é um teste de áudio.",
      "voice": "alloy"
    }
  }'`;

  const openaiEndpoints = `# Endpoints Principais da OpenAI

## Chat Completions (GPT-4, GPT-3.5)
POST /chat/completions          # Gerar resposta de chat

## Embeddings
POST /embeddings                # Gerar embeddings de texto

## Imagens (DALL-E)
POST /images/generations        # Gerar imagens
POST /images/edits              # Editar imagens
POST /images/variations         # Variações de imagem

## Áudio (Whisper)
POST /audio/transcriptions      # Transcrever áudio
POST /audio/translations        # Traduzir áudio
POST /audio/speech              # Text-to-Speech

## Modelos
GET  /models                    # Listar modelos disponíveis
GET  /models/{id}               # Detalhes do modelo

## Moderação
POST /moderations               # Verificar conteúdo`;

  // === GENÉRICO ===
  const genericExample = `// Exemplo de requisição genérica via API Bridge
const response = await fetch('https://seu-apibridge.com/api/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Token': 'ab_SeuTokenDeCliente'
  },
  body: JSON.stringify({
    connectionId: 'conn-minha-api-001',
    method: 'GET',  // ou POST, PUT, PATCH, DELETE
    path: '/seu/endpoint',
    query: {
      param1: 'valor1',
      param2: 'valor2'
    },
    headers: {
      'X-Custom-Header': 'valor-customizado'
    },
    body: {
      // Para POST/PUT/PATCH
      campo1: 'valor1'
    }
  })
});`;

  const genericCurl = `# Requisição GET genérica
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-minha-api-001",
    "method": "GET",
    "path": "/seu/endpoint",
    "query": { "param1": "valor1" }
  }'

# Requisição POST com body
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-minha-api-001",
    "method": "POST",
    "path": "/criar/recurso",
    "body": {
      "nome": "Novo Recurso",
      "descricao": "Descrição do recurso"
    }
  }'

# Requisição PUT para atualizar
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-minha-api-001",
    "method": "PUT",
    "path": "/recursos/123",
    "body": {
      "nome": "Nome Atualizado"
    }
  }'

# Requisição DELETE
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-minha-api-001",
    "method": "DELETE",
    "path": "/recursos/123"
  }'

# Com headers customizados
curl -X POST 'https://seu-apibridge.com/api/proxy' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Client-Token: ab_SeuTokenDeCliente' \\
  -d '{
    "connectionId": "conn-minha-api-001",
    "method": "GET",
    "path": "/endpoint-especial",
    "headers": {
      "X-Custom-Header": "valor-customizado",
      "Accept-Language": "pt-BR"
    }
  }'`;

  return (
    <div className="space-y-8">
      {/* Introdução */}
      <Alert>
        <Plug className="h-4 w-4" />
        <AlertTitle>Como Usar os Provedores</AlertTitle>
        <AlertDescription>
          Após configurar uma conexão no painel, você pode fazer requisições através do endpoint 
          <code className="mx-1 px-2 py-0.5 bg-secondary rounded">/api/proxy</code> 
          usando o token do cliente e o ID da conexão.
        </AlertDescription>
      </Alert>

      {/* Onde encontrar o Connection ID */}
      <Card className="gradient-card border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Onde encontrar o Connection ID?
          </CardTitle>
          <CardDescription>
            O Connection ID é necessário em todas as requisições para o proxy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">1</div>
            <p className="text-sm text-muted-foreground">
              Acesse a página <strong>Conexões</strong> no menu lateral
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">2</div>
            <p className="text-sm text-muted-foreground">
              Cada conexão exibe seu ID no formato <code className="px-1 py-0.5 rounded bg-secondary">conn-1738257600000</code>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">3</div>
            <p className="text-sm text-muted-foreground">
              Clique no ícone <Copy className="w-3 h-3 inline" /> ao lado do ID para copiá-lo
            </p>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Dica:</strong> Ao criar uma nova conexão, o ID é exibido automaticamente em um dialog de sucesso para fácil cópia.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estrutura da Requisição */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Estrutura da Requisição
          </CardTitle>
          <CardDescription>
            Todas as requisições seguem o mesmo padrão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock 
            code={`POST /api/proxy
Headers:
  Content-Type: application/json
  X-Client-Token: ab_SeuTokenDeCliente

Body:
{
  "connectionId": "conn-xxx",     // ID da conexão (copie da página Conexões)
  "method": "GET|POST|PUT|PATCH|DELETE",
  "path": "/endpoint",            // Path relativo à URL base
  "query": { "key": "value" },    // Query params (opcional)
  "headers": { "X-Custom": "..." }, // Headers extras (opcional)
  "body": { ... }                 // Body para POST/PUT/PATCH
}`}
            filename="Estrutura da Requisição"
          />
        </CardContent>
      </Card>

      {/* Yampi */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Yampi</CardTitle>
              <CardDescription>E-commerce brasileiro</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Credenciais Necessárias
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>User Token</strong> - Encontrado em Perfil → Credenciais de API</li>
                <li>• <strong>User Secret Key</strong> - Na mesma página</li>
                <li>• <strong>Alias da Loja</strong> - Identificador único (ex: minha-loja)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                URL Base
              </h4>
              <code className="text-sm bg-secondary px-2 py-1 rounded block">
                https://api.dooki.com.br/v2/{'{alias}'}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                <a 
                  href="https://docs.yampi.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Documentação oficial <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Exemplos de Uso</h4>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="curl" className="gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  cURL
                </TabsTrigger>
                <TabsTrigger value="js" className="gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  JavaScript
                </TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <CodeBlock code={yampiCurl} filename="Terminal" />
              </TabsContent>
              <TabsContent value="js">
                <CodeBlock code={yampiExample} filename="JavaScript" showLineNumbers />
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Endpoints Disponíveis</h4>
            <CodeBlock code={yampiEndpoints} filename="Referência" />
          </div>
        </CardContent>
      </Card>

      {/* Shopify */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Shopify</CardTitle>
              <CardDescription>Plataforma global de e-commerce</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Credenciais Necessárias
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Access Token</strong> - Começa com <code>shpat_</code></li>
                <li>• <strong>Nome da Loja</strong> - Parte antes de .myshopify.com</li>
                <li>• <strong>Versão da API</strong> - Ex: 2024-01</li>
              </ul>
              <Alert className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Crie um Custom App em Settings → Apps → Develop apps para obter o Access Token.
                </AlertDescription>
              </Alert>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                URL Base
              </h4>
              <code className="text-sm bg-secondary px-2 py-1 rounded block">
                https://{'{loja}'}.myshopify.com/admin/api/{'{versão}'}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                <a 
                  href="https://shopify.dev/docs/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Documentação oficial <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Exemplos de Uso</h4>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="curl" className="gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  cURL
                </TabsTrigger>
                <TabsTrigger value="js" className="gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  JavaScript
                </TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <CodeBlock code={shopifyCurl} filename="Terminal" />
              </TabsContent>
              <TabsContent value="js">
                <CodeBlock code={shopifyExample} filename="JavaScript" showLineNumbers />
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Endpoints Disponíveis</h4>
            <CodeBlock code={shopifyEndpoints} filename="Referência" />
          </div>
        </CardContent>
      </Card>

      {/* OpenAI */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>OpenAI</CardTitle>
              <CardDescription>GPT, DALL-E, Whisper e mais</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Credenciais Necessárias
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>API Key</strong> - Começa com <code>sk-</code></li>
                <li>• <strong>Organization ID</strong> (opcional) - Começa com <code>org-</code></li>
              </ul>
              <Alert className="mt-3">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Acesse platform.openai.com → API Keys para criar sua chave.
                </AlertDescription>
              </Alert>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                URL Base
              </h4>
              <code className="text-sm bg-secondary px-2 py-1 rounded block">
                https://api.openai.com/v1
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                <a 
                  href="https://platform.openai.com/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Documentação oficial <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Exemplos de Uso</h4>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="curl" className="gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  cURL
                </TabsTrigger>
                <TabsTrigger value="js" className="gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  JavaScript
                </TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <CodeBlock code={openaiCurl} filename="Terminal" />
              </TabsContent>
              <TabsContent value="js">
                <CodeBlock code={openaiExample} filename="JavaScript" showLineNumbers />
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Endpoints Disponíveis</h4>
            <CodeBlock code={openaiEndpoints} filename="Referência" />
          </div>
        </CardContent>
      </Card>

      {/* API Genérica */}
      <Card className="gradient-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>API Genérica</CardTitle>
              <CardDescription>Qualquer API REST</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Tipos de Autenticação
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Bearer</strong> - Authorization: Bearer [token]</li>
                <li>• <strong>Basic</strong> - Authorization: Basic [base64]</li>
                <li>• <strong>Header Pair</strong> - Dois headers separados</li>
                <li>• <strong>Custom</strong> - Header e template personalizados</li>
                <li>• <strong>Query</strong> - Token via query string</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Restrições de Segurança
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Hosts Permitidos</strong> - Lista de domínios</li>
                <li>• <strong>Prefixos de Path</strong> - Limitar endpoints</li>
                <li>• <strong>Métodos HTTP</strong> - GET, POST, etc.</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Exemplos de Uso</h4>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="mb-2">
                <TabsTrigger value="curl" className="gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  cURL
                </TabsTrigger>
                <TabsTrigger value="js" className="gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  JavaScript
                </TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <CodeBlock code={genericCurl} filename="Terminal" />
              </TabsContent>
              <TabsContent value="js">
                <CodeBlock code={genericExample} filename="JavaScript" showLineNumbers />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Erros Comuns */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Erros Comuns e Soluções
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium">UNAUTHORIZED - Token inválido</p>
            <p className="text-muted-foreground">Verifique se o X-Client-Token está correto e se o cliente está ativo.</p>
          </div>
          <div>
            <p className="font-medium">CONNECTION_NOT_FOUND - Conexão não encontrada</p>
            <p className="text-muted-foreground">Confirme o connectionId e se a conexão está habilitada.</p>
          </div>
          <div>
            <p className="font-medium">PATH_NOT_ALLOWED - Path bloqueado</p>
            <p className="text-muted-foreground">O path não está nos prefixos permitidos da conexão.</p>
          </div>
          <div>
            <p className="font-medium">METHOD_NOT_ALLOWED - Método bloqueado</p>
            <p className="text-muted-foreground">O método HTTP não está habilitado para esta conexão.</p>
          </div>
          <div>
            <p className="font-medium">RATE_LIMITED - Limite excedido</p>
            <p className="text-muted-foreground">Aguarde alguns segundos e tente novamente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <PageHeader 
          title="Documentação" 
          description="Guia completo de instalação e uso dos provedores de API"
        />

        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="providers" className="gap-2">
              <Plug className="w-4 h-4" />
              Provedores de API
            </TabsTrigger>
            <TabsTrigger value="easypanel" className="gap-2">
              <Server className="w-4 h-4" />
              EasyPanel
            </TabsTrigger>
            <TabsTrigger value="docker" className="gap-2">
              <Container className="w-4 h-4" />
              Docker Compose
            </TabsTrigger>
            <TabsTrigger value="vps" className="gap-2">
              <HardDrive className="w-4 h-4" />
              VPS Manual
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-220px)]">
            <TabsContent value="providers" className="mt-0 pr-4">
              <ProvidersTab />
            </TabsContent>
            <TabsContent value="easypanel" className="mt-0 pr-4">
              <EasyPanelTab />
            </TabsContent>
            <TabsContent value="docker" className="mt-0 pr-4">
              <DockerComposeTab />
            </TabsContent>
            <TabsContent value="vps" className="mt-0 pr-4">
              <VPSTab />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </main>
    </div>
  );
}
