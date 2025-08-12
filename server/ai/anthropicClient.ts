import Anthropic from '@anthropic-ai/sdk';

// Singleton instance
let anthropicInstance: Anthropic | null = null;

interface CallClaudeOptions {
  system?: string;
  user: string;
  jsonSchema?: any;
  maxTokens?: number;
}

interface CallClaudeResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Environment configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
const ANTHROPIC_TIMEOUT_MS = parseInt(process.env.ANTHROPIC_TIMEOUT_MS || '25000');
const AI_PROVIDER = process.env.AI_PROVIDER || 'anthropic';
const AI_MAX_TOKENS_PER_CALL = parseInt(process.env.AI_MAX_TOKENS_PER_CALL || '4096');

// Initialize Anthropic client
function getAnthropicClient(): Anthropic | null {
  if (AI_PROVIDER !== 'anthropic' || !ANTHROPIC_API_KEY) {
    return null;
  }

  if (!anthropicInstance) {
    anthropicInstance = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
      timeout: ANTHROPIC_TIMEOUT_MS,
    });
  }

  return anthropicInstance;
}

// Exponential backoff helper
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Main function to call Claude
export async function callClaude({
  system,
  user,
  jsonSchema,
  maxTokens = 1024
}: CallClaudeOptions): Promise<CallClaudeResponse> {
  const startTime = Date.now();
  
  try {
    // Check if AI is enabled
    if (AI_PROVIDER === 'none') {
      return {
        success: false,
        error: 'AI assistant is disabled'
      };
    }

    // Get client
    const client = getAnthropicClient();
    if (!client) {
      console.error('[AI] Anthropic client not available - check API key and provider settings');
      return {
        success: false,
        error: 'AI service not configured'
      };
    }

    // Enforce token limits
    const effectiveMaxTokens = Math.min(maxTokens, AI_MAX_TOKENS_PER_CALL);

    // Build messages
    const messages: any[] = [{
      role: 'user',
      content: user
    }];

    // Add JSON schema instruction if provided
    let systemPrompt = system || '';
    if (jsonSchema) {
      systemPrompt += `\n\nYou must respond with valid JSON that matches this schema:\n${JSON.stringify(jsonSchema, null, 2)}`;
    }

    // Call Claude with retry logic
    const response = await withRetry(async () => {
      return await client.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: effectiveMaxTokens,
        messages,
        system: systemPrompt || undefined,
        temperature: 0.3,
      });
    });

    // Extract content
    const content = response.content[0]?.type === 'text' 
      ? response.content[0].text 
      : '';

    // Validate JSON if schema provided
    if (jsonSchema && content) {
      try {
        JSON.parse(content);
      } catch (e) {
        console.error('[AI] Invalid JSON response from Claude');
        return {
          success: false,
          error: 'Invalid JSON response from AI'
        };
      }
    }

    // Log metrics (no PII)
    const latencyMs = Date.now() - startTime;
    console.log(`[AI] Claude call successful - model: ${ANTHROPIC_MODEL}, latency: ${latencyMs}ms, tokens: in=${response.usage?.input_tokens}, out=${response.usage?.output_tokens}`);

    return {
      success: true,
      content,
      usage: {
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0
      }
    };

  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    
    // Log error without exposing sensitive data
    console.error(`[AI] Claude call failed - latency: ${latencyMs}ms, error: ${error.message || 'Unknown error'}`);
    
    // Handle specific error types
    if (error.status === 401) {
      return {
        success: false,
        error: 'Invalid API key'
      };
    } else if (error.status === 429) {
      return {
        success: false,
        error: 'Rate limit exceeded'
      };
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Request timeout'
      };
    }
    
    return {
      success: false,
      error: 'AI service temporarily unavailable'
    };
  }
}

// Health check function
export async function checkAIHealth(): Promise<{
  ok: boolean;
  provider: string;
  model?: string;
  latencyMs?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    if (AI_PROVIDER === 'none') {
      return {
        ok: false,
        provider: 'none',
        error: 'AI disabled'
      };
    }

    if (!ANTHROPIC_API_KEY) {
      return {
        ok: false,
        provider: AI_PROVIDER,
        error: 'API key not configured'
      };
    }

    // Run a minimal test call
    const result = await callClaude({
      user: 'Say "ok" in one word',
      maxTokens: 10
    });

    const latencyMs = Date.now() - startTime;

    if (result.success) {
      return {
        ok: true,
        provider: AI_PROVIDER,
        model: ANTHROPIC_MODEL,
        latencyMs
      };
    } else {
      return {
        ok: false,
        provider: AI_PROVIDER,
        model: ANTHROPIC_MODEL,
        error: result.error,
        latencyMs
      };
    }
  } catch (error: any) {
    return {
      ok: false,
      provider: AI_PROVIDER,
      error: error.message || 'Health check failed'
    };
  }
}