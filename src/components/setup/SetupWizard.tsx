import React, { useState } from 'react';
import { useSetupStore } from '@/stores/setupStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  User, 
  Shield, 
  Check,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { CopyField } from '@/components/ui/copy-button';

const STEPS = [
  { id: 'welcome', title: 'Bem-vindo', icon: Zap },
  { id: 'admin', title: 'Conta Admin', icon: User },
  { id: 'security', title: 'Segurança', icon: Shield },
  { id: 'settings', title: 'Configurações', icon: Settings },
  { id: 'finish', title: 'Finalizar', icon: Check },
];

export function SetupWizard() {
  const { currentStep } = useSetupStore();

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
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {currentStep === 0 && <WelcomeStep />}
          {currentStep === 1 && <AdminStep />}
          {currentStep === 2 && <SecurityStep />}
          {currentStep === 3 && <SettingsStep />}
          {currentStep === 4 && <FinishStep />}
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
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Conta de Administrador</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Crie sua conta para acessar o painel de controle.
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
              <h3 className="font-medium text-foreground">Chaves de Segurança</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Chaves geradas automaticamente para proteger suas credenciais.
              </p>
            </div>
          </div>
        </div>

        <div className="gradient-card border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Configurações do Sistema</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Defina limite de requisições e outras configurações.
              </p>
            </div>
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
        Estas chaves são usadas para criptografar credenciais e proteger sessões.
      </p>

      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Importante</p>
            <p className="text-sm text-muted-foreground mt-1">
              Estas chaves são geradas automaticamente e armazenadas com segurança no sistema.
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
          <p className="text-xs text-muted-foreground">Usada para criptografar credenciais de API</p>
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

function SettingsStep() {
  const { config, updateConfig, nextStep, prevStep } = useSetupStore();

  const server = config.server || {
    baseUrl: '',
    port: 3000,
    corsOrigins: [],
    rateLimitPerMin: 60,
    upstreamTimeoutMs: 15000,
  };

  const updateServer = (field: string, value: number) => {
    updateConfig('server', { ...server, [field]: value });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-foreground mb-2">Configurações do Sistema</h2>
      <p className="text-muted-foreground mb-8">
        Configure os limites e comportamentos padrão do sistema.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="rateLimit">Limite de Requisições (por minuto)</Label>
          <Input
            id="rateLimit"
            type="number"
            value={server.rateLimitPerMin}
            onChange={(e) => updateServer('rateLimitPerMin', parseInt(e.target.value) || 60)}
          />
          <p className="text-xs text-muted-foreground">
            Número máximo de requisições por cliente por minuto
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeout">Timeout de Requisição (ms)</Label>
          <Input
            id="timeout"
            type="number"
            value={server.upstreamTimeoutMs}
            onChange={(e) => updateServer('upstreamTimeoutMs', parseInt(e.target.value) || 15000)}
          />
          <p className="text-xs text-muted-foreground">
            Tempo máximo de espera por respostas das APIs upstream
          </p>
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
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    completeSetup();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
          <Check className="w-6 h-6 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Pronto para Começar!</h2>
          <p className="text-muted-foreground">Revise suas configurações e finalize a instalação</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Resumo */}
        <div className="gradient-card border border-border rounded-lg p-5">
          <h3 className="font-medium text-foreground mb-3">Resumo da Configuração</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">E-mail do Administrador</dt>
              <dd className="text-foreground">{config.admin?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Limite de Requisições</dt>
              <dd className="text-foreground">{config.server?.rateLimitPerMin} req/min</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Timeout</dt>
              <dd className="text-foreground">{config.server?.upstreamTimeoutMs}ms</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Chaves de Segurança</dt>
              <dd className="text-success">✓ Configuradas</dd>
            </div>
          </dl>
        </div>

        {/* Próximos passos */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <h4 className="font-medium text-foreground mb-2">Após a instalação você poderá:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Criar conexões com provedores de API (OpenAI, Shopify, etc)</li>
            <li>Gerar chaves de cliente para seus aplicativos</li>
            <li>Monitorar requisições e logs</li>
            <li>Configurar regras de segurança e rate limiting</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={prevStep} disabled={isCompleting}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleComplete} disabled={isCompleting}>
          {isCompleting ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Concluir Instalação
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
