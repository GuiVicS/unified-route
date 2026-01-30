

# Plano: Página de Documentação de Instalação

## Objetivo
Criar uma nova página `/docs` no painel administrativo com instruções detalhadas de instalação para três plataformas:
- EasyPanel
- Docker Compose
- VPS (instalação manual)

## Estrutura da Página

A página utilizará o componente de abas (Tabs) para organizar o conteúdo por plataforma, com:
- Navegação clara entre os métodos de instalação
- Blocos de código com botão de copiar
- Instruções passo a passo numeradas
- Seção de troubleshooting para cada plataforma

---

## Arquivos a Criar/Modificar

### 1. Nova Página: `src/pages/DocsPage.tsx`

Página principal de documentação contendo:

**Cabeçalho:**
- Título: "Documentação de Instalação"
- Descrição: "Guia passo a passo para instalar o API Bridge"

**Tabs de Conteúdo:**
- **EasyPanel** - Instalação via painel de controle
- **Docker Compose** - Instalação com docker-compose.yml
- **VPS Manual** - Instalação direta em servidor Linux

**Cada aba conterá:**
- Requisitos mínimos
- Passos numerados com screenshots conceituais (ícones)
- Blocos de código para comandos e configurações
- Variáveis de ambiente necessárias
- Dicas de segurança
- Troubleshooting comum

### 2. Componente: `src/components/docs/CodeBlock.tsx`

Componente reutilizável para exibir código com:
- Syntax highlighting simples (estilo terminal)
- Botão "Copiar" integrado
- Suporte a múltiplas linhas
- Label opcional (ex: "docker-compose.yml", "Terminal")

### 3. Atualização: `src/components/layout/Sidebar.tsx`

Adicionar novo item de navegação:
```
{ path: '/docs', label: 'Documentação', icon: BookOpen }
```

### 4. Atualização: `src/App.tsx`

Adicionar nova rota:
```tsx
<Route path="/docs" element={<ProtectedRoute><DocsPage /></ProtectedRoute>} />
```

---

## Conteúdo da Documentação

### Aba: EasyPanel

1. Criar projeto no EasyPanel
2. Adicionar serviço PostgreSQL
3. Adicionar App (GitHub ou Docker Image)
4. Configurar variáveis de ambiente
5. Configurar domínio e SSL
6. Acessar o assistente de instalação

### Aba: Docker Compose

1. Requisitos (Docker 20.10+, Docker Compose 2.0+)
2. Clonar repositório
3. Configurar arquivo .env
4. Gerar chaves de segurança
5. Subir containers
6. Comandos úteis (logs, backup, restore)

### Aba: VPS Manual

1. Requisitos do servidor (Ubuntu 22.04+, Node 20+)
2. Instalar dependências (Node.js, PostgreSQL)
3. Clonar e configurar projeto
4. Configurar banco de dados
5. Configurar systemd ou PM2
6. Configurar Nginx como proxy reverso
7. Configurar SSL com Let's Encrypt

---

## Detalhes Técnicos

### Estrutura do CodeBlock
```tsx
interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}
```

### Estilização
- Fundo escuro para blocos de código (`bg-secondary/80`)
- Fonte mono para comandos
- Ícones lucide-react para passos visuais
- Cards com `gradient-card` seguindo padrão existente

### Componentes UI utilizados
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `ScrollArea` para conteúdo longo
- `CopyButton` existente
- `Badge` para destacar versões/requisitos
- `Alert` para avisos importantes

---

## Ordem de Implementação

1. Criar `CodeBlock.tsx` - componente de código copiável
2. Criar `DocsPage.tsx` - página completa com 3 abas
3. Atualizar `Sidebar.tsx` - adicionar link de navegação
4. Atualizar `App.tsx` - adicionar rota `/docs`

