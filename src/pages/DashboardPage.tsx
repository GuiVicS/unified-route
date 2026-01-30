import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useConnectionStore } from '@/stores/connectionStore';
import { useClientStore } from '@/stores/clientStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuditStore } from '@/stores/auditStore';
import { Link2, Key, Activity, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
}) {
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
      {trend && (
        <div className="flex items-center gap-1 mt-3">
          <TrendingUp className={`w-3 h-3 ${trend.isPositive ? 'text-success' : 'text-destructive'}`} />
          <span className={`text-xs ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">vs last week</span>
        </div>
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

  const recentLogs = logs.slice(0, 5);
  const activeConnections = connections.filter(c => c.enabled).length;
  const activeClients = clients.filter(c => c.enabled).length;

  return (
    <AppLayout>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your API Bridge instance"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Connections"
          value={connections.length}
          subtitle={`${activeConnections} active`}
          icon={Link2}
        />
        <StatCard
          title="Clients"
          value={clients.length}
          subtitle={`${activeClients} active`}
          icon={Key}
        />
        <StatCard
          title="Requests Today"
          value={stats.requestsToday.toLocaleString()}
          icon={Activity}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Avg Latency"
          value={`${stats.avgLatencyMs}ms`}
          subtitle={`${stats.errorRate}% error rate`}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gradient-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Active Connections</h2>
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
                <Badge variant="muted">{conn.providerType}</Badge>
              </div>
            ))}
            {connections.filter(c => c.enabled).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active connections
              </p>
            )}
          </div>
        </div>

        <div className="gradient-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Recent Requests</h2>
          <div className="space-y-2">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={log.status < 400 ? 'success' : log.status < 500 ? 'warning' : 'destructive'}
                    className="font-mono text-xs"
                  >
                    {log.status}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-muted-foreground">{log.method}</span> {log.path}
                    </p>
                    <p className="text-xs text-muted-foreground">{log.connectionName}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </span>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent requests
              </p>
            )}
          </div>
        </div>
      </div>

      {stats.errorRate > 5 && (
        <div className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div>
            <p className="text-sm font-medium text-foreground">High Error Rate Detected</p>
            <p className="text-xs text-muted-foreground">
              Error rate is at {stats.errorRate}%. Check your connections and logs.
            </p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
