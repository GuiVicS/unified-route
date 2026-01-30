
# Plano: Implementar Backend de Proxy no serve.js

## Problema Identificado

O sistema API Bridge atualmente é **apenas frontend** - toda a interface de gerenciamento de conexões, clientes e documentação funciona, mas o **endpoint `/api/proxy` que faz o repasse real das requisições não existe**.

O `serve.js` atual apenas serve arquivos estáticos do build React. Precisamos adicionar a lógica de backend para:
1. Receber requisições em `POST /api/proxy`
2. Validar o token do cliente (`X-Client-Token`)
3. Buscar a conexão e injetar as credenciais
4. Fazer o repasse (proxy) para a API de destino
5. Retornar a resposta ao cliente

## Arquitetura da Solução

```text
+------------------+       +-------------------+       +------------------+
|  Cliente (App)   |  -->  |   serve.js        |  -->  |  API Externa     |
|                  |       |   /api/proxy      |       |  (Yampi, etc.)   |
|  X-Client-Token  |       |   + Credenciais   |       |                  |
+------------------+       +-------------------+       +------------------+
```

## Alterações

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `serve.js` | Editar | Adicionar handler para POST /api/proxy com toda logica de proxy |
| `server/proxy.js` | Criar | Modulo separado com logica de proxy e autenticacao |
| `server/storage.js` | Criar | Camada de persistencia para ler dados do localStorage (via arquivos JSON) |
| `Dockerfile` | Editar | Adicionar volume para persistencia de dados |

## Detalhes Tecnicos

### 1. Persistencia de Dados

O frontend usa `localStorage` via Zustand, mas o backend Node.js nao tem acesso ao navegador. Solucao:

- Criar endpoints `GET/POST /api/sync` para sincronizar dados entre frontend e backend
- Backend armazena em arquivo JSON (`data/connections.json`, `data/clients.json`)
- Ao salvar no frontend, tambem envia para o backend

### 2. Logica do Proxy (`POST /api/proxy`)

```text
Requisicao de entrada:
{
  "connectionId": "conn-xxx",
  "method": "GET",
  "path": "/orders",
  "query": { "limit": "10" },
  "headers": { ... },
  "body": { ... }
}

Headers obrigatorios:
- X-Client-Token: ab_xxx (token do cliente)
- Content-Type: application/json
```

Fluxo de processamento:

1. Validar header `X-Client-Token`
2. Buscar cliente pelo token e verificar se esta ativo
3. Verificar se cliente tem acesso a `connectionId`
4. Buscar conexao e verificar se esta ativa
5. Validar `method` contra `allowedMethods`
6. Validar `path` contra `allowedPathPrefixes`
7. Montar URL de destino: `baseUrl + path + query`
8. Injetar credenciais baseado no `authScheme`:
   - `BEARER`: Header `Authorization: Bearer {apiKey}`
   - `BASIC`: Header `Authorization: Basic base64({apiKey}:{secret})`
   - `HEADER_PAIR`: Headers `User-Token` e `User-Secret-Key` (Yampi)
   - `QUERY`: Adicionar na query string
   - `CUSTOM`: Usar template customizado
9. Fazer requisicao para API de destino
10. Retornar resposta ao cliente
11. Registrar no audit log

### 3. Tratamento de Erros

| Codigo | Erro | Descricao |
|--------|------|-----------|
| 401 | UNAUTHORIZED | Token invalido ou ausente |
| 403 | FORBIDDEN | Cliente sem acesso a conexao |
| 403 | CONNECTION_DISABLED | Conexao desativada |
| 403 | CLIENT_DISABLED | Cliente desativado |
| 403 | METHOD_NOT_ALLOWED | Metodo HTTP nao permitido |
| 403 | PATH_NOT_ALLOWED | Caminho nao permitido |
| 404 | CONNECTION_NOT_FOUND | Conexao nao existe |
| 502 | UPSTREAM_ERROR | Erro na API de destino |
| 504 | UPSTREAM_TIMEOUT | Timeout na API de destino |

### 4. Estrutura do serve.js Atualizado

```text
serve.js
  |-- Handler: GET /health
  |-- Handler: POST /api/proxy (NOVO)
  |-- Handler: GET /api/sync (NOVO)
  |-- Handler: POST /api/sync (NOVO)
  |-- Handler: * (arquivos estaticos/SPA)
```

### 5. Seguranca

- Validacao de origem via CORS (usando `corsOrigins` do setup)
- Rate limiting por IP e por cliente
- Timeout configuravel para requisicoes upstream
- Credenciais nunca expostas em logs ou respostas de erro
- Sanitizacao de headers para evitar header injection

## Resultado Esperado

Apos a implementacao:

1. O endpoint `POST /api/proxy` estara funcional
2. Clientes poderao fazer requisicoes usando `X-Client-Token`
3. Credenciais serao injetadas automaticamente
4. Logs de auditoria serao registrados
5. Sistema funcionara 100% no EasyPanel com Docker
