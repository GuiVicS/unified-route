/**
 * API Bridge Server
 * Servidor de produção com proxy de API integrado
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeProxy } from './server/proxy.js';
import { syncAll, getAllData, getAuditLogs, getSettings, saveSettings } from './server/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIR = path.join(__dirname, 'dist');

// MIME types para arquivos estáticos
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

/**
 * Obtém o IP real do cliente
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.socket.remoteAddress ||
         'unknown';
}

/**
 * Configura headers CORS
 */
function setCorsHeaders(res, req) {
  const settings = getSettings();
  const origin = req.headers.origin || '*';
  
  // Verifica se a origem é permitida
  const allowedOrigins = settings.corsOrigins || ['*'];
  const isAllowed = allowedOrigins.includes('*') || allowedOrigins.includes(origin);
  
  res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : allowedOrigins[0] || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Client-Token, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Envia resposta JSON
 */
function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * Lê o body da requisição como JSON
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Handler para POST /api/proxy
 */
async function handleProxy(req, res) {
  try {
    const clientToken = req.headers['x-client-token'];
    const ipAddress = getClientIP(req);
    const body = await readBody(req);
    
    // Validar estrutura da requisição
    if (!body.connectionId || !body.method || !body.path) {
      return sendJSON(res, 400, {
        error: 'INVALID_REQUEST',
        message: 'Campos obrigatórios: connectionId, method, path',
      });
    }
    
    // Executar proxy
    const result = await executeProxy(body, clientToken, ipAddress);
    
    if (result.error) {
      return sendJSON(res, result.error.code, {
        error: result.error.error,
        message: result.error.message,
      });
    }
    
    // Retornar resposta da API de destino
    sendJSON(res, result.status, {
      data: result.data,
      meta: {
        status: result.status,
        latencyMs: result.latencyMs,
      },
    });
    
  } catch (error) {
    console.error('Proxy error:', error);
    sendJSON(res, 500, {
      error: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
    });
  }
}

/**
 * Handler para GET /api/sync - Obtém dados do backend
 */
function handleSyncGet(req, res) {
  try {
    const data = getAllData();
    sendJSON(res, 200, data);
  } catch (error) {
    console.error('Sync GET error:', error);
    sendJSON(res, 500, { error: 'SYNC_ERROR', message: error.message });
  }
}

/**
 * Handler para POST /api/sync - Sincroniza dados do frontend
 */
async function handleSyncPost(req, res) {
  try {
    const body = await readBody(req);
    const result = syncAll(body);
    sendJSON(res, 200, result);
  } catch (error) {
    console.error('Sync POST error:', error);
    sendJSON(res, 500, { error: 'SYNC_ERROR', message: error.message });
  }
}

/**
 * Handler para GET /api/logs - Obtém logs de auditoria
 */
function handleLogs(req, res) {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    const logs = getAuditLogs(limit, offset);
    sendJSON(res, 200, { logs, limit, offset });
  } catch (error) {
    console.error('Logs error:', error);
    sendJSON(res, 500, { error: 'LOGS_ERROR', message: error.message });
  }
}

/**
 * Handler para arquivos estáticos e SPA
 */
function handleStatic(req, res) {
  const url = req.url.split('?')[0];
  let file = path.join(DIR, url === '/' ? 'index.html' : url);
  
  fs.readFile(file, (err, data) => {
    if (err) {
      // Fallback para index.html (SPA)
      fs.readFile(path.join(DIR, 'index.html'), (e, d) => {
        if (e) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(d);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

// Criar servidor HTTP
const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method.toUpperCase();
  
  // Configurar CORS para todas as requisições
  setCorsHeaders(res, req);
  
  // Preflight CORS
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Health check
  if (url === '/health') {
    sendJSON(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
    return;
  }
  
  // API Routes
  if (url === '/api/proxy' && method === 'POST') {
    return handleProxy(req, res);
  }
  
  if (url === '/api/sync') {
    if (method === 'GET') return handleSyncGet(req, res);
    if (method === 'POST') return handleSyncPost(req, res);
  }
  
  if (url === '/api/logs' && method === 'GET') {
    return handleLogs(req, res);
  }
  
  // Arquivos estáticos
  handleStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║           API Bridge Server Running               ║
╠═══════════════════════════════════════════════════╣
║  Port: ${PORT}                                       ║
║  Health: http://localhost:${PORT}/health              ║
║  Proxy:  POST http://localhost:${PORT}/api/proxy      ║
║  Sync:   GET/POST http://localhost:${PORT}/api/sync   ║
╚═══════════════════════════════════════════════════╝
  `);
});
