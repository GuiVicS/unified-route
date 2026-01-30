import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, Save, Shield, Globe, Gauge, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function SecurityPage() {
  const { settings, isLoading, fetchSettings, updateSettings } = useSettingsStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const [allowedOrigins, setAllowedOrigins] = useState<string[]>([]);
  const [newOrigin, setNewOrigin] = useState('');
  const [rateLimit, setRateLimit] = useState(60);
  const [enableAuditLogs, setEnableAuditLogs] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    setAllowedOrigins(settings.allowedOrigins);
    setRateLimit(settings.rateLimitPerMin);
    setEnableAuditLogs(settings.enableAuditLogs);
  }, [settings]);

  const addOrigin = () => {
    if (newOrigin && !allowedOrigins.includes(newOrigin)) {
      setAllowedOrigins([...allowedOrigins, newOrigin]);
      setNewOrigin('');
    }
  };

  const removeOrigin = (origin: string) => {
    setAllowedOrigins(allowedOrigins.filter(o => o !== origin));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateSettings({
      allowedOrigins,
      rateLimitPerMin: rateLimit,
      enableAuditLogs,
    });
    setIsSaving(false);
    toast.success('Configurações de segurança atualizadas');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Configurações de Segurança" 
        description="Configure políticas de segurança globais"
        action={
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        }
      />

      <div className="space-y-6 max-w-2xl">
        {/* CORS Origins */}
        <div className="gradient-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Globe className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">Origens CORS Permitidas</h3>
              <p className="text-sm text-muted-foreground">Origens autorizadas a fazer requisições</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                placeholder="https://exemplo.com ou https://*.exemplo.com"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOrigin())}
              />
              <Button variant="outline" onClick={addOrigin}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {allowedOrigins.map(origin => (
                <Badge key={origin} variant="secondary" className="gap-1 pr-1">
                  <code className="text-xs">{origin}</code>
                  <button 
                    onClick={() => removeOrigin(origin)}
                    className="ml-1 p-0.5 rounded hover:bg-background/50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {allowedOrigins.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma origem configurada (todas bloqueadas por padrão)</p>
              )}
            </div>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="gradient-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Gauge className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">Limite de Requisições</h3>
              <p className="text-sm text-muted-foreground">Limite de requisições por token/IP</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rateLimit">Requisições por minuto</Label>
            <div className="flex items-center gap-4">
              <Input
                id="rateLimit"
                type="number"
                min={1}
                max={1000}
                value={rateLimit}
                onChange={(e) => setRateLimit(parseInt(e.target.value) || 60)}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">req/min por token ou IP</span>
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="gradient-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground">Logs de Auditoria</h3>
                <p className="text-sm text-muted-foreground">Registrar todas as requisições de proxy para depuração</p>
              </div>
            </div>
            <Switch
              checked={enableAuditLogs}
              onCheckedChange={setEnableAuditLogs}
            />
          </div>
        </div>

        {/* Security Info */}
        <div className="gradient-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">Recursos de Segurança</h3>
              <p className="text-sm text-muted-foreground">Proteções integradas</p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              Criptografia AES-256-GCM para credenciais em repouso
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              Cookies HttpOnly com proteção CSRF
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              Proteção contra path traversal e SSRF
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              Hash Argon2 para tokens de cliente
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              Headers de segurança Helmet
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
