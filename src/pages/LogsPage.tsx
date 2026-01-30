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
        title="Audit Logs" 
        description="Monitor all proxy requests"
        action={
          <Button variant="outline" onClick={() => fetchLogs()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
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
            <SelectValue placeholder="All Connections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Connections</SelectItem>
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
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
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
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
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
            Clear filters
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
          <p className="text-muted-foreground">No logs found</p>
        </div>
      ) : (
        <div className="gradient-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Time</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Method</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Connection</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Path</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Client</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Latency</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Size</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-border last:border-0 table-row-hover">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {format(new Date(log.timestamp), 'MMM dd HH:mm:ss')}
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
