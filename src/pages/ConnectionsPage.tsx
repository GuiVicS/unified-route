import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useConnectionStore } from '@/stores/connectionStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  MoreVertical, 
  Play, 
  Pencil, 
  Trash2, 
  Power,
  Loader2,
  CheckCircle2,
  XCircle,
  Store,
  Globe,
  ArrowLeft,
  ShoppingBag,
  Brain
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
import { YampiConnectionForm } from '@/components/connections/YampiConnectionForm';
import { ShopifyConnectionForm } from '@/components/connections/ShopifyConnectionForm';
import { OpenAIConnectionForm } from '@/components/connections/OpenAIConnectionForm';
import type { Connection, ConnectionFormData, ProviderType } from '@/types/api-bridge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type CreateMode = 'select' | 'yampi' | 'shopify' | 'openai' | 'generic';

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
  const [createMode, setCreateMode] = useState<CreateMode>('select');
  const [editConnection, setEditConnection] = useState<Connection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latencyMs: number; error?: string } | null>(null);

  const handleOpenCreate = () => {
    setCreateMode('select');
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setCreateMode('select');
  };

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
      case 'YAMPI': return 'destructive';
      case 'SHOPIFY': return 'secondary';
      default: return 'muted';
    }
  };

  const renderProviderSelector = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Escolha um provedor para começar:</p>
      <div className="grid grid-cols-2 gap-4">
        {/* Yampi */}
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setCreateMode('yampi')}
        >
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-2">
              <Store className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-base">Yampi</CardTitle>
            <CardDescription className="text-xs">
              E-commerce brasileiro com configuração otimizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">Recomendado</Badge>
          </CardContent>
        </Card>

        {/* Shopify */}
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setCreateMode('shopify')}
        >
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-2">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-base">Shopify</CardTitle>
            <CardDescription className="text-xs">
              Plataforma global de e-commerce
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">E-commerce</Badge>
          </CardContent>
        </Card>

        {/* OpenAI */}
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setCreateMode('openai')}
        >
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-2">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-base">OpenAI</CardTitle>
            <CardDescription className="text-xs">
              GPT, DALL-E, Whisper e mais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">AI</Badge>
          </CardContent>
        </Card>

        {/* Outros */}
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => setCreateMode('generic')}
        >
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-2">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-base">Outros</CardTitle>
            <CardDescription className="text-xs">
              Dooki, APIs personalizadas ou genéricas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">Flexível</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderBackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setCreateMode('select')}
      className="mb-2"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Voltar
    </Button>
  );

  const renderCreateForm = () => {
    if (createMode === 'select') {
      return renderProviderSelector();
    }

    if (createMode === 'yampi') {
      return (
        <div className="space-y-4">
          {renderBackButton()}
          <YampiConnectionForm onSubmit={handleCreate} onCancel={handleCloseCreate} />
        </div>
      );
    }

    if (createMode === 'shopify') {
      return (
        <div className="space-y-4">
          {renderBackButton()}
          <ShopifyConnectionForm onSubmit={handleCreate} onCancel={handleCloseCreate} />
        </div>
      );
    }

    if (createMode === 'openai') {
      return (
        <div className="space-y-4">
          {renderBackButton()}
          <OpenAIConnectionForm onSubmit={handleCreate} onCancel={handleCloseCreate} />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {renderBackButton()}
        <ConnectionForm onSubmit={handleCreate} onCancel={handleCloseCreate} />
      </div>
    );
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Conexões" 
        description="Gerencie suas conexões com provedores de API"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Conexão
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center py-12 gradient-card border border-border rounded-lg">
          <p className="text-muted-foreground mb-4">Nenhuma conexão configurada ainda</p>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Criar sua primeira conexão
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
                    Atualizada {formatDistanceToNow(new Date(conn.updatedAt), { addSuffix: true, locale: ptBR })}
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
                      Testar
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
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleConnection(conn.id)}>
                      <Power className="w-4 h-4 mr-2" />
                      {conn.enabled ? 'Desativar' : 'Ativar'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteId(conn.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={handleCloseCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {createMode === 'select' ? 'Nova Conexão' : 
               createMode === 'yampi' ? 'Conectar Yampi' : 
               createMode === 'shopify' ? 'Conectar Shopify' :
               createMode === 'openai' ? 'Conectar OpenAI' :
               'Nova Conexão'}
            </DialogTitle>
            <DialogDescription>
              {createMode === 'select' ? 'Escolha o tipo de provedor para continuar' :
               createMode === 'yampi' ? 'Configure sua conexão com a plataforma Yampi' :
               createMode === 'shopify' ? 'Configure sua conexão com a plataforma Shopify' :
               createMode === 'openai' ? 'Configure sua conexão com a API da OpenAI' :
               'Configure uma nova conexão com provedor de API'}
            </DialogDescription>
          </DialogHeader>
          {renderCreateForm()}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editConnection} onOpenChange={() => setEditConnection(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Conexão</DialogTitle>
            <DialogDescription>
              Atualize as configurações da conexão. Deixe as credenciais em branco para manter as existentes.
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
            <AlertDialogTitle>Excluir Conexão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os clientes usando esta conexão irão falhar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
