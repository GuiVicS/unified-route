-- ===========================================
-- API Bridge - Script de Inicialização do Banco
-- Este script é executado automaticamente na primeira inicialização
-- ===========================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================
-- Tabela: connections
-- Armazena configurações de conexões com provedores de API
-- ==============================
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    provider_type VARCHAR(50) NOT NULL DEFAULT 'GENERIC',
    base_url TEXT NOT NULL,
    auth_scheme VARCHAR(50) NOT NULL DEFAULT 'BEARER',
    
    -- Credenciais criptografadas (AES-256-GCM)
    encrypted_credentials TEXT,
    
    -- Headers extras (JSON)
    extra_headers JSONB DEFAULT '{}',
    
    -- Restrições de segurança
    allowed_hosts TEXT[] DEFAULT '{}',
    allowed_path_prefixes TEXT[] DEFAULT '{}',
    allowed_methods TEXT[] DEFAULT ARRAY['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    
    -- Status
    enabled BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- Tabela: clients
-- Armazena tokens de acesso para aplicações cliente
-- ==============================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    
    -- Token hasheado (SHA-256)
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    token_prefix VARCHAR(10) NOT NULL, -- Primeiros caracteres para identificação
    
    -- Permissões
    allowed_origins TEXT[] DEFAULT '{}',
    allowed_connection_ids UUID[] DEFAULT '{}',
    
    -- Status
    enabled BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- ==============================
-- Tabela: audit_logs
-- Registra todas as requisições proxiadas
-- ==============================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Referências
    connection_id UUID REFERENCES connections(id) ON DELETE SET NULL,
    connection_name VARCHAR(255),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255),
    
    -- Detalhes da requisição
    method VARCHAR(10) NOT NULL,
    host VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    query_params JSONB DEFAULT '{}',
    
    -- Resposta
    status_code INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    response_size INTEGER DEFAULT 0,
    
    -- Metadados
    ip_address INET,
    user_agent TEXT,
    error_message TEXT
);

-- ==============================
-- Tabela: settings
-- Configurações globais do sistema
-- ==============================
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- Tabela: admin_users
-- Usuários administrativos
-- ==============================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- ==============================
-- Índices para performance
-- ==============================
CREATE INDEX IF NOT EXISTS idx_connections_enabled ON connections(enabled);
CREATE INDEX IF NOT EXISTS idx_connections_provider ON connections(provider_type);

CREATE INDEX IF NOT EXISTS idx_clients_enabled ON clients(enabled);
CREATE INDEX IF NOT EXISTS idx_clients_token_hash ON clients(token_hash);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_connection ON audit_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_client ON audit_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status_code);

-- ==============================
-- Triggers para updated_at
-- ==============================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_connections_updated_at ON connections;
CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================
-- Configurações iniciais
-- ==============================
INSERT INTO settings (key, value) VALUES
    ('rate_limit_per_min', '60'),
    ('enable_audit_logs', 'true'),
    ('upstream_timeout_ms', '15000')
ON CONFLICT (key) DO NOTHING;

-- ==============================
-- Comentários nas tabelas
-- ==============================
COMMENT ON TABLE connections IS 'Configurações de conexões com provedores de API externos';
COMMENT ON TABLE clients IS 'Tokens de acesso para aplicações cliente';
COMMENT ON TABLE audit_logs IS 'Log de auditoria de todas as requisições proxiadas';
COMMENT ON TABLE settings IS 'Configurações globais do sistema';
COMMENT ON TABLE admin_users IS 'Usuários com acesso ao painel administrativo';

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'API Bridge: Banco de dados inicializado com sucesso!';
END $$;
