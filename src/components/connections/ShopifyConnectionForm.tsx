import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ConnectionFormData, HttpMethod } from '@/types/api-bridge';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ShoppingBag, 
  Key,
  Link,
  ShieldCheck,
  Zap,
  AlertCircle,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import {
  validateShopifyCredentials,
  testShopifyConnection,
  cleanStoreName,
  SHOPIFY_RECOMMENDED_PATHS,
  SHOPIFY_ALLOWED_METHODS,
  SHOPIFY_API_VERSIONS,
  SHOPIFY_DEFAULT_API_VERSION,
  type ShopifyCredentials,
} from '@/lib/providers/shopify';

interface ShopifyConnectionFormProps {
  onSubmit: (data: ConnectionFormData) => Promise<void>;
  onCancel: () => void;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];

export function ShopifyConnectionForm({ onSubmit, onCancel }: ShopifyConnectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    shop?: { name: string; domain: string; currency: string; plan_name: string };
    latencyMs?: number;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    storeName: '',
    accessToken: '',
    apiVersion: SHOPIFY_DEFAULT_API_VERSION,
    enabled: true,
    allowedMethods: [...SHOPIFY_ALLOWED_METHODS] as HttpMethod[],
  });

  // Real-time validation
  useEffect(() => {
    const validation = validateShopifyCredentials({
      storeName: formData.storeName,
      accessToken: formData.accessToken,
    });
    setValidationErrors(validation.errors);
  }, [formData.storeName, formData.accessToken]);

  const handleTestConnection = async () => {
    const cleanedStoreName = cleanStoreName(formData.storeName);
    const credentials: ShopifyCredentials = {
      storeName: cleanedStoreName,
      accessToken: formData.accessToken,
      apiVersion: formData.apiVersion,
    };

    const validation = validateShopifyCredentials(credentials);
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
      const result = await testShopifyConnection(credentials);

      if (result.success) {
        setTestResult({
          success: true,
          message: `Conexão bem-sucedida em ${result.latencyMs}ms`,
          shop: result.shop,
          latencyMs: result.latencyMs,
        });
        
        // Auto-fill name if empty
        if (!formData.name && result.shop) {
          setFormData(prev => ({ ...prev, name: `Shopify - ${result.shop!.name}` }));
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
    
    const cleanedStoreName = cleanStoreName(formData.storeName);
    const validation = validateShopifyCredentials({
      storeName: cleanedStoreName,
      accessToken: formData.accessToken,
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
      const connectionData: ConnectionFormData = {
        name: formData.name,
        providerType: 'SHOPIFY',
        baseUrl: `https://${cleanedStoreName}.myshopify.com/admin/api/${formData.apiVersion}`,
        authScheme: 'CUSTOM',
        apiKey: formData.accessToken,
        customAuth: {
          headerName: 'X-Shopify-Access-Token',
          headerValueTemplate: '{{apiKey}}',
        },
        allowedHosts: [`${cleanedStoreName}.myshopify.com`],
        allowedPathPrefixes: SHOPIFY_RECOMMENDED_PATHS,
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
    formData.storeName.trim() &&
    formData.accessToken.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Shopify</h3>
          <p className="text-sm text-muted-foreground">Conecte sua loja Shopify para gerenciar produtos, pedidos e clientes</p>
        </div>
      </div>

      {/* Documentation Link */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-sm">
          Para obter o Access Token, crie um{' '}
          <span className="font-medium">Custom App</span> no painel admin:{' '}
          <span className="font-medium">Settings → Apps and sales channels → Develop apps</span>.{' '}
          <a 
            href="https://shopify.dev/docs/apps/getting-started/create" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-green-600 hover:underline"
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
          placeholder="ex: Shopify - Minha Loja"
          required
        />
        <p className="text-xs text-muted-foreground">Um nome amigável para identificar esta conexão</p>
      </div>

      {/* Store Name */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Link className="w-4 h-4" />
            Identificação da Loja
          </CardTitle>
          <CardDescription>O nome da sua loja no Shopify</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="storeName">Nome da Loja</Label>
            <div className="flex items-center gap-2">
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => setFormData(prev => ({ ...prev, storeName: cleanStoreName(e.target.value) }))}
                placeholder="minha-loja"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">.myshopify.com</span>
            </div>
            <p className="text-xs text-muted-foreground">
              URL completa: https://{formData.storeName || 'sua-loja'}.myshopify.com
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
          <CardDescription>Header: X-Shopify-Access-Token</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              value={formData.accessToken}
              onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
              placeholder="shpat_••••••••••••••••"
            />
            <p className="text-xs text-muted-foreground">
              Deve começar com <code className="bg-secondary px-1 rounded">shpat_</code> ou <code className="bg-secondary px-1 rounded">shpca_</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiVersion">Versão da API</Label>
            <Select 
              value={formData.apiVersion}
              onValueChange={(v) => setFormData(prev => ({ ...prev, apiVersion: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHOPIFY_API_VERSIONS.map(version => (
                  <SelectItem key={version} value={version}>
                    {version}
                    {version === SHOPIFY_DEFAULT_API_VERSION && ' (Recomendado)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {testResult.shop && (
                  <div className="text-xs space-y-1">
                    <p className="text-muted-foreground">
                      <span className="font-medium">Loja:</span> {testResult.shop.name}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Domínio:</span> {testResult.shop.domain}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {testResult.shop.currency}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {testResult.shop.plan_name}
                      </Badge>
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
          Criar Conexão Shopify
        </Button>
      </div>
    </form>
  );
}
