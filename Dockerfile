# ===========================================
# API Bridge - Dockerfile de Produção
# Build: docker build -t apibridge .
# Run:   docker run -p 3000:3000 apibridge
# ===========================================

# ==============================
# Stage 1: Dependências
# ==============================
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* bun.lockb* ./

RUN \
  if [ -f bun.lockb ]; then \
    npm install -g bun && bun install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install; \
  fi

# ==============================
# Stage 2: Build
# ==============================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build

# ==============================
# Stage 3: Produção
# ==============================
FROM node:20-alpine AS production

LABEL maintainer="API Bridge"
LABEL version="1.0.0"

WORKDIR /app

RUN apk add --no-cache dumb-init curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S apibridge -u 1001 -G nodejs \
    && mkdir -p /app/public /app/data \
    && chown -R apibridge:nodejs /app

COPY --from=builder --chown=apibridge:nodejs /app/dist ./public

# Servidor embutido
RUN echo 'const http=require("http"),fs=require("fs"),path=require("path"),url=require("url");const PORT=process.env.PORT||3000,DIR="/app/public";const MIME={".html":"text/html",".js":"application/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml",".ico":"image/x-icon",".woff2":"font/woff2"};const server=http.createServer((req,res)=>{const p=url.parse(req.url).pathname;if(p==="/health"){res.writeHead(200,{"Content-Type":"application/json"});res.end(JSON.stringify({status:"ok",uptime:process.uptime()}));return}let file=path.join(DIR,p==="/"?"index.html":p);if(!file.startsWith(DIR)){res.writeHead(403);res.end("Forbidden");return}fs.readFile(file,(err,data)=>{if(err){fs.readFile(path.join(DIR,"index.html"),(e,d)=>{res.writeHead(200,{"Content-Type":"text/html"});res.end(d)});return}const ext=path.extname(file);res.writeHead(200,{"Content-Type":MIME[ext]||"text/plain","Cache-Control":ext===".html"?"no-cache":"max-age=31536000"});res.end(data)})});process.on("SIGTERM",()=>{server.close(()=>process.exit(0))});server.listen(PORT,"0.0.0.0",()=>console.log("API Bridge running on port "+PORT))' > server.js

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

USER apibridge

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
