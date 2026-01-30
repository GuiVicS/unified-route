import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConnectionFormData, HttpMethod } from '@/types/api-bridge';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Store, 
  Key,
  Link,
  ShieldCheck,
  Zap,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import {
  validateYampiCredentials,
  testYampiConnection,
  YAMPI_API_BASE,
  YAMPI_RECOMMENDED_PATHS,
  YAMPI_ALLOWED_METHODS,
  type YampiCredentials,
} from '@/lib/providers/yampi';

interface YampiConnectionFormProps {
  onSubmit: (data: ConnectionFormData) => Promise<void>;
  onCancel: () => void;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export function YampiConnectionForm({ onSubmit, onCancel }: YampiConnectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    user?: { name: string; email: string };
    merchants?: Array<{ alias: string; name: string; active: boolean }>;
    latencyMs?: number;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    merchantAlias: '',
    userToken: '',
    userSecretKey: '',
    enabled: true,
    allowedMethods: [...YAMPI_ALLOWED_METHODS] as HttpMethod[],
  });

  // Real-time validation
  useEffect(() => {
    const validation = validateYampiCredentials({
      userToken: formData.userToken,
      userSecretKey: formData.userSecretKey,
      merchantAlias: formData.merchantAlias,
    });
    setValidationErrors(validation.errors);
  }, [formData.userToken, formData.userSecretKey, formData.merchantAlias]);

  const handleTestConnection = async () => {
    const credentials: YampiCredentials = {
      userToken: formData.userToken,
      userSecretKey: formData.userSecretKey,
      merchantAlias: formData.merchantAlias,
    };

    const validation = validateYampiCredentials(credentials);
    if (!validation.valid) {
      setTestResult({
        success: false,
        message: validation.errors.join('. '),
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testYampiConnection(credentials);

      if (result.success) {
        setTestResult({
          success: true,
          message: `Conexão bem-sucedida em ${result.latencyMs}ms`,
          user: result.user ? { name: result.user.name, email: result.user.email } : undefined,
          merchants: result.user?.merchants,
          latencyMs: result.latencyMs,
        });
        
        // Auto-fill name if empty
        if (!formData.name && result.user?.merchants) {
          const merchant = result.user.merchants.find(m => m.alias === formData.merchantAlias);
          if (merchant) {
            setFormData(prev => ({ ...prev, name: `Yampi - ${merchant.name}` }));
          }
        }
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Falha na conexão',
          latencyMs: result.latencyMs,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateYampiCredentials({
      userToken: formData.userToken,
      userSecretKey: formData.userSecretKey,
      merchantAlias: formData.merchantAlias,
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    if (!formData.name.trim()) {
      setValidationErrors(['Nome da conexão é obrigatório']);
      return;
    }

    setIsSubmitting(true);

    try {
      // Build the connection data with Yampi-specific config
      const connectionData: ConnectionFormData = {
        name: formData.name,
        providerType: 'YAMPI',
        baseUrl: `${YAMPI_API_BASE}/${formData.merchantAlias}`,
        authScheme: 'HEADER_PAIR',
        apiKey: formData.userToken,
        secret: formData.userSecretKey,
        allowedHosts: ['api.dooki.com.br'],
        allowedPathPrefixes: YAMPI_RECOMMENDED_PATHS,
        allowedMethods: formData.allowedMethods,
        enabled: formData.enabled,
        extraHeaders: {
          'Content-Type': 'application/json',
        },
      };

      await onSubmit(connectionData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMethod = (method: HttpMethod) => {
    setFormData(prev => ({
      ...prev,
      allowedMethods: prev.allowedMethods.includes(method)
        ? prev.allowedMethods.filter(m => m !== method)
        : [...prev.allowedMethods, method],
    }));
  };

  const isFormValid = validationErrors.length === 0 && 
    formData.name.trim() && 
    formData.merchantAlias.trim() &&
    formData.userToken.trim() &&
    formData.userSecretKey.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Yampi E-commerce</h3>
          <p className="text-sm text-muted-foreground">Conecte sua loja Yampi para gerenciar pedidos, produtos e clientes</p>
        </div>
      </div>

      {/* Documentation Link */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          Para obter suas credenciais, acesse o painel da Yampi:{' '}
          <span className="font-medium">Perfil → Credenciais de API</span>.{' '}
          <a 
            href="https://docs.yampi.com.br/auth/auth-user-token" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
          >
            Ver documentação <ExternalLink className="w-3 h-3" />
          </a>
        </AlertDescription>
      </Alert>

      {/* Connection Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Conexão</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="ex: Yampi - Minha Loja"
          required
        />
        <p className="text-xs text-muted-foreground">Um nome amigável para identificar esta conexão</p>
      </div>

      {/* Merchant Alias */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Link className="w-4 h-4" />
            Identificação da Loja
          </CardTitle>
          <CardDescription>O alias é o identificador único da sua loja na Yampi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="merchantAlias">Alias da Loja</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">api.dooki.com.br/v2/</span>
              <Input
                id="merchantAlias"
                value={formData.merchantAlias}
                onChange={(e) => setFormData(prev => ({ ...prev, merchantAlias: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                placeholder="minha-loja"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Encontre o alias na URL do painel admin ou nos dados do endpoint /auth/me
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Key className="w-4 h-4" />
            Credenciais de API
          </CardTitle>
          <CardDescription>Headers obrigatórios: User-Token e User-Secret-Key</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userToken">User Token</Label>
            <Input
              id="userToken"
              type="password"
              value={formData.userToken}
              onChange={(e) => setFormData(prev => ({ ...prev, userToken: e.target.value }))}
              placeholder="••••••••••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userSecretKey">User Secret Key</Label>
            <Input
              id="userSecretKey"
              type="password"
              value={formData.userSecretKey}
              onChange={(e) => setFormData(prev => ({ ...prev, userSecretKey: e.target.value }))}
              placeholder="••••••••••••••••"
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Connection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Testar Conexão
          </CardTitle>
          <CardDescription>Valide suas credenciais antes de salvar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTesting || validationErrors.length > 0}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando conexão...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Testar Credenciais
              </>
            )}
          </Button>

          {testResult && (
            <Alert variant={testResult.success ? 'default' : 'destructive'} className={testResult.success ? 'border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900' : ''}>
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription className="space-y-2">
                <p className={testResult.success ? 'text-green-700 dark:text-green-400' : ''}>
                  {testResult.message}
                </p>
                {testResult.user && (
                  <p className="text-xs text-muted-foreground">
                    Usuário: {testResult.user.name} ({testResult.user.email})
                  </p>
                )}
                {testResult.merchants && testResult.merchants.length > 0 && (
                  <div className="text-xs">
                    <p className="text-muted-foreground mb-1">Lojas disponíveis:</p>
                    <div className="flex flex-wrap gap-1">
                      {testResult.merchants.map(m => (
                        <Badge 
                          key={m.alias} 
                          variant={m.alias === formData.merchantAlias ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {m.name} ({m.alias})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Configurações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Conexão Ativa</Label>
              <p className="text-xs text-muted-foreground">Desative para pausar temporariamente</p>
            </div>
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Métodos HTTP Permitidos</Label>
            <div className="flex flex-wrap gap-2">
              {HTTP_METHODS.map(method => (
                <Badge
                  key={method}
                  variant={formData.allowedMethods.includes(method) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleMethod(method)}
                >
                  {method}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Paths Pré-configurados</Label>
            <div className="flex flex-wrap gap-1">
              {YAMPI_RECOMMENDED_PATHS.map(path => (
                <Badge key={path} variant="secondary" className="text-xs">
                  {path}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Apenas estes prefixos de path serão permitidos nas requisições
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !isFormValid}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Criar Conexão Yampi
        </Button>
      </div>
    </form>
  );
}
