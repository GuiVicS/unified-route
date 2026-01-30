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
import type { Connection, ConnectionFormData, ProviderType, AuthScheme, HttpMethod } from '@/types/api-bridge';
import { Loader2, Wand2, AlertCircle } from 'lucide-react';

interface ConnectionFormProps {
  initialData?: Connection;
  onSubmit: (data: ConnectionFormData) => Promise<void>;
  onCancel: () => void;
}

const PROVIDER_TYPES: ProviderType[] = ['AUTO', 'GENERIC', 'OPENAI', 'SHOPIFY', 'DOOKI', 'YAMPI', 'CUSTOM'];
const AUTH_SCHEMES: AuthScheme[] = ['BEARER', 'BASIC', 'HEADER_PAIR', 'QUERY', 'NONE'];
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

export function ConnectionForm({ initialData, onSubmit, onCancel }: ConnectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  
  const [formData, setFormData] = useState<ConnectionFormData>({
    name: initialData?.name || '',
    providerType: initialData?.providerType || 'AUTO',
    baseUrl: initialData?.baseUrl || '',
    authScheme: initialData?.authScheme || 'BEARER',
    apiKey: '',
    secret: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data: ConnectionFormData = {
      ...formData,
      allowedHosts: hostsInput ? hostsInput.split(',').map(h => h.trim()).filter(Boolean) : undefined,
      allowedPathPrefixes: prefixesInput ? prefixesInput.split(',').map(p => p.trim()).filter(Boolean) : undefined,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Connection Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., OpenAI Production"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="providerType">Provider Type</Label>
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
                  {type === 'AUTO' ? 'Auto-detect' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="baseUrl">Base URL</Label>
        <div className="relative">
          <Input
            id="baseUrl"
            value={formData.baseUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="https://api.example.com/v1"
            required
          />
          {autoDetected && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-success animate-fade-in">
              <Wand2 className="w-3 h-3" />
              Auto-detected
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="authScheme">Authentication</Label>
          <Select 
            value={formData.authScheme}
            onValueChange={(v) => setFormData(prev => ({ ...prev, authScheme: v as AuthScheme }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUTH_SCHEMES.map(scheme => (
                <SelectItem key={scheme} value={scheme}>{scheme}</SelectItem>
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
            <Label>Enabled</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border">
        <h4 className="text-sm font-medium text-foreground">Credentials</h4>
        {initialData && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-3 h-3" />
            Leave empty to keep existing credentials
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">
              {formData.authScheme === 'HEADER_PAIR' ? 'User Token' : 'API Key / Token'}
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="••••••••••••••••"
            />
          </div>

          {(formData.authScheme === 'BASIC' || formData.authScheme === 'HEADER_PAIR') && (
            <div className="space-y-2">
              <Label htmlFor="secret">
                {formData.authScheme === 'HEADER_PAIR' ? 'Secret Key' : 'Password'}
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
        <h4 className="text-sm font-medium text-foreground">Security Restrictions (Optional)</h4>
        
        <div className="space-y-2">
          <Label htmlFor="allowedHosts">Allowed Hosts</Label>
          <Input
            id="allowedHosts"
            value={hostsInput}
            onChange={(e) => setHostsInput(e.target.value)}
            placeholder="api.example.com, api2.example.com"
          />
          <p className="text-xs text-muted-foreground">Comma-separated list of allowed target hosts</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allowedPrefixes">Allowed Path Prefixes</Label>
          <Input
            id="allowedPrefixes"
            value={prefixesInput}
            onChange={(e) => setPrefixesInput(e.target.value)}
            placeholder="/v1, /orders, /customers"
          />
          <p className="text-xs text-muted-foreground">Comma-separated list of allowed path prefixes</p>
        </div>

        <div className="space-y-2">
          <Label>Allowed Methods</Label>
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

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Update Connection' : 'Create Connection'}
        </Button>
      </div>
    </form>
  );
}
