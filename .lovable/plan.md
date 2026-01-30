
# Plano: Corrigir Dockerfile para EasyPanel

## Problema Identificado

O erro "Bad Request" no EasyPanel é causado por dois problemas:

1. **CMD inline muito complexo**: O Dockerfile atual usa um servidor Node.js inline no comando `CMD` com muitas barras invertidas (`\`), o que pode causar problemas de parsing no Docker buildx
2. **`.dockerignore` incorreto**: Está ignorando a pasta `docker/` e arquivos `Dockerfile*`, o que pode interferir no build

## Solução

### Parte 1: Criar arquivo de servidor separado

Criar um arquivo `serve.js` na raiz do projeto (fora da pasta `docker/`) que será copiado durante o build.

```text
serve.js (novo arquivo)
├── Servidor HTTP simples
├── Suporte SPA (fallback para index.html)
├── Health check em /health
└── MIME types para assets
```

### Parte 2: Simplificar o Dockerfile

Remover o servidor inline e usar o arquivo `serve.js`:

```text
Dockerfile (simplificado)
├── FROM node:20-alpine
├── COPY package*.json → npm ci
├── COPY . → npm run build
├── COPY serve.js
└── CMD ["node", "serve.js"]
```

### Parte 3: Ajustar o .dockerignore

Remover a exclusão da pasta `docker/` e permitir arquivos necessários.

## Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `serve.js` | Criar | Servidor estático simples |
| `Dockerfile` | Editar | Simplificar CMD |
| `.dockerignore` | Editar | Remover exclusões problemáticas |

## Detalhes Técnicos

### serve.js
```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIR = './dist';

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
    return;
  }
  
  let file = path.join(DIR, req.url === '/' ? 'index.html' : req.url);
  
  fs.readFile(file, (err, data) => {
    if (err) {
      fs.readFile(path.join(DIR, 'index.html'), (e, d) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(d);
      });
      return;
    }
    res.writeHead(200, {'Content-Type': MIME[path.extname(file)] || 'text/plain'});
    res.end(data);
  });
}).listen(PORT, () => console.log('Server running on port ' + PORT));
```

### Dockerfile Corrigido
```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "serve.js"]
```

### .dockerignore Corrigido
```text
node_modules
.git
*.md
.env*
coverage
.idea
.vscode
```

## Após Aprovação

1. Crio o arquivo `serve.js`
2. Simplifico o `Dockerfile` 
3. Ajusto o `.dockerignore`
4. Você faz novo deploy no EasyPanel
