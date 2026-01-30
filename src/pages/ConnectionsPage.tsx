import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useConnectionStore } from '@/stores/connectionStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  MoreVertical, 
  Play, 
  Pencil, 
  Trash2, 
  Power,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ConnectionForm } from '@/components/connections/ConnectionForm';
import type { Connection, ConnectionFormData } from '@/types/api-bridge';
import { formatDistanceToNow } from 'date-fns';

export function ConnectionsPage() {
  const { 
    connections, 
    isLoading, 
    fetchConnections, 
    createConnection,
    updateConnection,
    deleteConnection, 
    toggleConnection,
    testConnection 
  } = useConnectionStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editConnection, setEditConnection] = useState<Connection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latencyMs: number; error?: string } | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleCreate = async (data: ConnectionFormData) => {
    await createConnection(data);
    setIsCreateOpen(false);
  };

  const handleUpdate = async (data: ConnectionFormData) => {
    if (editConnection) {
      await updateConnection(editConnection.id, data);
      setEditConnection(null);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteConnection(deleteId);
      setDeleteId(null);
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    const result = await testConnection(id);
    setTestResult({ id, ...result });
    setTestingId(null);
  };

  const getProviderColor = (type: string) => {
    switch (type) {
      case 'OPENAI': return 'success';
      case 'DOOKI': return 'warning';
      case 'SHOPIFY': return 'secondary';
      default: return 'muted';
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Connections" 
        description="Manage your API provider connections"
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Connection
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center py-12 gradient-card border border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No connections configured yet</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create your first connection
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map(conn => (
            <div 
              key={conn.id} 
              className="flex items-center justify-between p-4 gradient-card border border-border rounded-lg card-hover"
            >
              <div className="flex items-center gap-4">
                <div className={`status-dot ${conn.enabled ? 'status-dot-active' : 'status-dot-inactive'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{conn.name}</h3>
                    <Badge variant={getProviderColor(conn.providerType) as any}>
                      {conn.providerType}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-xs">
                      {conn.authScheme}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{conn.baseUrl}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated {formatDistanceToNow(new Date(conn.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {testResult?.id === conn.id && (
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                    testResult.success 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {testResult.success ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        {testResult.latencyMs}ms
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        {testResult.error}
                      </>
                    )}
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTest(conn.id)}
                  disabled={testingId === conn.id || !conn.enabled}
                >
                  {testingId === conn.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      Test
                    </>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditConnection(conn)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleConnection(conn.id)}>
                      <Power className="w-4 h-4 mr-2" />
                      {conn.enabled ? 'Disable' : 'Enable'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteId(conn.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Connection</DialogTitle>
            <DialogDescription>
              Configure a new API provider connection
            </DialogDescription>
          </DialogHeader>
          <ConnectionForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editConnection} onOpenChange={() => setEditConnection(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Connection</DialogTitle>
            <DialogDescription>
              Update connection settings. Leave credentials empty to keep existing.
            </DialogDescription>
          </DialogHeader>
          {editConnection && (
            <ConnectionForm 
              initialData={editConnection}
              onSubmit={handleUpdate} 
              onCancel={() => setEditConnection(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All clients using this connection will fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
