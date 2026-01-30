/**
 * API Bridge - Servidor Estático de Produção
 * Este servidor serve o frontend buildado e fornece endpoints básicos.
 * Em produção completa, será substituído pelo backend Node.js/Express.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types comuns
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json',
};

// Headers de segurança
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Logs formatados
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };
  console.log(JSON.stringify(logEntry));
}

// Servir arquivo estático
function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // Fallback para index.html (SPA routing)
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (indexErr, indexContent) => {
        if (indexErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS });
        res.end(indexContent);
      });
      return;
    }

    // Cache headers para assets
    const cacheControl = contentType.includes('text/html')
      ? 'no-cache, no-store, must-revalidate'
      : 'public, max-age=31536000, immutable';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      ...SECURITY_HEADERS,
    });
    res.end(content);
  });
}

// Criar servidor HTTP
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Log de requisições
  const startTime = Date.now();

  res.on('finish', () => {
    log('info', 'request', {
      method,
      path: pathname,
      status: res.statusCode,
      duration: Date.now() - startTime,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    });
  });

  // Health check endpoint
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    }));
    return;
  }

  // Ready check (para Kubernetes/Docker)
  if (pathname === '/ready') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
    res.end(JSON.stringify({ ready: true }));
    return;
  }

  // Info endpoint
  if (pathname === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...SECURITY_HEADERS });
    res.end(JSON.stringify({
      name: 'API Bridge',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      mode: 'frontend-only',
      message: 'Backend não configurado. Configure via Setup Wizard.',
    }));
    return;
  }

  // Servir arquivos estáticos
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(PUBLIC_DIR, filePath);

  // Prevenir path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  serveFile(res, filePath, contentType);
});

// Graceful shutdown
function shutdown(signal) {
  log('info', `Recebido ${signal}. Encerrando servidor...`);
  server.close(() => {
    log('info', 'Servidor encerrado com sucesso');
    process.exit(0);
  });

  // Forçar encerramento após 10s
  setTimeout(() => {
    log('error', 'Forçando encerramento após timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Tratamento de erros não capturados
process.on('uncaughtException', (err) => {
  log('error', 'Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log('error', 'Unhandled Rejection', { reason: String(reason) });
});

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => {
  log('info', `API Bridge rodando na porta ${PORT}`, {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    pid: process.pid,
  });
});
