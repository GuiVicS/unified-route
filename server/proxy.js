/**
 * Proxy Module - Lógica de proxy e autenticação
 * Gerencia o repasse de requisições para APIs externas
 */

import { getConnectionById, getClientByToken, addAuditLog, getSettings } from './storage.js';

/**
 * Códigos de erro padronizados
 */
export const ProxyErrors = {
  UNAUTHORIZED: { code: 401, error: 'UNAUTHORIZED', message: 'Token inválido ou ausente' },
  CLIENT_DISABLED: { code: 403, error: 'CLIENT_DISABLED', message: 'Cliente desativado' },
  FORBIDDEN: { code: 403, error: 'FORBIDDEN', message: 'Cliente sem acesso a esta conexão' },
  CONNECTION_NOT_FOUND: { code: 404, error: 'CONNECTION_NOT_FOUND', message: 'Conexão não encontrada' },
  CONNECTION_DISABLED: { code: 403, error: 'CONNECTION_DISABLED', message: 'Conexão desativada' },
  METHOD_NOT_ALLOWED: { code: 403, error: 'METHOD_NOT_ALLOWED', message: 'Método HTTP não permitido' },
  PATH_NOT_ALLOWED: { code: 403, error: 'PATH_NOT_ALLOWED', message: 'Caminho não permitido' },
  INVALID_REQUEST: { code: 400, error: 'INVALID_REQUEST', message: 'Requisição inválida' },
  UPSTREAM_ERROR: { code: 502, error: 'UPSTREAM_ERROR', message: 'Erro na API de destino' },
  UPSTREAM_TIMEOUT: { code: 504, error: 'UPSTREAM_TIMEOUT', message: 'Timeout na API de destino' },
};

/**
 * Valida o token do cliente
 */
export function validateClientToken(token) {
  if (!token || !token.startsWith('ab_')) {
    return { valid: false, error: ProxyErrors.UNAUTHORIZED };
  }
  
  const client = getClientByToken(token);
  
  if (!client) {
    return { valid: false, error: ProxyErrors.UNAUTHORIZED };
  }
  
  if (!client.enabled) {
    return { valid: false, error: ProxyErrors.CLIENT_DISABLED };
  }
  
  return { valid: true, client };
}

/**
 * Verifica se o cliente tem acesso à conexão
 */
export function validateClientAccess(client, connectionId) {
  // Se não há restrição de conexões, permite todas
  if (!client.allowedConnectionIds || client.allowedConnectionIds.length === 0) {
    return true;
  }
  
  return client.allowedConnectionIds.includes(connectionId);
}

/**
 * Valida se o método HTTP é permitido
 */
export function validateMethod(connection, method) {
  if (!connection.allowedMethods || connection.allowedMethods.length === 0) {
    return true;
  }
  
  return connection.allowedMethods.includes(method.toUpperCase());
}

/**
 * Valida se o caminho é permitido
 */
export function validatePath(connection, path) {
  if (!connection.allowedPathPrefixes || connection.allowedPathPrefixes.length === 0) {
    return true;
  }
  
  return connection.allowedPathPrefixes.some(prefix => path.startsWith(prefix));
}

/**
 * Injeta credenciais baseado no esquema de autenticação
 */
export function injectCredentials(connection, headers) {
  const authHeaders = { ...headers };
  
  switch (connection.authScheme) {
    case 'BEARER':
      if (connection.apiKey) {
        authHeaders['Authorization'] = `Bearer ${connection.apiKey}`;
      }
      break;
      
    case 'BASIC':
      if (connection.apiKey) {
        const credentials = connection.secret 
          ? `${connection.apiKey}:${connection.secret}`
          : connection.apiKey;
        const encoded = Buffer.from(credentials).toString('base64');
        authHeaders['Authorization'] = `Basic ${encoded}`;
      }
      break;
      
    case 'HEADER_PAIR':
      // Usado pela Yampi: User-Token e User-Secret-Key
      if (connection.apiKey) {
        authHeaders['User-Token'] = connection.apiKey;
      }
      if (connection.secret) {
        authHeaders['User-Secret-Key'] = connection.secret;
      }
      break;
      
    case 'QUERY':
      // Credenciais serão adicionadas na query string
      break;
      
    case 'CUSTOM':
      if (connection.customAuth) {
        const { headerName, headerValueTemplate } = connection.customAuth;
        let value = headerValueTemplate;
        
        if (connection.apiKey) {
          value = value.replace('{{apiKey}}', connection.apiKey);
        }
        if (connection.secret) {
          value = value.replace('{{secret}}', connection.secret);
        }
        
        authHeaders[headerName] = value;
      }
      break;
      
    case 'NONE':
    default:
      // Sem autenticação
      break;
  }
  
  // Adiciona headers extras da conexão
  if (connection.extraHeaders) {
    Object.assign(authHeaders, connection.extraHeaders);
  }
  
  return authHeaders;
}

/**
 * Constrói a URL de destino
 */
export function buildTargetUrl(connection, path, query) {
  let baseUrl = connection.baseUrl.replace(/\/$/, '');
  let targetPath = path.startsWith('/') ? path : `/${path}`;
  
  let url = `${baseUrl}${targetPath}`;
  
  // Adiciona query string
  const queryParams = new URLSearchParams();
  
  // Query params da requisição
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
  }
  
  // Adiciona credenciais na query se o esquema for QUERY
  if (connection.authScheme === 'QUERY' && connection.apiKey) {
    queryParams.append('api_key', connection.apiKey);
    if (connection.secret) {
      queryParams.append('api_secret', connection.secret);
    }
  }
  
  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
}

/**
 * Executa a requisição de proxy
 */
export async function executeProxy(request, clientToken, ipAddress) {
  const startTime = Date.now();
  const { connectionId, method, path, query, headers = {}, body } = request;
  
  // Validar token do cliente
  const tokenValidation = validateClientToken(clientToken);
  if (!tokenValidation.valid) {
    return { error: tokenValidation.error };
  }
  
  const client = tokenValidation.client;
  
  // Buscar conexão
  const connection = getConnectionById(connectionId);
  if (!connection) {
    return { error: ProxyErrors.CONNECTION_NOT_FOUND };
  }
  
  // Verificar se conexão está ativa
  if (!connection.enabled) {
    return { error: ProxyErrors.CONNECTION_DISABLED };
  }
  
  // Verificar acesso do cliente à conexão
  if (!validateClientAccess(client, connectionId)) {
    return { error: ProxyErrors.FORBIDDEN };
  }
  
  // Validar método HTTP
  if (!validateMethod(connection, method)) {
    return { error: ProxyErrors.METHOD_NOT_ALLOWED };
  }
  
  // Validar caminho
  if (!validatePath(connection, path)) {
    return { error: ProxyErrors.PATH_NOT_ALLOWED };
  }
  
  // Construir URL de destino
  const targetUrl = buildTargetUrl(connection, path, query);
  
  // Injetar credenciais nos headers
  const authHeaders = injectCredentials(connection, headers);
  
  // Garantir Content-Type para requisições com body
  if (body && !authHeaders['Content-Type']) {
    authHeaders['Content-Type'] = 'application/json';
  }
  
  // Remover headers que não devem ser repassados
  delete authHeaders['host'];
  delete authHeaders['x-client-token'];
  delete authHeaders['connection'];
  delete authHeaders['content-length'];
  
  try {
    const settings = getSettings();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), settings.upstreamTimeoutMs || 15000);
    
    // Executar requisição
    const response = await fetch(targetUrl, {
      method: method.toUpperCase(),
      headers: authHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const latencyMs = Date.now() - startTime;
    
    // Ler resposta
    let responseData;
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // Registrar audit log
    addAuditLog({
      connectionId,
      connectionName: connection.name,
      clientId: client.id,
      clientName: client.name,
      method: method.toUpperCase(),
      host: new URL(targetUrl).host,
      path,
      status: response.status,
      latencyMs,
      responseSize: JSON.stringify(responseData).length,
      ipAddress,
    });
    
    return {
      success: true,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      latencyMs,
    };
    
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    // Registrar erro no audit log
    addAuditLog({
      connectionId,
      connectionName: connection.name,
      clientId: client.id,
      clientName: client.name,
      method: method.toUpperCase(),
      host: new URL(connection.baseUrl).host,
      path,
      status: error.name === 'AbortError' ? 504 : 502,
      latencyMs,
      responseSize: 0,
      ipAddress,
      error: error.message,
    });
    
    if (error.name === 'AbortError') {
      return { error: { ...ProxyErrors.UPSTREAM_TIMEOUT, latencyMs } };
    }
    
    return { 
      error: { 
        ...ProxyErrors.UPSTREAM_ERROR, 
        message: `Erro na API de destino: ${error.message}`,
        latencyMs,
      } 
    };
  }
}
