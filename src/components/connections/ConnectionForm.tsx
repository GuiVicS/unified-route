import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Connection, ConnectionFormData, ProviderType, AuthScheme, HttpMethod, CustomAuthConfig } from '@/types/api-bridge';
import { Loader2, Wand2, AlertCircle, Terminal, FormInput, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConnectionFormProps {
  initialData?: Connection;
  onSubmit: (data: ConnectionFormData) => Promise<void>;
  onCancel: () => void;
}

const PROVIDER_TYPES: ProviderType[] = ['AUTO', 'GENERIC', 'OPENAI', 'SHOPIFY', 'DOOKI', 'YAMPI', 'CUSTOM'];
const AUTH_SCHEMES: AuthScheme[] = ['BEARER', 'BASIC', 'HEADER_PAIR', 'QUERY', 'CUSTOM', 'NONE'];
const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

function detectProvider(url: string): { provider: ProviderType; auth: AuthScheme } | null {
  if (!url) return null;
  if (url.includes('api.openai.com')) {
    return { provider: 'OPENAI', auth: 'BEARER' };
  }
  if (url.includes('api.dooki.com.br')) {
    return { provider: 'DOOKI', auth: 'HEADER_PAIR' };
  }
  if (url.includes('shopify.com') || url.includes('myshopify.com')) {
    return { provider: 'SHOPIFY', auth: 'BEARER' };
  }
  if (url.includes('api.yampi.com.br')) {
    return { provider: 'YAMPI', auth: 'BEARER' };
  }
  return null;
}

interface ParsedCurl {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  authScheme?: AuthScheme;
  apiKey?: string;
  secret?: string;
  customAuth?: CustomAuthConfig;
}

function parseCurl(curlCommand: string): ParsedCurl | null {
  try {
    // Remove line breaks and normalize
    const normalized = curlCommand.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Extract URL
    const urlMatch = normalized.match(/curl\s+(?:.*?\s+)?['"]?(https?:\/\/[^\s'"]+)['"]?/i) 
      || normalized.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/);
    if (!urlMatch) return null;
    
    const url = urlMatch[1];
    
    // Extract method
    let method: HttpMethod = 'GET';
    const methodMatch = normalized.match(/-X\s+['"]?(\w+)['"]?/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase() as HttpMethod;
    } else if (normalized.includes('-d ') || normalized.includes('--data')) {
      method = 'POST';
    }
    
    // Extract headers
    const headers: Record<string, string> = {};
    const headerRegex = /-H\s+['"]([^'"]+)['"]/gi;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(normalized)) !== null) {
      const [key, ...valueParts] = headerMatch[1].split(':');
      if (key && valueParts.length) {
        headers[key.trim()] = valueParts.join(':').trim();
      }
    }
    
    // Detect auth scheme from headers
    let authScheme: AuthScheme | undefined;
    let apiKey: string | undefined;
    let secret: string | undefined;
    let customAuth: CustomAuthConfig | undefined;
    
    const authHeader = headers['Authorization'] || headers['authorization'];
    if (authHeader) {
      if (authHeader.toLowerCase().startsWith('bearer ')) {
        authScheme = 'BEARER';
        apiKey = authHeader.substring(7).trim();
      } else if (authHeader.toLowerCase().startsWith('basic ')) {
        authScheme = 'BASIC';
        try {
          const decoded = atob(authHeader.substring(6).trim());
          const [user, pass] = decoded.split(':');
          apiKey = user;
          secret = pass;
        } catch {
          apiKey = authHeader.substring(6).trim();
        }
      } else {
        // Custom auth format
        authScheme = 'CUSTOM';
        customAuth = {
          headerName: 'Authorization',
          headerValueTemplate: authHeader.replace(/[\w-]+$/, '{{apiKey}}'),
        };
        // Try to extract the key value
        const keyMatch = authHeader.match(/[\w-]+$/);
        if (keyMatch) {
          apiKey = keyMatch[0];
        }
      }
      delete headers['Authorization'];
      delete headers['authorization'];
    }
    
    // Check for common API key headers
    const apiKeyHeaders = ['X-API-Key', 'x-api-key', 'Api-Key', 'api-key', 'X-Auth-Token', 'x-auth-token'];
    for (const h of apiKeyHeaders) {
      if (headers[h]) {
        authScheme = 'CUSTOM';
        customAuth = {
          headerName: h,
          headerValueTemplate: '{{apiKey}}',
        };
        apiKey = headers[h];
        delete headers[h];
        break;
      }
    }
    
    return {
      url,
      method,
      headers,
      authScheme,
      apiKey,
      secret,
      customAuth,
    };
  } catch {
    return null;
  }
}

export function ConnectionForm({ initialData, onSubmit, onCancel }: ConnectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [inputMode, setInputMode] = useState<'form' | 'curl'>('form');
  const [curlInput, setCurlInput] = useState('');
  const [curlError, setCurlError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ConnectionFormData>({
    name: initialData?.name || '',
    providerType: initialData?.providerType || 'AUTO',
    baseUrl: initialData?.baseUrl || '',
    authScheme: initialData?.authScheme || 'BEARER',
    apiKey: '',
    secret: '',
    customAuth: {
      headerName: '',
      headerValueTemplate: '{{apiKey}}',
    },
    allowedHosts: initialData?.allowedHosts || [],
    allowedPathPrefixes: initialData?.allowedPathPrefixes || [],
    allowedMethods: initialData?.allowedMethods || ['GET', 'POST', 'PUT', 'PATCH'],
    enabled: initialData?.enabled ?? true,
  });

  const [hostsInput, setHostsInput] = useState(formData.allowedHosts?.join(', ') || '');
  const [prefixesInput, setPrefixesInput] = useState(formData.allowedPathPrefixes?.join(', ') || '');

  useEffect(() => {
    if (formData.providerType === 'AUTO' && formData.baseUrl) {
      const detected = detectProvider(formData.baseUrl);
      if (detected) {
        setFormData(prev => ({
          ...prev,
          providerType: detected.provider,
          authScheme: detected.auth,
        }));
        setAutoDetected(true);
        setTimeout(() => setAutoDetected(false), 3000);
      }
    }
  }, [formData.baseUrl, formData.providerType]);

  const handleParseCurl = () => {
    setCurlError(null);
    const parsed = parseCurl(curlInput);
    
    if (!parsed) {
      setCurlError('Não foi possível interpretar o comando cURL. Verifique o formato.');
      return;
    }
    
    // Extract base URL (remove path)
    let baseUrl = parsed.url;
    try {
      const urlObj = new URL(parsed.url);
      baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    } catch {}
    
    setFormData(prev => ({
      ...prev,
      baseUrl,
      authScheme: parsed.authScheme || prev.authScheme,
      apiKey: parsed.apiKey || prev.apiKey,
      secret: parsed.secret || prev.secret,
      customAuth: parsed.customAuth || prev.customAuth,
      allowedMethods: [parsed.method],
    }));
    
    // Switch to form mode to show results
    setInputMode('form');
    setAutoDetected(true);
    setTimeout(() => setAutoDetected(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data: ConnectionFormData = {
      ...formData,
      allowedHosts: hostsInput ? hostsInput.split(',').map(h => h.trim()).filter(Boolean) : undefined,
      allowedPathPrefixes: prefixesInput ? prefixesInput.split(',').map(p => p.trim()).filter(Boolean) : undefined,
      customAuth: formData.authScheme === 'CUSTOM' ? formData.customAuth : undefined,
    };
    
    try {
      await onSubmit(data);
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

  const updateCustomAuth = (field: keyof CustomAuthConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      customAuth: {
        ...prev.customAuth!,
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input Mode Tabs */}
      <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'form' | 'curl')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form" className="flex items-center gap-2">
            <FormInput className="w-4 h-4" />
            Formulário
          </TabsTrigger>
          <TabsTrigger value="curl" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Importar cURL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="curl" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="curlInput">Comando cURL</Label>
            <Textarea
              id="curlInput"
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              placeholder={`curl -X POST 'https://api.exemplo.com/v1/endpoint' \\
  -H 'Authorization: Bearer sk-xxxxx' \\
  -H 'Content-Type: application/json'`}
              className="font-mono text-sm min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Cole um comando cURL para extrair automaticamente URL, método e headers de autenticação
            </p>
          </div>
          
          {curlError && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {curlError}
            </div>
          )}
          
          <Button type="button" onClick={handleParseCurl} disabled={!curlInput.trim()}>
            <Wand2 className="w-4 h-4 mr-2" />
            Interpretar cURL
          </Button>
        </TabsContent>
        
        <TabsContent value="form" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Conexão</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ex: OpenAI Produção"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerType">Tipo de Provedor</Label>
              <Select 
                value={formData.providerType}
                onValueChange={(v) => setFormData(prev => ({ ...prev, providerType: v as ProviderType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'AUTO' ? 'Auto-detectar' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">URL Base</Label>
            <div className="relative">
              <Input
                id="baseUrl"
                value={formData.baseUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.exemplo.com/v1"
                required
              />
              {autoDetected && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-success animate-fade-in">
                  <Wand2 className="w-3 h-3" />
                  Auto-detectado
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authScheme">Autenticação</Label>
              <Select 
                value={formData.authScheme}
                onValueChange={(v) => setFormData(prev => ({ ...prev, authScheme: v as AuthScheme }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUTH_SCHEMES.map(scheme => (
                    <SelectItem key={scheme} value={scheme}>
                      {scheme === 'CUSTOM' ? 'Personalizado' : scheme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end pb-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                />
                <Label>Ativada</Label>
              </div>
            </div>
          </div>

          {/* Custom Auth Configuration */}
          {formData.authScheme === 'CUSTOM' && (
            <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-foreground">Configuração de Autenticação Personalizada</h4>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Use <code className="text-xs bg-secondary px-1 rounded">{'{{apiKey}}'}</code> e <code className="text-xs bg-secondary px-1 rounded">{'{{secret}}'}</code> como placeholders no template do valor.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="headerName">Nome do Header</Label>
                  <Input
                    id="headerName"
                    value={formData.customAuth?.headerName || ''}
                    onChange={(e) => updateCustomAuth('headerName', e.target.value)}
                    placeholder="ex: X-API-Key, Authorization"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="headerTemplate">Template do Valor</Label>
                  <Input
                    id="headerTemplate"
                    value={formData.customAuth?.headerValueTemplate || ''}
                    onChange={(e) => updateCustomAuth('headerValueTemplate', e.target.value)}
                    placeholder="ex: Token {{apiKey}}"
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Exemplos: <code className="bg-secondary px-1 rounded">{'{{apiKey}}'}</code> para valor direto, 
                <code className="bg-secondary px-1 rounded ml-1">Token {'{{apiKey}}'}</code> para prefixo,
                <code className="bg-secondary px-1 rounded ml-1">{'{{apiKey}}:{{secret}}'}</code> para par de valores
              </p>
            </div>
          )}

          <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border">
            <h4 className="text-sm font-medium text-foreground">Credenciais</h4>
            {initialData && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3 h-3" />
                Deixe em branco para manter as credenciais existentes
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  {formData.authScheme === 'HEADER_PAIR' ? 'User Token' : 
                   formData.authScheme === 'CUSTOM' ? 'Valor Principal (apiKey)' : 
                   'Chave de API / Token'}
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="••••••••••••••••"
                />
              </div>

              {(formData.authScheme === 'BASIC' || formData.authScheme === 'HEADER_PAIR' || formData.authScheme === 'CUSTOM') && (
                <div className="space-y-2">
                  <Label htmlFor="secret">
                    {formData.authScheme === 'HEADER_PAIR' ? 'Secret Key' : 
                     formData.authScheme === 'CUSTOM' ? 'Valor Secundário (secret)' :
                     'Senha'}
                  </Label>
                  <Input
                    id="secret"
                    type="password"
                    value={formData.secret}
                    onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                    placeholder="••••••••••••••••"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border">
            <h4 className="text-sm font-medium text-foreground">Restrições de Segurança (Opcional)</h4>
            
            <div className="space-y-2">
              <Label htmlFor="allowedHosts">Hosts Permitidos</Label>
              <Input
                id="allowedHosts"
                value={hostsInput}
                onChange={(e) => setHostsInput(e.target.value)}
                placeholder="api.exemplo.com, api2.exemplo.com"
              />
              <p className="text-xs text-muted-foreground">Lista de hosts de destino permitidos, separados por vírgula</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowedPrefixes">Prefixos de Path Permitidos</Label>
              <Input
                id="allowedPrefixes"
                value={prefixesInput}
                onChange={(e) => setPrefixesInput(e.target.value)}
                placeholder="/v1, /orders, /customers"
              />
              <p className="text-xs text-muted-foreground">Lista de prefixos de path permitidos, separados por vírgula</p>
            </div>

            <div className="space-y-2">
              <Label>Métodos Permitidos</Label>
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
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || inputMode === 'curl'}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Atualizar Conexão' : 'Criar Conexão'}
        </Button>
      </div>
    </form>
  );
}
