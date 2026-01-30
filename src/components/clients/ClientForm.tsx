import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import type { Client, ClientFormData, Connection } from '@/types/api-bridge';
import { Loader2 } from 'lucide-react';

interface ClientFormProps {
  initialData?: Client;
  connections: Connection[];
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
}

export function ClientForm({ initialData, connections, onSubmit, onCancel }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ClientFormData>({
    name: initialData?.name || '',
    allowedOrigins: initialData?.allowedOrigins || [],
    allowedConnectionIds: initialData?.allowedConnectionIds || [],
    enabled: initialData?.enabled ?? true,
  });

  const [originsInput, setOriginsInput] = useState(formData.allowedOrigins?.join(', ') || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data: ClientFormData = {
      ...formData,
      allowedOrigins: originsInput ? originsInput.split(',').map(o => o.trim()).filter(Boolean) : undefined,
    };
    
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleConnection = (connId: string) => {
    setFormData(prev => ({
      ...prev,
      allowedConnectionIds: prev.allowedConnectionIds?.includes(connId)
        ? prev.allowedConnectionIds.filter(id => id !== connId)
        : [...(prev.allowedConnectionIds || []), connId],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Cliente</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="ex: App Mobile, Painel de Suporte"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.enabled}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
        />
        <Label>Ativado</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="origins">Origens Permitidas (Opcional)</Label>
        <Input
          id="origins"
          value={originsInput}
          onChange={(e) => setOriginsInput(e.target.value)}
          placeholder="https://app.exemplo.com, https://*.exemplo.com"
        />
        <p className="text-xs text-muted-foreground">
          Lista separada por vírgula. Deixe em branco para permitir todas as origens.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Conexões Permitidas (Opcional)</Label>
        <p className="text-xs text-muted-foreground">
          Deixe desmarcado para permitir todas as conexões
        </p>
        <div className="space-y-2 p-3 rounded-lg bg-secondary/30 border border-border max-h-48 overflow-y-auto">
          {connections.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma conexão disponível</p>
          ) : (
            connections.map(conn => (
              <div key={conn.id} className="flex items-center gap-3">
                <Checkbox
                  id={conn.id}
                  checked={formData.allowedConnectionIds?.includes(conn.id)}
                  onCheckedChange={() => toggleConnection(conn.id)}
                />
                <label 
                  htmlFor={conn.id} 
                  className="text-sm text-foreground cursor-pointer flex-1"
                >
                  {conn.name}
                  <span className="text-xs text-muted-foreground ml-2">({conn.providerType})</span>
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? 'Atualizar Cliente' : 'Criar Cliente'}
        </Button>
      </div>
    </form>
  );
}
