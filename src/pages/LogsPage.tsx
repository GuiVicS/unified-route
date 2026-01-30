import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuditStore } from '@/stores/auditStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { useClientStore } from '@/stores/clientStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { HttpMethod } from '@/types/api-bridge';

export function LogsPage() {
  const { logs, isLoading, filters, fetchLogs, setFilters, getFilteredLogs } = useAuditStore();
  const { connections, fetchConnections } = useConnectionStore();
  const { clients, fetchClients } = useClientStore();

  useEffect(() => {
    fetchLogs();
    fetchConnections();
    fetchClients();
  }, []);

  const filteredLogs = getFilteredLogs();

  const getStatusVariant = (status: number) => {
    if (status < 300) return 'success';
    if (status < 400) return 'secondary';
    if (status < 500) return 'warning';
    return 'destructive';
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Logs de Auditoria" 
        description="Monitore todas as requisições de proxy"
        action={
          <Button variant="outline" onClick={() => fetchLogs()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select 
          value={filters.connectionId || 'all'} 
          onValueChange={(v) => setFilters({ ...filters, connectionId: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas as Conexões" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Conexões</SelectItem>
            {connections.map(conn => (
              <SelectItem key={conn.id} value={conn.id}>{conn.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.clientId || 'all'} 
          onValueChange={(v) => setFilters({ ...filters, clientId: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os Clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Clientes</SelectItem>
            {clients.map(client => (
              <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.method || 'all'} 
          onValueChange={(v) => setFilters({ ...filters, method: v === 'all' ? undefined : v as HttpMethod })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>

        {(filters.connectionId || filters.clientId || filters.method) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setFilters({})}
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 gradient-card border border-border rounded-lg">
          <p className="text-muted-foreground">Nenhum log encontrado</p>
        </div>
      ) : (
        <div className="gradient-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Data/Hora</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Método</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Conexão</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Path</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Cliente</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Latência</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Tamanho</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-border last:border-0 table-row-hover">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {format(new Date(log.timestamp), "dd MMM HH:mm:ss", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(log.status) as any} className="font-mono text-xs">
                        {log.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-muted-foreground">{log.method}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{log.connectionName}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-foreground">{log.path}</code>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{log.clientName || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-mono ${log.latencyMs > 500 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {log.latencyMs}ms
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground font-mono">
                      {(log.responseSize / 1024).toFixed(1)}KB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
