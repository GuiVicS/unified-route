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
  Brain, 
  Key,
  ShieldCheck,
  Zap,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import {
  validateOpenAICredentials,
  testOpenAIConnection,
  OPENAI_API_BASE,
  OPENAI_RECOMMENDED_PATHS,
  OPENAI_ALLOWED_METHODS,
  type OpenAICredentials,
} from '@/lib/providers/openai';

interface OpenAIConnectionFormProps {
  onSubmit: (data: ConnectionFormData) => Promise<void>;
  onCancel: () => void;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'DELETE'];

export function OpenAIConnectionForm({ onSubmit, onCancel }: OpenAIConnectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    models?: string[];
    latencyMs?: number;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
    organizationId: '',
    enabled: true,
    allowedMethods: [...OPENAI_ALLOWED_METHODS] as HttpMethod[],
  });

  // Real-time validation
  useEffect(() => {
    const validation = validateOpenAICredentials({
      apiKey: formData.apiKey,
      organizationId: formData.organizationId || undefined,
    });
    setValidationErrors(validation.errors);
  }, [formData.apiKey, formData.organizationId]);

  const handleTestConnection = async () => {
    const credentials: OpenAICredentials = {
      apiKey: formData.apiKey,
      organizationId: formData.organizationId || undefined,
    };

    const validation = validateOpenAICredentials(credentials);
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
      const result = await testOpenAIConnection(credentials);

      if (result.success) {
        setTestResult({
          success: true,
          message: `Conexão bem-sucedida em ${result.latencyMs}ms`,
          models: result.models,
          latencyMs: result.latencyMs,
        });
        
        // Auto-fill name if empty
        if (!formData.name) {
          setFormData(prev => ({ 
            ...prev, 
            name: formData.organizationId 
              ? `OpenAI - ${formData.organizationId}` 
              : 'OpenAI API' 
          }));
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
    
    const validation = validateOpenAICredentials({
      apiKey: formData.apiKey,
      organizationId: formData.organizationId || undefined,
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
      const extraHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (formData.organizationId) {
        extraHeaders['OpenAI-Organization'] = formData.organizationId;
      }

      const connectionData: ConnectionFormData = {
        name: formData.name,
        providerType: 'OPENAI',
        baseUrl: OPENAI_API_BASE,
        authScheme: 'BEARER',
        apiKey: formData.apiKey,
        allowedHosts: ['api.openai.com'],
        allowedPathPrefixes: OPENAI_RECOMMENDED_PATHS,
        allowedMethods: formData.allowedMethods,
        enabled: formData.enabled,
        extraHeaders,
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
    formData.apiKey.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">OpenAI</h3>
          <p className="text-sm text-muted-foreground">Conecte à API da OpenAI para GPT, DALL-E, Whisper e mais</p>
        </div>
      </div>

      {/* Documentation Link */}
      <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-900">
        <AlertCircle className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-sm">
          Para obter sua API Key, acesse o painel da OpenAI:{' '}
          <span className="font-medium">API Keys → Create new secret key</span>.{' '}
          <a 
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-purple-600 hover:underline"
          >
            Ver API Keys <ExternalLink className="w-3 h-3" />
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
          placeholder="ex: OpenAI Produção"
          required
        />
        <p className="text-xs text-muted-foreground">Um nome amigável para identificar esta conexão</p>
      </div>

      {/* Credentials */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Key className="w-4 h-4" />
            Credenciais de API
          </CardTitle>
          <CardDescription>Header: Authorization: Bearer [API_KEY]</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="sk-••••••••••••••••"
            />
            <p className="text-xs text-muted-foreground">
              Deve começar com <code className="bg-secondary px-1 rounded">sk-</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationId">
              Organization ID <span className="text-muted-foreground">(Opcional)</span>
            </Label>
            <Input
              id="organizationId"
              value={formData.organizationId}
              onChange={(e) => setFormData(prev => ({ ...prev, organizationId: e.target.value }))}
              placeholder="org-••••••••••••••••"
            />
            <p className="text-xs text-muted-foreground">
              Para contas com múltiplas organizações. Deve começar com <code className="bg-secondary px-1 rounded">org-</code>
            </p>
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
            <Alert variant={testResult.success ? 'default' : 'destructive'} className={testResult.success ? 'border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-900' : ''}>
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription className="space-y-2">
                <p className={testResult.success ? 'text-purple-700 dark:text-purple-400' : ''}>
                  {testResult.message}
                </p>
                {testResult.models && testResult.models.length > 0 && (
                  <div className="text-xs">
                    <p className="text-muted-foreground mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Modelos disponíveis:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {testResult.models.slice(0, 6).map(model => (
                        <Badge key={model} variant="secondary" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                      {testResult.models.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{testResult.models.length - 6} mais
                        </Badge>
                      )}
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
              {OPENAI_RECOMMENDED_PATHS.slice(0, 6).map(path => (
                <Badge key={path} variant="secondary" className="text-xs">
                  {path}
                </Badge>
              ))}
              {OPENAI_RECOMMENDED_PATHS.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{OPENAI_RECOMMENDED_PATHS.length - 6} mais
                </Badge>
              )}
            </div>
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
          Criar Conexão OpenAI
        </Button>
      </div>
    </form>
  );
}
