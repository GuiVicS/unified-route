# ===========================================
# API Bridge - Dockerfile Simplificado
# Compatível com EasyPanel/Nixpacks
# ===========================================

FROM node:20-alpine

WORKDIR /app

# Copiar dependências
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# Build
RUN npm run build

# Criar servidor
RUN mkdir -p /app/public && cp -r dist/* /app/public/ 2>/dev/null || true

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Servidor estático simples
CMD ["node", "-e", "\
const http = require('http');\
const fs = require('fs');\
const path = require('path');\
const PORT = process.env.PORT || 3000;\
const DIR = './dist';\
const MIME = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};\
http.createServer((req, res) => {\
  if (req.url === '/health') { res.writeHead(200); res.end('OK'); return; }\
  let file = path.join(DIR, req.url === '/' ? 'index.html' : req.url);\
  fs.readFile(file, (err, data) => {\
    if (err) { fs.readFile(path.join(DIR, 'index.html'), (e, d) => { res.writeHead(200, {'Content-Type':'text/html'}); res.end(d); }); return; }\
    res.writeHead(200, {'Content-Type': MIME[path.extname(file)] || 'text/plain'});\
    res.end(data);\
  });\
}).listen(PORT, () => console.log('Running on port ' + PORT));\
"]
