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
    toast.success('Security settings updated');
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
        title="Security Settings" 
        description="Configure global security policies"
        action={
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
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
              <h3 className="text-base font-medium text-foreground">CORS Allowed Origins</h3>
              <p className="text-sm text-muted-foreground">Origins allowed to make requests</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                placeholder="https://example.com or https://*.example.com"
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
                <p className="text-sm text-muted-foreground">No origins configured (all blocked by default)</p>
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
              <h3 className="text-base font-medium text-foreground">Rate Limiting</h3>
              <p className="text-sm text-muted-foreground">Limit requests per token/IP</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rateLimit">Requests per minute</Label>
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
              <span className="text-sm text-muted-foreground">req/min per token or IP</span>
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
                <h3 className="text-base font-medium text-foreground">Audit Logging</h3>
                <p className="text-sm text-muted-foreground">Log all proxy requests for debugging</p>
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
              <h3 className="text-base font-medium text-foreground">Security Features</h3>
              <p className="text-sm text-muted-foreground">Built-in protections</p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              AES-256-GCM encryption for credentials at rest
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              HttpOnly cookies with CSRF protection
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              Path traversal and SSRF protection
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              Argon2 hashing for client tokens
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              Helmet security headers
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
