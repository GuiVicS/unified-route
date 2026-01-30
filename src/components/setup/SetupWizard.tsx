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
  ExternalLink
} from 'lucide-react';
import { CopyField } from '@/components/ui/copy-button';

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Zap },
  { id: 'database', title: 'Database', icon: Database },
  { id: 'admin', title: 'Admin Account', icon: User },
  { id: 'security', title: 'Security', icon: Shield },
  { id: 'server', title: 'Server', icon: Server },
  { id: 'finish', title: 'Finish', icon: Check },
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
            <p className="text-xs text-muted-foreground">Setup Wizard</p>
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
            Need help? Check the{' '}
            <a href="#" className="text-primary hover:underline inline-flex items-center gap-1">
              documentation <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {currentStep === 0 && <WelcomeStep />}
          {currentStep === 1 && <DatabaseStep />}
          {currentStep === 2 && <AdminStep />}
          {currentStep === 3 && <SecurityStep />}
          {currentStep === 4 && <ServerStep />}
          {currentStep === 5 && <FinishStep />}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  const { nextStep } = useSetupStore();

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-semibold text-foreground mb-2">Welcome to API Bridge</h2>
      <p className="text-muted-foreground mb-8">
        Let's configure your universal API proxy. This wizard will guide you through the setup process.
      </p>

      <div className="space-y-4 mb-8">
        <div className="gradient-card border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">PostgreSQL Database</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Connect to your PostgreSQL database where API Bridge will store connections, clients, and logs.
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
              <h3 className="font-medium text-foreground">Security Keys</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Generate encryption keys for securing your API credentials at rest.
              </p>
            </div>
          </div>
        </div>

        <div className="gradient-card border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Server Configuration</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure CORS, rate limiting, and other server settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Before you begin</p>
            <p className="text-sm text-muted-foreground mt-1">
              Make sure you have a PostgreSQL database ready and accessible from this server.
            </p>
          </div>
        </div>
      </div>

      <Button onClick={nextStep} size="lg">
        Start Setup
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
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
      <h2 className="text-2xl font-semibold text-foreground mb-2">Database Configuration</h2>
      <p className="text-muted-foreground mb-8">
        Connect to your PostgreSQL database. API Bridge will create the necessary tables automatically.
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
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              value={db.port}
              onChange={(e) => updateDb('port', parseInt(e.target.value) || 5432)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="database">Database Name</Label>
          <Input
            id="database"
            value={db.database}
            onChange={(e) => updateDb('database', e.target.value)}
            placeholder="apibridge"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={db.username}
              onChange={(e) => updateDb('username', e.target.value)}
              placeholder="postgres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={db.password}
              onChange={(e) => updateDb('password', e.target.value)}
              placeholder="Enter password"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={db.ssl}
            onCheckedChange={(checked) => updateDb('ssl', checked)}
          />
          <Label>Use SSL connection</Label>
        </div>

        <div className="gradient-card border border-border rounded-lg p-4">
          <p className="text-xs font-mono text-muted-foreground mb-3">Connection String Preview:</p>
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
                Testing...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>

          {connectionStatus === 'success' && (
            <div className="flex items-center gap-2 text-success text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Connected successfully
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
              <p className="text-sm font-medium text-foreground">Running migrations...</p>
              <p className="text-xs text-muted-foreground">Creating database tables</p>
            </div>
          </div>
        )}

        {migrationStatus === 'success' && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium text-foreground">Database ready</p>
              <p className="text-xs text-muted-foreground">All tables created successfully</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!canProceed}>
          Continue
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
      <h2 className="text-2xl font-semibold text-foreground mb-2">Admin Account</h2>
      <p className="text-muted-foreground mb-8">
        Create the administrator account for accessing the API Bridge panel.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={admin.email}
            onChange={(e) => updateAdmin('email', e.target.value)}
            placeholder="admin@yourcompany.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="adminPassword">Password</Label>
          <Input
            id="adminPassword"
            type="password"
            value={admin.password}
            onChange={(e) => updateAdmin('password', e.target.value)}
            placeholder="Minimum 8 characters"
          />
          {admin.password && admin.password.length < 8 && (
            <p className="text-xs text-destructive">Password must be at least 8 characters</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
          {confirmPassword && admin.password !== confirmPassword && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid}>
          Continue
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
      <h2 className="text-2xl font-semibold text-foreground mb-2">Security Keys</h2>
      <p className="text-muted-foreground mb-8">
        These keys are used to encrypt credentials and secure sessions. Keep them safe!
      </p>

      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Important</p>
            <p className="text-sm text-muted-foreground mt-1">
              Save these keys securely. If you lose the Master Key, encrypted credentials cannot be recovered.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Master Key (AES-256 encryption)</Label>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => regenerateKey('masterKey')}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          </div>
          <CopyField value={security.masterKey} />
          <p className="text-xs text-muted-foreground">Used to encrypt API credentials at rest</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>JWT Secret</Label>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => regenerateKey('jwtSecret')}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          </div>
          <CopyField value={security.jwtSecret} />
          <p className="text-xs text-muted-foreground">Used to sign authentication tokens</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Session Secret</Label>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => regenerateKey('sessionSecret')}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          </div>
          <CopyField value={security.sessionSecret} />
          <p className="text-xs text-muted-foreground">Used for secure cookie sessions</p>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep}>
          Continue
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

  const updateServer = (field: keyof typeof server, value: any) => {
    updateConfig('server', { ...server, [field]: value });
  };

  const addOrigin = () => {
    if (originInput && !server.corsOrigins.includes(originInput)) {
      updateServer('corsOrigins', [...server.corsOrigins, originInput]);
      setOriginInput('');
    }
  };

  const removeOrigin = (origin: string) => {
    updateServer('corsOrigins', server.corsOrigins.filter(o => o !== origin));
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold text-foreground mb-2">Server Configuration</h2>
      <p className="text-muted-foreground mb-8">
        Configure server settings, CORS, and rate limiting.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="baseUrl">Public URL (optional)</Label>
          <Input
            id="baseUrl"
            value={server.baseUrl}
            onChange={(e) => updateServer('baseUrl', e.target.value)}
            placeholder="https://api.yourcompany.com"
          />
          <p className="text-xs text-muted-foreground">The public URL where API Bridge is accessible</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="port">Server Port</Label>
            <Input
              id="port"
              type="number"
              value={server.port}
              onChange={(e) => updateServer('port', parseInt(e.target.value) || 3000)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rateLimit">Rate Limit (req/min)</Label>
            <Input
              id="rateLimit"
              type="number"
              value={server.rateLimitPerMin}
              onChange={(e) => updateServer('rateLimitPerMin', parseInt(e.target.value) || 60)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeout">Upstream Timeout (ms)</Label>
          <Input
            id="timeout"
            type="number"
            value={server.upstreamTimeoutMs}
            onChange={(e) => updateServer('upstreamTimeoutMs', parseInt(e.target.value) || 15000)}
          />
          <p className="text-xs text-muted-foreground">Maximum time to wait for upstream API responses</p>
        </div>

        <div className="space-y-3">
          <Label>CORS Allowed Origins</Label>
          <div className="flex gap-2">
            <Input
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value)}
              placeholder="https://app.yourcompany.com"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOrigin())}
            />
            <Button variant="outline" onClick={addOrigin}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {server.corsOrigins.map(origin => (
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
          Back
        </Button>
        <Button onClick={nextStep}>
          Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function FinishStep() {
  const { config, prevStep, completeSetup } = useSetupStore();

  const envContent = `# API Bridge Configuration
# Generated: ${new Date().toISOString()}

# Database
DATABASE_HOST=${config.database?.host || 'localhost'}
DATABASE_PORT=${config.database?.port || 5432}
DATABASE_NAME=${config.database?.database || 'apibridge'}
DATABASE_USER=${config.database?.username || 'postgres'}
DATABASE_PASSWORD=${config.database?.password || ''}
DATABASE_SSL=${config.database?.ssl || false}

# Security (KEEP THESE SECRET!)
MASTER_KEY=${config.security?.masterKey || ''}
JWT_SECRET=${config.security?.jwtSecret || ''}
SESSION_SECRET=${config.security?.sessionSecret || ''}

# Server
PORT=${config.server?.port || 3000}
BASE_URL=${config.server?.baseUrl || ''}
RATE_LIMIT_PER_MIN=${config.server?.rateLimitPerMin || 60}
UPSTREAM_TIMEOUT_MS=${config.server?.upstreamTimeoutMs || 15000}
CORS_ORIGINS=${config.server?.corsOrigins?.join(',') || ''}

# Admin (initial setup only)
ADMIN_EMAIL=${config.admin?.email || ''}
ADMIN_PASSWORD=${config.admin?.password || ''}
`;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Setup Complete</h2>
          <p className="text-muted-foreground">Your API Bridge is ready to use</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="gradient-card border border-border rounded-lg p-5">
          <h3 className="font-medium text-foreground mb-3">Configuration Summary</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Database</dt>
              <dd className="text-foreground font-mono">
                {config.database?.host}:{config.database?.port}/{config.database?.database}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Admin Email</dt>
              <dd className="text-foreground">{config.admin?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Server Port</dt>
              <dd className="text-foreground">{config.server?.port}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Rate Limit</dt>
              <dd className="text-foreground">{config.server?.rateLimitPerMin} req/min</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Environment Variables</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(envContent);
              }}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy .env
            </Button>
          </div>
          <div className="rounded-lg bg-secondary/50 border border-border p-4 max-h-64 overflow-y-auto">
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {envContent}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground">
            Save this as <code className="text-foreground">.env</code> file in your server directory.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <h4 className="font-medium text-foreground mb-2">Next Steps</h4>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
            <li>Save the environment variables to your server</li>
            <li>Start the API Bridge backend service</li>
            <li>Create your first API connection</li>
            <li>Generate client tokens for your applications</li>
          </ol>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={completeSetup}>
          <Check className="w-4 h-4 mr-2" />
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
