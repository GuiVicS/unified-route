/**
 * Storage Module - Persistência de dados em arquivos JSON
 * Gerencia conexões, clientes e configurações do servidor
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório de dados (será montado como volume no Docker)
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

// Arquivos de dados
const FILES = {
  connections: path.join(DATA_DIR, 'connections.json'),
  clients: path.join(DATA_DIR, 'clients.json'),
  settings: path.join(DATA_DIR, 'settings.json'),
  auditLogs: path.join(DATA_DIR, 'audit-logs.json'),
};

/**
 * Garante que o diretório de dados existe
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Lê um arquivo JSON com fallback para valor padrão
 */
function readJSON(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Erro ao ler ${filePath}:`, error.message);
  }
  return defaultValue;
}

/**
 * Escreve dados em um arquivo JSON
 */
function writeJSON(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ============ CONNECTIONS ============

/**
 * Obtém todas as conexões (sem credenciais sensíveis para API pública)
 */
export function getConnections() {
  return readJSON(FILES.connections, []);
}

/**
 * Obtém uma conexão por ID (com credenciais para uso interno do proxy)
 */
export function getConnectionById(id) {
  const connections = getConnections();
  return connections.find(c => c.id === id) || null;
}

/**
 * Salva todas as conexões (usado na sincronização)
 */
export function saveConnections(connections) {
  writeJSON(FILES.connections, connections);
}

/**
 * Adiciona ou atualiza uma conexão
 */
export function upsertConnection(connection) {
  const connections = getConnections();
  const index = connections.findIndex(c => c.id === connection.id);
  
  if (index >= 0) {
    connections[index] = { ...connections[index], ...connection };
  } else {
    connections.push(connection);
  }
  
  saveConnections(connections);
  return connection;
}

/**
 * Remove uma conexão
 */
export function deleteConnection(id) {
  const connections = getConnections().filter(c => c.id !== id);
  saveConnections(connections);
}

// ============ CLIENTS ============

/**
 * Obtém todos os clientes
 */
export function getClients() {
  return readJSON(FILES.clients, []);
}

/**
 * Obtém um cliente por ID
 */
export function getClientById(id) {
  const clients = getClients();
  return clients.find(c => c.id === id) || null;
}

/**
 * Obtém um cliente pelo token
 */
export function getClientByToken(token) {
  const clients = getClients();
  return clients.find(c => c.token === token) || null;
}

/**
 * Salva todos os clientes (usado na sincronização)
 */
export function saveClients(clients) {
  writeJSON(FILES.clients, clients);
}

/**
 * Adiciona ou atualiza um cliente
 */
export function upsertClient(client) {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === client.id);
  
  if (index >= 0) {
    clients[index] = { ...clients[index], ...client };
  } else {
    clients.push(client);
  }
  
  saveClients(clients);
  return client;
}

/**
 * Remove um cliente
 */
export function deleteClient(id) {
  const clients = getClients().filter(c => c.id !== id);
  saveClients(clients);
}

// ============ SETTINGS ============

/**
 * Obtém as configurações do servidor
 */
export function getSettings() {
  return readJSON(FILES.settings, {
    corsOrigins: ['*'],
    rateLimitPerMin: 60,
    upstreamTimeoutMs: 15000,
  });
}

/**
 * Salva as configurações do servidor
 */
export function saveSettings(settings) {
  writeJSON(FILES.settings, settings);
}

// ============ AUDIT LOGS ============

/**
 * Adiciona um log de auditoria
 */
export function addAuditLog(log) {
  const logs = readJSON(FILES.auditLogs, []);
  
  logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...log,
  });
  
  // Mantém apenas os últimos 10000 logs
  if (logs.length > 10000) {
    logs.length = 10000;
  }
  
  writeJSON(FILES.auditLogs, logs);
}

/**
 * Obtém logs de auditoria (com paginação opcional)
 */
export function getAuditLogs(limit = 100, offset = 0) {
  const logs = readJSON(FILES.auditLogs, []);
  return logs.slice(offset, offset + limit);
}

// ============ SYNC ============

/**
 * Sincroniza todos os dados do frontend para o backend
 */
export function syncAll(data) {
  if (data.connections) {
    saveConnections(data.connections);
  }
  if (data.clients) {
    saveClients(data.clients);
  }
  if (data.settings) {
    saveSettings(data.settings);
  }
  return { success: true, timestamp: new Date().toISOString() };
}

/**
 * Obtém todos os dados para sincronização com o frontend
 */
export function getAllData() {
  return {
    connections: getConnections(),
    clients: getClients(),
    settings: getSettings(),
    timestamp: new Date().toISOString(),
  };
}
