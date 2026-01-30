# API Bridge - Dockerfile
# Imagem multi-stage para build otimizado

# ==============================
# Stage 1: Build do Frontend
# ==============================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Instalar dependências primeiro (cache)
COPY package*.json ./
RUN npm ci

# Copiar código fonte e buildar
COPY . .
RUN npm run build

# ==============================
# Stage 2: Imagem de Produção
# ==============================
FROM node:20-alpine AS production

WORKDIR /app

# Instalar dumb-init para gerenciamento de processos
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apibridge -u 1001

# Copiar frontend buildado
COPY --from=frontend-builder /app/frontend/dist ./public

# Criar diretório de dados
RUN mkdir -p /app/data && chown -R apibridge:nodejs /app/data

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Expor porta
EXPOSE 3000

# Trocar para usuário não-root
USER apibridge

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Usar dumb-init para gerenciar processos
ENTRYPOINT ["dumb-init", "--"]

# Comando padrão (será sobrescrito quando backend for implementado)
CMD ["node", "-e", "const http=require('http');const fs=require('fs');const path=require('path');const server=http.createServer((req,res)=>{if(req.url==='/health'){res.writeHead(200);res.end('OK');return}let filePath=path.join('/app/public',req.url==='/'?'index.html':req.url);const ext=path.extname(filePath);const mimeTypes={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};fs.readFile(filePath,(err,content)=>{if(err){fs.readFile('/app/public/index.html',(e,c)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(c)});return}res.writeHead(200,{'Content-Type':mimeTypes[ext]||'text/plain'});res.end(content)})});server.listen(process.env.PORT||3000,()=>console.log('API Bridge rodando na porta '+(process.env.PORT||3000)))"]
