# API Bridge - Universal API Proxy

A secure, self-hosted universal API proxy system for managing multiple API connections with encrypted credentials.

## Features

- **Secure Credential Storage**: AES-256-GCM encryption for API keys and secrets
- **Universal Proxy Endpoint**: Single endpoint to proxy requests to multiple APIs
- **Client Token Management**: Generate tokens for external applications
- **CORS Control**: Allowlist of origins per client or globally
- **Rate Limiting**: Configurable rate limits per token/IP
- **Audit Logging**: Complete request logging for debugging
- **Auto-Detection**: Automatic provider detection for popular APIs

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Bridge                                │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript + Tailwind)                       │
│  ├── Admin Panel (Login, Dashboard, Connections, Clients, Logs) │
│  └── Served by backend in production                            │
├─────────────────────────────────────────────────────────────────┤
│  Backend (Node.js + Express/Fastify + TypeScript)               │
│  ├── Authentication (Session cookies + CSRF)                    │
│  ├── Encryption Service (AES-256-GCM)                           │
│  ├── Proxy Handler (Universal endpoint)                         │
│  ├── Rate Limiter                                               │
│  └── Audit Logger                                               │
├─────────────────────────────────────────────────────────────────┤
│  Database (SQLite)                                              │
│  ├── connections (encrypted credentials)                        │
│  ├── clients (hashed tokens)                                    │
│  ├── users (admin accounts)                                     │
│  └── audit_logs                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start (Development - Frontend Only)

This repository contains the **frontend admin panel**. For a complete deployment, you'll need to implement the backend.

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Demo credentials: `admin@apibridge.local` / `admin123`

## Backend Implementation Guide

### Required Environment Variables

```env
# Master key for credential encryption (32 bytes, base64 or hex)
MASTER_KEY=your-32-byte-base64-key-here

# Admin seed (for first run)
ADMIN_SEED_EMAIL=admin@yourcompany.com
ADMIN_SEED_PASSWORD=your-secure-password

# Timeouts and limits
UPSTREAM_TIMEOUT_MS=15000
RATE_LIMIT_PER_MIN=60

# Database
DATABASE_PATH=./data/apibridge.db
```

### Generate Master Key

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Database Schema (SQLite)

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Connections table
CREATE TABLE connections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  base_url TEXT NOT NULL,
  auth_scheme TEXT NOT NULL,
  credentials_encrypted TEXT,
  credentials_iv TEXT,
  credentials_auth_tag TEXT,
  extra_headers TEXT,
  allowed_hosts TEXT,
  allowed_path_prefixes TEXT,
  allowed_methods TEXT DEFAULT 'GET,POST,PUT,PATCH',
  enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  allowed_origins TEXT,
  allowed_connection_ids TEXT,
  enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_used_at TEXT
);

-- Audit logs table
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  connection_id TEXT,
  client_id TEXT,
  method TEXT,
  host TEXT,
  path TEXT,
  status INTEGER,
  latency_ms INTEGER,
  response_size INTEGER,
  ip_address TEXT
);

-- Security settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### Encryption Implementation (Node.js)

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function encrypt(plaintext: string, masterKey: Buffer): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  return {
    encrypted,
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
  };
}

export function decrypt(
  encrypted: string,
  iv: string,
  authTag: string,
  masterKey: Buffer
): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    masterKey,
    Buffer.from(iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Proxy Endpoint Implementation

```typescript
// POST /api/proxy
interface ProxyRequest {
  connectionId: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
}

async function handleProxy(req: Request, res: Response) {
  // 1. Validate client token
  const token = req.headers['x-client-token'];
  const client = await validateClientToken(token);
  
  // 2. Get connection and decrypt credentials
  const connection = await getConnection(req.body.connectionId);
  const credentials = decryptCredentials(connection);
  
  // 3. Validate request
  validatePath(req.body.path, connection);
  validateHost(connection);
  
  // 4. Build upstream URL
  const url = buildUrl(connection.baseUrl, req.body.path, req.body.query);
  
  // 5. Apply authentication
  const headers = applyAuth(credentials, connection.authScheme, req.body.headers);
  
  // 6. Make upstream request
  const startTime = Date.now();
  const response = await fetch(url, {
    method: req.body.method,
    headers,
    body: req.body.body ? JSON.stringify(req.body.body) : undefined,
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  
  // 7. Log request
  await logRequest({
    connectionId: connection.id,
    clientId: client.id,
    method: req.body.method,
    host: new URL(url).host,
    path: req.body.path,
    status: response.status,
    latencyMs: Date.now() - startTime,
  });
  
  // 8. Return response
  res.status(response.status);
  res.set('content-type', response.headers.get('content-type'));
  res.send(await response.text());
}
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# Build frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Build backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY backend/ ./backend/
RUN cd backend && npm run build

FROM node:20-alpine
WORKDIR /app

# Copy built assets
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/frontend/dist ./public

# Create data directory
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  apibridge:
    build: .
    container_name: apibridge
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - MASTER_KEY=${MASTER_KEY}
      - ADMIN_SEED_EMAIL=${ADMIN_SEED_EMAIL:-admin@apibridge.local}
      - ADMIN_SEED_PASSWORD=${ADMIN_SEED_PASSWORD}
      - UPSTREAM_TIMEOUT_MS=${UPSTREAM_TIMEOUT_MS:-15000}
      - RATE_LIMIT_PER_MIN=${RATE_LIMIT_PER_MIN:-60}
    volumes:
      - apibridge_data:/app/data

volumes:
  apibridge_data:
```

### Deploy to VPS

```bash
# 1. Clone repository
git clone https://github.com/your-org/api-bridge.git
cd api-bridge

# 2. Create .env file
cat > .env << EOF
MASTER_KEY=$(openssl rand -base64 32)
ADMIN_SEED_EMAIL=admin@yourcompany.com
ADMIN_SEED_PASSWORD=$(openssl rand -base64 16)
UPSTREAM_TIMEOUT_MS=15000
RATE_LIMIT_PER_MIN=60
EOF

# 3. Build and run
docker-compose up -d

# 4. Check logs
docker-compose logs -f
```

## API Usage Examples

### With Client Token (Recommended)

```bash
# GET request
curl -X POST https://your-domain.com/api/proxy \
  -H "Content-Type: application/json" \
  -H "X-Client-Token: ab_YourClientTokenHere" \
  -d '{
    "connectionId": "conn-001",
    "method": "GET",
    "path": "/orders",
    "query": {
      "q": "cliente@email.com",
      "include": "status,customer"
    }
  }'

# POST request with body
curl -X POST https://your-domain.com/api/proxy \
  -H "Content-Type: application/json" \
  -H "X-Client-Token: ab_YourClientTokenHere" \
  -d '{
    "connectionId": "conn-001",
    "method": "POST",
    "path": "/chat/completions",
    "body": {
      "model": "gpt-4",
      "messages": [{"role": "user", "content": "Hello!"}]
    }
  }'
```

### Response Format

```json
{
  "status": 200,
  "headers": {
    "content-type": "application/json"
  },
  "body": {
    "data": "..."
  }
}
```

### Error Responses

```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or missing client token"
}

{
  "error": "CONNECTION_NOT_FOUND",
  "message": "Connection not found or disabled"
}

{
  "error": "PATH_NOT_ALLOWED",
  "message": "Path /admin is not in allowed prefixes"
}

{
  "error": "RATE_LIMITED",
  "message": "Rate limit exceeded. Try again in 60 seconds"
}
```

## Security Considerations

1. **Never expose MASTER_KEY** - Store only in environment variables
2. **Use HTTPS** - Always deploy behind TLS/SSL
3. **Rotate client tokens** - Regenerate tokens periodically
4. **Monitor audit logs** - Watch for unusual patterns
5. **Restrict origins** - Configure allowed origins per client
6. **Limit connections** - Only allow specific connections per client

## License

MIT
