
# Plano: Exibir Connection ID na Interface

## Problema Identificado

O `connectionId` é necessário para fazer requisições ao proxy, mas atualmente não está visível na interface. Os usuários precisam desse ID para usar nos seus clientes/aplicações.

## Solução

Adicionar o Connection ID de forma visível e copiável em dois lugares:

1. **Na lista de conexões** - Exibir o ID com botão de copiar
2. **Após criar uma conexão** - Mostrar um dialog com o ID para copiar

## Alterações

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/pages/ConnectionsPage.tsx` | Editar | Adicionar exibição do ID na lista + dialog pós-criação |
| `src/pages/DocsPage.tsx` | Editar | Atualizar documentação explicando onde encontrar o ID |

## Detalhes da Implementação

### 1. Lista de Conexões
Adicionar linha com o ID copiável abaixo de cada conexão:

```text
┌─────────────────────────────────────────────────────┐
│ ● Yampi Loja Principal    [YAMPI] [HEADER_PAIR]    │
│   https://api.dooki.com.br/v2/{alias}              │
│   ID: conn-1738257600000  [📋 Copiar]              │
│   Atualizada há 2 horas                            │
└─────────────────────────────────────────────────────┘
```

### 2. Dialog Pós-Criação
Após criar uma conexão com sucesso, exibir um dialog informativo:

```text
┌─────────────────────────────────────────────────────┐
│  ✅ Conexão Criada com Sucesso!                    │
│                                                     │
│  Nome: Yampi Loja Principal                        │
│                                                     │
│  Connection ID (use nas requisições):              │
│  ┌─────────────────────────────────────────────┐   │
│  │ conn-1738257600000           [📋 Copiar]   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  💡 Use este ID no campo "connectionId" ao         │
│     fazer requisições para /api/proxy              │
│                                                     │
│                            [Entendi, Fechar]       │
└─────────────────────────────────────────────────────┘
```

### 3. Atualizar Documentação
Adicionar na página de docs:

- Seção "Onde encontrar o Connection ID"
- Explicar que está visível na página de Conexões
- Screenshot/descrição de como copiar

## Resultado Esperado

- Usuários conseguem facilmente localizar e copiar o `connectionId`
- Fluxo mais claro após criar uma conexão
- Documentação atualizada com instruções
