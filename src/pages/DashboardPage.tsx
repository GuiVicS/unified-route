import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useConnectionStore } from '@/stores/connectionStore';
import { useClientStore } from '@/stores/clientStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuditStore } from '@/stores/auditStore';
import { Link2, Key, Activity, Clock, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  emptyAction,
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ElementType;
  emptyAction?: { label: string; href: string };
}) {
  const isEmpty = value === 0 || value === '0';

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
      {isEmpty && emptyAction && (
        <Link 
          to={emptyAction.href}
          className="flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
        >
          {emptyAction.label}
          <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { connections, fetchConnections } = useConnectionStore();
  const { clients, fetchClients } = useClientStore();
  const { stats, fetchStats } = useSettingsStore();
  const { logs, fetchLogs } = useAuditStore();

  useEffect(() => {
    fetchConnections();
    fetchClients();
    fetchStats();
    fetchLogs();
  }, []);

  const activeConnections = connections.filter(c => c.enabled).length;
  const activeClients = clients.filter(c => c.enabled).length;
  const hasData = connections.length > 0 || clients.length > 0;

  return (
    <AppLayout>
      <PageHeader 
        title="Painel" 
        description="Visão geral da sua instância do API Bridge"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Conexões"
          value={connections.length}
          subtitle={connections.length > 0 ? `${activeConnections} ativas` : undefined}
          icon={Link2}
          emptyAction={{ label: 'Criar primeira conexão', href: '/connections' }}
        />
        <StatCard
          title="Clientes"
          value={clients.length}
          subtitle={clients.length > 0 ? `${activeClients} ativos` : undefined}
          icon={Key}
          emptyAction={{ label: 'Criar primeiro cliente', href: '/clients' }}
        />
        <StatCard
          title="Requisições Hoje"
          value={stats.requestsToday.toLocaleString('pt-BR')}
          icon={Activity}
        />
        <StatCard
          title="Latência Média"
          value={stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs}ms` : '-'}
          subtitle={stats.errorRate > 0 ? `${stats.errorRate}% de erros` : undefined}
          icon={Clock}
        />
      </div>

      {!hasData ? (
        <div className="gradient-card border border-border rounded-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Comece Agora</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Crie sua primeira conexão de API para começar a fazer proxy de requisições de forma segura.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link to="/connections">
                <Plus className="w-4 h-4 mr-2" />
                Criar Conexão
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/clients">
                <Key className="w-4 h-4 mr-2" />
                Criar Token de Cliente
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="gradient-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">Conexões Ativas</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/connections">Ver todas</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {connections.filter(c => c.enabled).slice(0, 4).map(conn => (
                <div key={conn.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="status-dot status-dot-active" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{conn.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{conn.baseUrl}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{conn.providerType}</span>
                </div>
              ))}
              {connections.filter(c => c.enabled).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma conexão ativa
                </p>
              )}
            </div>
          </div>

          <div className="gradient-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">Requisições Recentes</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/logs">Ver todas</Link>
              </Button>
            </div>
            <div className="space-y-2">
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                      log.status < 400 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {log.status}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-muted-foreground">{log.method}</span> {log.path}
                      </p>
                      <p className="text-xs text-muted-foreground">{log.connectionName}</p>
                    </div>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma requisição ainda
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
