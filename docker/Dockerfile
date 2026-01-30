# ===========================================
# API Bridge - Dockerfile
# Imagem multi-stage otimizada para produção
# ===========================================

# ==============================
# Stage 1: Instalação de dependências
# ==============================
FROM node:20-alpine AS deps

WORKDIR /app

# Instalar dependências de build
RUN apk add --no-cache libc6-compat

# Copiar apenas arquivos de dependência para cache
COPY package.json package-lock.json* bun.lockb* ./

# Instalar dependências (preferir bun se disponível)
RUN if [ -f bun.lockb ]; then \
      npm install -g bun && bun install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci --only=production=false; \
    else \
      npm install; \
    fi

# ==============================
# Stage 2: Build do Frontend
# ==============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar node_modules do stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build da aplicação
ENV NODE_ENV=production
RUN npm run build

# ==============================
# Stage 3: Imagem de Produção
# ==============================
FROM node:20-alpine AS production

LABEL maintainer="API Bridge Team"
LABEL description="API Bridge - Ponte Universal de APIs"
LABEL version="1.0.0"

WORKDIR /app

# Instalar apenas o necessário para produção
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Criar usuário não-root por segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apibridge -u 1001 -G nodejs

# Criar diretórios necessários
RUN mkdir -p /app/public /app/data /app/logs && \
    chown -R apibridge:nodejs /app

# Copiar frontend buildado
COPY --from=builder --chown=apibridge:nodejs /app/dist ./public

# Criar servidor estático inline (será substituído por backend real)
COPY --chown=apibridge:nodejs docker/server.js ./server.js

# Variáveis de ambiente padrão
ENV NODE_ENV=production \
    PORT=3000 \
    TZ=America/Sao_Paulo

# Expor porta
EXPOSE 3000

# Trocar para usuário não-root
USER apibridge

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Volume para dados persistentes
VOLUME ["/app/data", "/app/logs"]

# Usar dumb-init para gerenciar processos
ENTRYPOINT ["dumb-init", "--"]

# Comando padrão
CMD ["node", "server.js"]
