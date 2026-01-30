import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useClientStore } from '@/stores/clientStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyField } from '@/components/ui/copy-button';
import { 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Power,
  Loader2,
  Key,
  AlertTriangle
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
import { ClientForm } from '@/components/clients/ClientForm';
import type { Client, ClientFormData, ClientWithToken } from '@/types/api-bridge';
import { formatDistanceToNow } from 'date-fns';

export function ClientsPage() {
  const { 
    clients, 
    isLoading, 
    fetchClients, 
    createClient,
    updateClient,
    deleteClient, 
    toggleClient,
    regenerateToken 
  } = useClientStore();
  const { connections, fetchConnections } = useConnectionStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<{ clientName: string; token: string } | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
    fetchConnections();
  }, []);

  const handleCreate = async (data: ClientFormData) => {
    const result = await createClient(data);
    setIsCreateOpen(false);
    setNewToken({ clientName: result.name, token: result.token });
  };

  const handleUpdate = async (data: ClientFormData) => {
    if (editClient) {
      await updateClient(editClient.id, data);
      setEditClient(null);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteClient(deleteId);
      setDeleteId(null);
    }
  };

  const handleRegenerate = async (client: Client) => {
    setRegeneratingId(client.id);
    const token = await regenerateToken(client.id);
    setRegeneratingId(null);
    setNewToken({ clientName: client.name, token });
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Clients" 
        description="Manage API client tokens for external access"
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 gradient-card border border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No clients configured yet</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create your first client
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(client => (
            <div 
              key={client.id} 
              className="flex items-center justify-between p-4 gradient-card border border-border rounded-lg card-hover"
            >
              <div className="flex items-center gap-4">
                <div className={`status-dot ${client.enabled ? 'status-dot-active' : 'status-dot-inactive'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{client.name}</h3>
                    {!client.enabled && <Badge variant="muted">Disabled</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {client.allowedOrigins && client.allowedOrigins.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {client.allowedOrigins.length} origin{client.allowedOrigins.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {client.allowedConnectionIds && client.allowedConnectionIds.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {client.allowedConnectionIds.length} connection{client.allowedConnectionIds.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {client.lastUsedAt && (
                      <span className="text-xs text-muted-foreground">
                        Last used {formatDistanceToNow(new Date(client.lastUsedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditClient(client)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleClient(client.id)}>
                      <Power className="w-4 h-4 mr-2" />
                      {client.enabled ? 'Disable' : 'Enable'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRegenerate(client)}>
                      <Key className="w-4 h-4 mr-2" />
                      Regenerate Token
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteId(client.id)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Client</DialogTitle>
            <DialogDescription>
              Create a new client token for API access
            </DialogDescription>
          </DialogHeader>
          <ClientForm 
            connections={connections}
            onSubmit={handleCreate} 
            onCancel={() => setIsCreateOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editClient} onOpenChange={() => setEditClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client settings
            </DialogDescription>
          </DialogHeader>
          {editClient && (
            <ClientForm 
              initialData={editClient}
              connections={connections}
              onSubmit={handleUpdate} 
              onCancel={() => setEditClient(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Token Display Dialog */}
      <Dialog open={!!newToken} onOpenChange={() => setNewToken(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Client Token Created</DialogTitle>
            <DialogDescription>
              Copy this token now. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                This token grants access to your API Bridge. Store it securely and never expose it in client-side code.
              </p>
            </div>
            
            {newToken && (
              <CopyField label={`Token for "${newToken.clientName}"`} value={newToken.token} />
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setNewToken(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All requests using this client token will fail.
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
