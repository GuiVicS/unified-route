import React, { useState } from 'react';
import { useSetupStore, DatabaseConfig } from '@/stores/setupStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Database, 
  User, 
  Shield, 
  Server, 
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Container,
  Download,
  Terminal,
  FileCode
} from 'lucide-react';
import { CopyField } from '@/components/ui/copy-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const STEPS = [
  { id: 'welcome', title: 'Bem-vindo', icon: Zap },
  { id: 'deploy', title: 'Tipo de Deploy', icon: Container },
  { id: 'database', title: 'Banco de Dados', icon: Database },
  { id: 'admin', title: 'Conta Admin', icon: User },
  { id: 'security', title: 'Segurança', icon: Shield },
  { id: 'server', title: 'Servidor', icon: Server },
  { id: 'finish', title: 'Finalizar', icon: Check },
];

export function SetupWizard() {
  const {
    currentStep,
    config,
    connectionStatus,
    connectionError,
    migrationStatus,
    nextStep,
    prevStep,
    updateConfig,
    testDatabaseConnection,
    runMigrations,
    completeSetup,
  } = useSetupStore();

  const currentStepData = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-72 gradient-sidebar border-r border-sidebar-border p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">API Bridge</h1>
            <p className="text-xs text-muted-foreground">Assistente de Instalação</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive 
                    ? 'bg-sidebar-accent text-foreground' 
                    : isCompleted
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </div>
                <span className="font-medium">{step.title}</span>
              </div>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground">
            Precisa de ajuda? Veja a{' '}
            <a href="#" className="text-primary hover:underline inline-flex items-center gap-1">
              documentação <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {currentStep === 0 && <WelcomeStep />}
          {currentStep === 1 && <DeployTypeStep />}
          {currentStep === 2 && <DatabaseStep />}
          {currentStep === 3 && <AdminStep />}
          {currentStep === 4 && <SecurityStep />}
          {currentStep === 5 && <ServerStep />}
          {currentStep === 6 && <FinishStep />}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  const { nextStep } = useSetupStore();

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-semibold text-foreground mb-2">Bem-vindo ao API Bridge</h2>
      <p className="text-muted-foreground mb-8">
        Vamos configurar seu proxy universal de APIs. Este assistente irá guiá-lo pelo processo de instalação.
      </p>

      <div className="space-y-4 mb-8">
        <div className="gradient-card border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Container className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Deploy com Docker</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Instalação simples e rápida usando Docker Compose. Ideal para VPS e servidores dedicados.
              </p>
            </div>
          </div>
        </div>

        <div className="gradient-card border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Banco de Dados PostgreSQL</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pode usar o PostgreSQL incluso no Docker ou conectar ao seu banco existente.
              </p>
            </div>
          </div>
        </div>

        <div className="gradient-card border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Segurança Integrada</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Criptografia AES-256 para credenciais, rate limiting e controle de CORS.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-8">
        <div className="flex items-start gap-3">
          <Terminal className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Requisitos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Docker 20.10+ e Docker Compose 2.0+ instalados no servidor.
            </p>
          </div>
        </div>
      </div>

      <Button onClick={nextStep} size="lg">
        Iniciar Configuração
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function DeployTypeStep() {
  const { nextStep, prevStep, config, updateConfig } = useSetupStore();
  const [deployType, setDeployType] = useState<'docker-full' | 'docker-external-db'>('docker-full');

  const handleNext = () => {
    // Store deploy type in config for later use
    updateConfig('server', { ...config.server!, deployType } as any);
    nextStep();
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-foreground mb-2">Tipo de Instalação</h2>
      <p className="text-muted-foreground mb-8">
        Escolha como deseja instalar o API Bridge no seu servidor.
      </p>

      <div className="space-y-4 mb-8">
        <button
          onClick={() => setDeployType('docker-full')}
          className={`w-full text-left gradient-card border rounded-lg p-5 transition-all ${
            deployType === 'docker-full' 
              ? 'border-primary ring-2 ring-primary/20' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              deployType === 'docker-full' ? 'bg-primary text-primary-foreground' : 'bg-primary/20'
            }`}>
              <Container className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Docker Completo (Recomendado)</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Inclui PostgreSQL no container. Ideal para instalações novas e VPS.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs px-2 py-0.5 rounded bg-success/20 text-success">Mais Simples</span>
                <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">Tudo Incluso</span>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setDeployType('docker-external-db')}
          className={`w-full text-left gradient-card border rounded-lg p-5 transition-all ${
            deployType === 'docker-external-db' 
              ? 'border-primary ring-2 ring-primary/20' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              deployType === 'docker-external-db' ? 'bg-primary text-primary-foreground' : 'bg-primary/20'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Docker + PostgreSQL Externo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use seu banco PostgreSQL existente (RDS, Cloud SQL, etc).
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs px-2 py-0.5 rounded bg-warning/20 text-warning">Avançado</span>
                <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">Banco Externo</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {deployType === 'docker-full' && (
        <div className="p-4 rounded-lg bg-success/10 border border-success/20 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Instalação Mais Simples</p>
              <p className="text-sm text-muted-foreground mt-1">
                O PostgreSQL será instalado automaticamente via Docker. Você só precisa definir a senha.
              </p>
            </div>
          </div>
        </div>
      )}

      {deployType === 'docker-external-db' && (
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Configuração Necessária</p>
              <p className="text-sm text-muted-foreground mt-1">
                Você precisará informar as credenciais do seu banco PostgreSQL existente.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleNext}>
          Continuar
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function DatabaseStep() {
  const { 
    config, 
    connectionStatus, 
    connectionError,
    migrationStatus,
    updateConfig, 
    testDatabaseConnection,
    runMigrations,
    nextStep, 
    prevStep 
  } = useSetupStore();

  const db = config.database || {
    host: 'localhost',
    port: 5432,
    database: 'apibridge',
    username: 'postgres',
    password: '',
    ssl: false,
  };

  const updateDb = (field: keyof DatabaseConfig, value: string | number | boolean) => {
    updateConfig('database', { ...db, [field]: value });
  };

  const handleTest = async () => {
    const success = await testDatabaseConnection();
    if (success) {
      await runMigrations();
    }
  };

  const canProceed = connectionStatus === 'success' && migrationStatus === 'success';

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-foreground mb-2">Configuração do Banco de Dados</h2>
      <p className="text-muted-foreground mb-8">
        Conecte ao seu banco de dados PostgreSQL. O API Bridge criará as tabelas necessárias automaticamente.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              value={db.host}
              onChange={(e) => updateDb('host', e.target.value)}
              placeholder="localhost"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Porta</Label>
            <Input
              id="port"
              type="number"
              value={db.port}
              onChange={(e) => updateDb('port', parseInt(e.target.value) || 5432)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="database">Nome do Banco</Label>
          <Input
            id="database"
            value={db.database}
            onChange={(e) => updateDb('database', e.target.value)}
            placeholder="apibridge"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <Input
              id="username"
              value={db.username}
              onChange={(e) => updateDb('username', e.target.value)}
              placeholder="postgres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={db.password}
              onChange={(e) => updateDb('password', e.target.value)}
              placeholder="Digite a senha"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={db.ssl}
            onCheckedChange={(checked) => updateDb('ssl', checked)}
          />
          <Label>Usar conexão SSL</Label>
        </div>

        <div className="gradient-card border border-border rounded-lg p-4">
          <p className="text-xs font-mono text-muted-foreground mb-3">String de Conexão:</p>
          <code className="text-sm text-foreground break-all">
            postgresql://{db.username}:****@{db.host}:{db.port}/{db.database}{db.ssl ? '?sslmode=require' : ''}
          </code>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleTest}
            disabled={connectionStatus === 'testing' || !db.password}
          >
            {connectionStatus === 'testing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Testar Conexão
              </>
            )}
          </Button>

          {connectionStatus === 'success' && (
            <div className="flex items-center gap-2 text-success text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Conectado com sucesso
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <XCircle className="w-4 h-4" />
              {connectionError}
            </div>
          )}
        </div>

        {migrationStatus === 'running' && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <div>
              <p className="text-sm font-medium text-foreground">Executando migrações...</p>
              <p className="text-xs text-muted-foreground">Criando tabelas do banco de dados</p>
            </div>
          </div>
        )}

        {migrationStatus === 'success' && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium text-foreground">Banco de dados pronto</p>
              <p className="text-xs text-muted-foreground">Todas as tabelas foram criadas com sucesso</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={nextStep} disabled={!canProceed}>
          Continuar
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function AdminStep() {
  const { config, updateConfig, nextStep, prevStep } = useSetupStore();
  const [confirmPassword, setConfirmPassword] = useState('');

  const admin = config.admin || { email: '', password: '' };

  const updateAdmin = (field: 'email' | 'password', value: string) => {
    updateConfig('admin', { ...admin, [field]: value });
  };

  const isValid = admin.email && 
    admin.password && 
    admin.password.length >= 8 && 
    admin.password === confirmPassword;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-foreground mb-2">Conta de Administrador</h2>
      <p className="text-muted-foreground mb-8">
        Crie a conta de administrador para acessar o painel do API Bridge.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Endereço de E-mail</Label>
          <Input
            id="email"
            type="email"
            value={admin.email}
            onChange={(e) => updateAdmin('email', e.target.value)}
            placeholder="admin@suaempresa.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="adminPassword">Senha</Label>
          <Input
            id="adminPassword"
            type="password"
            value={admin.password}
            onChange={(e) => updateAdmin('password', e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />
          {admin.password && admin.password.length < 8 && (
            <p className="text-xs text-destructive">A senha deve ter pelo menos 8 caracteres</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme sua senha"
          />
          {confirmPassword && admin.password !== confirmPassword && (
            <p className="text-xs text-destructive">As senhas não coincidem</p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={nextStep} disabled={!isValid}>
          Continuar
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function SecurityStep() {
  const { config, updateConfig, nextStep, prevStep } = useSetupStore();

  const security = config.security || {
    masterKey: '',
    jwtSecret: '',
    sessionSecret: '',
  };

  const regenerateKey = (field: 'masterKey' | 'jwtSecret' | 'sessionSecret') => {
    const length = field === 'jwtSecret' ? 64 : 32;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    updateConfig('security', { ...security, [field]: result });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-foreground mb-2">Chaves de Segurança</h2>
      <p className="text-muted-foreground mb-8">
        Estas chaves são usadas para criptografar credenciais e proteger sessões. Guarde-as em segurança!
      </p>

      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Importante</p>
            <p className="text-sm text-muted-foreground mt-1">
              Salve estas chaves em local seguro. Se você perder a Chave Mestra, as credenciais criptografadas não poderão ser recuperadas.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Chave Mestra (criptografia AES-256)</Label>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => regenerateKey('masterKey')}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerar
            </Button>
          </div>
          <CopyField value={security.masterKey} />
          <p className="text-xs text-muted-foreground">Usada para criptografar credenciais de API em repouso</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Segredo JWT</Label>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => regenerateKey('jwtSecret')}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerar
            </Button>
          </div>
          <CopyField value={security.jwtSecret} />
          <p className="text-xs text-muted-foreground">Usado para assinar tokens de autenticação</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Segredo de Sessão</Label>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => regenerateKey('sessionSecret')}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerar
            </Button>
          </div>
          <CopyField value={security.sessionSecret} />
          <p className="text-xs text-muted-foreground">Usado para cookies de sessão seguros</p>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={nextStep}>
          Continuar
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function ServerStep() {
  const { config, updateConfig, nextStep, prevStep } = useSetupStore();
  const [originInput, setOriginInput] = useState('');

  const server = config.server || {
    baseUrl: '',
    port: 3000,
    corsOrigins: [],
    rateLimitPerMin: 60,
    upstreamTimeoutMs: 15000,
  };

  // Ensure corsOrigins is always an array
  const corsOrigins = server.corsOrigins || [];

  const updateServer = (field: keyof typeof server, value: any) => {
    updateConfig('server', { ...server, [field]: value });
  };

  const addOrigin = () => {
    if (originInput && !corsOrigins.includes(originInput)) {
      updateServer('corsOrigins', [...corsOrigins, originInput]);
      setOriginInput('');
    }
  };

  const removeOrigin = (origin: string) => {
    updateServer('corsOrigins', corsOrigins.filter(o => o !== origin));
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-foreground mb-2">Configuração do Servidor</h2>
      <p className="text-muted-foreground mb-8">
        Configure as opções do servidor, CORS e limite de requisições.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="baseUrl">URL Pública (opcional)</Label>
          <Input
            id="baseUrl"
            value={server.baseUrl}
            onChange={(e) => updateServer('baseUrl', e.target.value)}
            placeholder="https://api.suaempresa.com"
          />
          <p className="text-xs text-muted-foreground">A URL pública onde o API Bridge será acessível</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="port">Porta do Servidor</Label>
            <Input
              id="port"
              type="number"
              value={server.port}
              onChange={(e) => updateServer('port', parseInt(e.target.value) || 3000)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rateLimit">Limite de Requisições (req/min)</Label>
            <Input
              id="rateLimit"
              type="number"
              value={server.rateLimitPerMin}
              onChange={(e) => updateServer('rateLimitPerMin', parseInt(e.target.value) || 60)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeout">Timeout Upstream (ms)</Label>
          <Input
            id="timeout"
            type="number"
            value={server.upstreamTimeoutMs}
            onChange={(e) => updateServer('upstreamTimeoutMs', parseInt(e.target.value) || 15000)}
          />
          <p className="text-xs text-muted-foreground">Tempo máximo de espera por respostas das APIs upstream</p>
        </div>

        <div className="space-y-3">
          <Label>Origens CORS Permitidas</Label>
          <div className="flex gap-2">
            <Input
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value)}
              placeholder="https://app.suaempresa.com"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOrigin())}
            />
            <Button variant="outline" onClick={addOrigin}>Adicionar</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {corsOrigins.map(origin => (
              <div key={origin} className="flex items-center gap-1 px-2 py-1 rounded bg-secondary text-sm">
                <code className="text-xs">{origin}</code>
                <button 
                  onClick={() => removeOrigin(origin)}
                  className="ml-1 p-0.5 rounded hover:bg-background/50"
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={nextStep}>
          Continuar
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function FinishStep() {
  const { config, prevStep, completeSetup } = useSetupStore();
  const [copied, setCopied] = useState<string | null>(null);

  const isDockerFull = (config.server as any)?.deployType !== 'docker-external-db';

  const envContent = `# ===========================================
# API Bridge - Variáveis de Ambiente
# ===========================================
# Gerado em: ${new Date().toLocaleString('pt-BR')}

# ==========================================
# BANCO DE DADOS
# ==========================================
DATABASE_USER=${config.database?.username || 'apibridge'}
DATABASE_PASSWORD=${config.database?.password || ''}
DATABASE_NAME=${config.database?.database || 'apibridge'}
${!isDockerFull ? `DATABASE_HOST=${config.database?.host || 'localhost'}
DATABASE_PORT=${config.database?.port || 5432}
DATABASE_SSL=${config.database?.ssl || false}` : '# Usando PostgreSQL do Docker (host: postgres)'}

# ==========================================
# SEGURANÇA (NÃO COMPARTILHE!)
# ==========================================
MASTER_KEY=${config.security?.masterKey || ''}
JWT_SECRET=${config.security?.jwtSecret || ''}
SESSION_SECRET=${config.security?.sessionSecret || ''}

# ==========================================
# ADMINISTRADOR
# ==========================================
ADMIN_EMAIL=${config.admin?.email || ''}
ADMIN_PASSWORD=${config.admin?.password || ''}

# ==========================================
# SERVIDOR
# ==========================================
PORT=${config.server?.port || 3000}
BASE_URL=${config.server?.baseUrl || ''}
RATE_LIMIT_PER_MIN=${config.server?.rateLimitPerMin || 60}
UPSTREAM_TIMEOUT_MS=${config.server?.upstreamTimeoutMs || 15000}
CORS_ORIGINS=${config.server?.corsOrigins?.join(',') || ''}
`;

  const dockerComposeContent = isDockerFull ? `# docker-compose.yml - API Bridge
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: apibridge-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${DATABASE_USER}
      POSTGRES_PASSWORD: \${DATABASE_PASSWORD}
      POSTGRES_DB: \${DATABASE_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DATABASE_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  apibridge:
    build: .
    container_name: apibridge-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "\${PORT:-3000}:3000"
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: \${DATABASE_NAME}
      DATABASE_USER: \${DATABASE_USER}
      DATABASE_PASSWORD: \${DATABASE_PASSWORD}
      DATABASE_SSL: "false"
      MASTER_KEY: \${MASTER_KEY}
      JWT_SECRET: \${JWT_SECRET}
      SESSION_SECRET: \${SESSION_SECRET}
      PORT: 3000
      BASE_URL: \${BASE_URL}
      RATE_LIMIT_PER_MIN: \${RATE_LIMIT_PER_MIN}
      UPSTREAM_TIMEOUT_MS: \${UPSTREAM_TIMEOUT_MS}
      CORS_ORIGINS: \${CORS_ORIGINS}
      ADMIN_EMAIL: \${ADMIN_EMAIL}
      ADMIN_PASSWORD: \${ADMIN_PASSWORD}
    volumes:
      - app_data:/app/data

volumes:
  postgres_data:
  app_data:
` : `# docker-compose.yml - API Bridge (Banco Externo)
version: '3.8'

services:
  apibridge:
    build: .
    container_name: apibridge-app
    restart: unless-stopped
    ports:
      - "\${PORT:-3000}:3000"
    environment:
      DATABASE_HOST: \${DATABASE_HOST}
      DATABASE_PORT: \${DATABASE_PORT}
      DATABASE_NAME: \${DATABASE_NAME}
      DATABASE_USER: \${DATABASE_USER}
      DATABASE_PASSWORD: \${DATABASE_PASSWORD}
      DATABASE_SSL: \${DATABASE_SSL}
      MASTER_KEY: \${MASTER_KEY}
      JWT_SECRET: \${JWT_SECRET}
      SESSION_SECRET: \${SESSION_SECRET}
      PORT: 3000
      BASE_URL: \${BASE_URL}
      RATE_LIMIT_PER_MIN: \${RATE_LIMIT_PER_MIN}
      UPSTREAM_TIMEOUT_MS: \${UPSTREAM_TIMEOUT_MS}
      CORS_ORIGINS: \${CORS_ORIGINS}
      ADMIN_EMAIL: \${ADMIN_EMAIL}
      ADMIN_PASSWORD: \${ADMIN_PASSWORD}
    volumes:
      - app_data:/app/data

volumes:
  app_data:
`;

  const installCommands = `# 1. Baixe os arquivos do projeto
git clone https://github.com/seu-usuario/api-bridge.git
cd api-bridge

# 2. Crie o arquivo .env com as variáveis acima
nano .env

# 3. Inicie os containers
docker compose up -d

# 4. Verifique os logs
docker compose logs -f

# 5. Acesse o painel
# http://localhost:${config.server?.port || 3000}
`;

  const handleCopy = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Configuração Concluída</h2>
          <p className="text-muted-foreground">Seu API Bridge está pronto para deploy</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Resumo */}
        <div className="gradient-card border border-border rounded-lg p-5">
          <h3 className="font-medium text-foreground mb-3">Resumo da Configuração</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tipo de Deploy</dt>
              <dd className="text-foreground">
                {isDockerFull ? 'Docker Completo (com PostgreSQL)' : 'Docker + Banco Externo'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Banco de Dados</dt>
              <dd className="text-foreground font-mono text-xs">
                {isDockerFull 
                  ? `postgres:5432/${config.database?.database}` 
                  : `${config.database?.host}:${config.database?.port}/${config.database?.database}`
                }
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">E-mail do Admin</dt>
              <dd className="text-foreground">{config.admin?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Porta</dt>
              <dd className="text-foreground">{config.server?.port}</dd>
            </div>
          </dl>
        </div>

        {/* Tabs com arquivos */}
        <Tabs defaultValue="env" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="env" className="text-xs">
              <FileCode className="w-3 h-3 mr-1" />
              .env
            </TabsTrigger>
            <TabsTrigger value="compose" className="text-xs">
              <Container className="w-3 h-3 mr-1" />
              docker-compose.yml
            </TabsTrigger>
            <TabsTrigger value="commands" className="text-xs">
              <Terminal className="w-3 h-3 mr-1" />
              Comandos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="env" className="mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Arquivo .env</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(envContent, 'env')}
                >
                  {copied === 'env' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied === 'env' ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              <div className="rounded-lg bg-secondary/50 border border-border p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                  {envContent}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compose" className="mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">docker-compose.yml</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(dockerComposeContent, 'compose')}
                >
                  {copied === 'compose' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied === 'compose' ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              <div className="rounded-lg bg-secondary/50 border border-border p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                  {dockerComposeContent}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="commands" className="mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Comandos de Instalação</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(installCommands, 'commands')}
                >
                  {copied === 'commands' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied === 'commands' ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              <div className="rounded-lg bg-secondary/50 border border-border p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                  {installCommands}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Próximos passos */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Próximos Passos
          </h4>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
            <li>Copie o arquivo <code className="text-primary">.env</code> para seu servidor</li>
            <li>Copie o <code className="text-primary">docker-compose.yml</code> para o mesmo diretório</li>
            <li>Execute <code className="text-primary">docker compose up -d</code></li>
            <li>Acesse o painel e crie sua primeira conexão</li>
          </ol>
        </div>

        {/* Aviso de segurança */}
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Importante</p>
              <p className="text-sm text-muted-foreground mt-1">
                Guarde as chaves de segurança em local seguro. Se você perder a Chave Mestra, 
                as credenciais criptografadas não poderão ser recuperadas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={completeSetup}>
          <Check className="w-4 h-4 mr-2" />
          Concluir e Acessar Painel
        </Button>
      </div>
    </div>
  );
}
