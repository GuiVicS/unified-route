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
  HardDrive
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

export function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <PageHeader 
          title="Documentação de Instalação" 
          description="Guia passo a passo para instalar o API Bridge em diferentes plataformas"
        />

        <Tabs defaultValue="easypanel" className="w-full">
          <TabsList className="mb-6">
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
