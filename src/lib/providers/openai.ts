// OpenAI Provider Configuration
// Based on official OpenAI API documentation

export interface OpenAICredentials {
  apiKey: string;
  organizationId?: string;
}

export interface OpenAIConfig {
  name: string;
  baseUrl: string;
  credentials: OpenAICredentials;
  enabled: boolean;
}

// OpenAI API base URL
export const OPENAI_API_BASE = 'https://api.openai.com/v1';

// Available OpenAI API endpoints
export const OPENAI_ENDPOINTS = {
  // Chat Completions
  CHAT_COMPLETIONS: '/chat/completions',
  
  // Completions (Legacy)
  COMPLETIONS: '/completions',
  
  // Embeddings
  EMBEDDINGS: '/embeddings',
  
  // Images
  IMAGES_GENERATIONS: '/images/generations',
  IMAGES_EDITS: '/images/edits',
  IMAGES_VARIATIONS: '/images/variations',
  
  // Audio
  AUDIO_TRANSCRIPTIONS: '/audio/transcriptions',
  AUDIO_TRANSLATIONS: '/audio/translations',
  AUDIO_SPEECH: '/audio/speech',
  
  // Files
  FILES: '/files',
  FILE_BY_ID: '/files/{id}',
  FILE_CONTENT: '/files/{id}/content',
  
  // Fine-tuning
  FINE_TUNING_JOBS: '/fine_tuning/jobs',
  FINE_TUNING_JOB: '/fine_tuning/jobs/{id}',
  
  // Models
  MODELS: '/models',
  MODEL_BY_ID: '/models/{id}',
  
  // Moderations
  MODERATIONS: '/moderations',
  
  // Assistants
  ASSISTANTS: '/assistants',
  ASSISTANT_BY_ID: '/assistants/{id}',
  THREADS: '/threads',
  THREAD_BY_ID: '/threads/{id}',
  MESSAGES: '/threads/{thread_id}/messages',
  RUNS: '/threads/{thread_id}/runs',
} as const;

// Available OpenAI models
export const OPENAI_MODELS = {
  // GPT-4 Models
  GPT_4_TURBO: 'gpt-4-turbo',
  GPT_4_TURBO_PREVIEW: 'gpt-4-turbo-preview',
  GPT_4: 'gpt-4',
  GPT_4_32K: 'gpt-4-32k',
  
  // GPT-3.5 Models
  GPT_35_TURBO: 'gpt-3.5-turbo',
  GPT_35_TURBO_16K: 'gpt-3.5-turbo-16k',
  
  // Embedding Models
  TEXT_EMBEDDING_3_LARGE: 'text-embedding-3-large',
  TEXT_EMBEDDING_3_SMALL: 'text-embedding-3-small',
  TEXT_EMBEDDING_ADA_002: 'text-embedding-ada-002',
  
  // Image Models
  DALL_E_3: 'dall-e-3',
  DALL_E_2: 'dall-e-2',
  
  // Audio Models
  WHISPER_1: 'whisper-1',
  TTS_1: 'tts-1',
  TTS_1_HD: 'tts-1-hd',
} as const;

// Required headers for OpenAI API
export function buildOpenAIHeaders(credentials: OpenAICredentials): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${credentials.apiKey}`,
  };
  
  if (credentials.organizationId) {
    headers['OpenAI-Organization'] = credentials.organizationId;
  }
  
  return headers;
}

// Build full URL for OpenAI endpoint
export function buildOpenAIUrl(endpoint: string, params?: Record<string, string>): string {
  let url = `${OPENAI_API_BASE}${endpoint}`;
  
  // Replace path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });
  }
  
  return url;
}

// Validate OpenAI credentials format
export function validateOpenAICredentials(credentials: Partial<OpenAICredentials>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!credentials.apiKey?.trim()) {
    errors.push('API Key é obrigatória');
  } else if (!credentials.apiKey.startsWith('sk-')) {
    errors.push('API Key deve começar com "sk-"');
  }
  
  if (credentials.organizationId && !credentials.organizationId.startsWith('org-')) {
    errors.push('Organization ID deve começar com "org-"');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Test OpenAI connection by calling /models
export async function testOpenAIConnection(credentials: OpenAICredentials): Promise<{
  success: boolean;
  models?: string[];
  error?: string;
  latencyMs: number;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${OPENAI_API_BASE}/models`, {
      method: 'GET',
      headers: buildOpenAIHeaders(credentials),
    });
    
    const latencyMs = Date.now() - startTime;
    
    if (!response.ok) {
      let errorMessage = `Erro HTTP ${response.status}`;
      
      if (response.status === 401) {
        errorMessage = 'API Key inválida ou expirada';
      } else if (response.status === 403) {
        errorMessage = 'Sem permissão. Verifique sua Organization ID.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit excedido. Tente novamente em alguns segundos.';
      }
      
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {}
      
      return {
        success: false,
        error: errorMessage,
        latencyMs,
      };
    }
    
    const data = await response.json();
    
    // Get list of available models (top 5 most common)
    const models = data.data
      ?.slice(0, 10)
      .map((m: { id: string }) => m.id)
      .filter((id: string) => 
        id.includes('gpt') || 
        id.includes('dall-e') || 
        id.includes('whisper') ||
        id.includes('embedding')
      );
    
    return {
      success: true,
      models: models || [],
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return { success: false, error: 'Timeout na conexão', latencyMs };
      }
      return { success: false, error: error.message, latencyMs };
    }
    
    return { success: false, error: 'Erro desconhecido', latencyMs };
  }
}

// Default recommended path prefixes for OpenAI
export const OPENAI_RECOMMENDED_PATHS = [
  '/v1/chat',
  '/v1/completions',
  '/v1/embeddings',
  '/v1/images',
  '/v1/audio',
  '/v1/models',
  '/v1/files',
  '/v1/fine_tuning',
  '/v1/assistants',
  '/v1/threads',
  '/v1/moderations',
];

// Default allowed methods for OpenAI
export const OPENAI_ALLOWED_METHODS = ['GET', 'POST', 'DELETE'] as const;
