import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

/*
<important_code_snippet_instructions>
The newest Anthropic model is "claude-sonnet-4-20250514", not older versions.
This service provides automatic failover between Anthropic Claude and OpenAI.
</important_code_snippet_instructions>
*/

// Model configurations
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const OPENAI_MODEL = "gpt-4-turbo-preview";
const OPENAI_FALLBACK_MODEL = "gpt-3.5-turbo";

export type AIProvider = 'anthropic' | 'openai' | 'none';

export interface AIServiceConfig {
  primaryProvider: AIProvider;
  fallbackProvider: AIProvider;
  autoFailover: boolean;
  retryAttempts: number;
  timeout: number;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  responseTime: number;
  tokensUsed?: number;
}

export class AIFailoverService {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;
  private currentProvider: AIProvider = 'none';
  private config: AIServiceConfig;
  private providerStatus: Map<AIProvider, boolean> = new Map();
  private lastFailoverTime: number = 0;
  private failoverCooldown: number = 60000; // 1 minute cooldown between failovers

  constructor() {
    this.config = {
      primaryProvider: 'anthropic',
      fallbackProvider: 'openai',
      autoFailover: true,
      retryAttempts: 2,
      timeout: 30000
    };

    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        this.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.providerStatus.set('anthropic', true);
        console.log('✅ Anthropic Claude initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Anthropic:', error);
        this.providerStatus.set('anthropic', false);
      }
    } else {
      console.warn('⚠️ ANTHROPIC_API_KEY not found');
      this.providerStatus.set('anthropic', false);
    }

    // Initialize OpenAI as backup
    if (process.env.OPENAI_API_KEY) {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        this.providerStatus.set('openai', true);
        console.log('✅ OpenAI initialized as backup');
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI:', error);
        this.providerStatus.set('openai', false);
      }
    } else {
      console.warn('⚠️ OPENAI_API_KEY not found');
      this.providerStatus.set('openai', false);
    }

    // Determine current provider
    this.selectBestProvider();
  }

  private selectBestProvider() {
    if (this.providerStatus.get(this.config.primaryProvider)) {
      this.currentProvider = this.config.primaryProvider;
    } else if (this.providerStatus.get(this.config.fallbackProvider)) {
      this.currentProvider = this.config.fallbackProvider;
      console.log(`🔄 Switched to fallback provider: ${this.config.fallbackProvider}`);
    } else {
      this.currentProvider = 'none';
      console.error('❌ No AI providers available');
    }
  }

  async chat(messages: Array<{ role: string; content: string }>, options?: any): Promise<AIResponse> {
    const startTime = Date.now();

    // Try primary provider first
    if (this.currentProvider === 'anthropic' && this.anthropic) {
      try {
        const response = await this.callAnthropic(messages, options);
        return {
          ...response,
          responseTime: Date.now() - startTime
        };
      } catch (error) {
        console.error('Anthropic call failed:', error);
        if (this.config.autoFailover) {
          return this.failoverToOpenAI(messages, options, startTime);
        }
        throw error;
      }
    }

    // Try OpenAI
    if (this.currentProvider === 'openai' && this.openai) {
      try {
        const response = await this.callOpenAI(messages, options);
        return {
          ...response,
          responseTime: Date.now() - startTime
        };
      } catch (error) {
        console.error('OpenAI call failed:', error);
        if (this.config.autoFailover && this.anthropic) {
          return this.failoverToAnthropic(messages, options, startTime);
        }
        throw error;
      }
    }

    throw new Error('No AI provider available');
  }

  private async callAnthropic(messages: Array<{ role: string; content: string }>, options?: any): Promise<AIResponse> {
    if (!this.anthropic) throw new Error('Anthropic not initialized');

    const response = await this.anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: options?.maxTokens || 1000,
      messages: messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      system: options?.system
    });

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      provider: 'anthropic',
      model: ANTHROPIC_MODEL,
      responseTime: 0,
      tokensUsed: response.usage?.output_tokens
    };
  }

  private async callOpenAI(messages: Array<{ role: string; content: string }>, options?: any): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    try {
      // Try GPT-4 first
      const response = await this.openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: messages,
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7
      });

      return {
        content: response.choices[0].message.content || '',
        provider: 'openai',
        model: OPENAI_MODEL,
        responseTime: 0,
        tokensUsed: response.usage?.total_tokens
      };
    } catch (error) {
      // Fallback to GPT-3.5 if GPT-4 fails
      console.log('Falling back to GPT-3.5-turbo');
      const response = await this.openai.chat.completions.create({
        model: OPENAI_FALLBACK_MODEL,
        messages: messages,
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7
      });

      return {
        content: response.choices[0].message.content || '',
        provider: 'openai',
        model: OPENAI_FALLBACK_MODEL,
        responseTime: 0,
        tokensUsed: response.usage?.total_tokens
      };
    }
  }

  private async failoverToOpenAI(messages: Array<{ role: string; content: string }>, options: any, startTime: number): Promise<AIResponse> {
    const now = Date.now();
    if (now - this.lastFailoverTime < this.failoverCooldown) {
      throw new Error('Failover on cooldown');
    }

    console.log('🔄 Failing over to OpenAI...');
    this.lastFailoverTime = now;
    this.currentProvider = 'openai';
    
    if (!this.openai) {
      throw new Error('OpenAI not available for failover');
    }

    const response = await this.callOpenAI(messages, options);
    return {
      ...response,
      responseTime: Date.now() - startTime
    };
  }

  private async failoverToAnthropic(messages: Array<{ role: string; content: string }>, options: any, startTime: number): Promise<AIResponse> {
    const now = Date.now();
    if (now - this.lastFailoverTime < this.failoverCooldown) {
      throw new Error('Failover on cooldown');
    }

    console.log('🔄 Failing over to Anthropic...');
    this.lastFailoverTime = now;
    this.currentProvider = 'anthropic';
    
    if (!this.anthropic) {
      throw new Error('Anthropic not available for failover');
    }

    const response = await this.callAnthropic(messages, options);
    return {
      ...response,
      responseTime: Date.now() - startTime
    };
  }

  async getHealthStatus() {
    const anthropicHealthy = await this.checkAnthropicHealth();
    const openaiHealthy = await this.checkOpenAIHealth();

    let status: 'healthy' | 'degraded' | 'down';
    let message: string;

    if (anthropicHealthy && openaiHealthy) {
      status = 'healthy';
      message = 'Both AI providers operational';
    } else if (anthropicHealthy || openaiHealthy) {
      status = 'degraded';
      message = `Running on ${anthropicHealthy ? 'Anthropic Claude' : 'OpenAI'} only`;
    } else {
      status = 'down';
      message = 'No AI providers available';
    }

    return {
      status,
      message,
      providers: {
        anthropic: {
          available: !!this.anthropic,
          healthy: anthropicHealthy,
          model: ANTHROPIC_MODEL
        },
        openai: {
          available: !!this.openai,
          healthy: openaiHealthy,
          model: OPENAI_MODEL
        }
      },
      currentProvider: this.currentProvider,
      autoFailover: this.config.autoFailover
    };
  }

  private async checkAnthropicHealth(): Promise<boolean> {
    if (!this.anthropic) return false;
    
    try {
      const response = await this.anthropic.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }]
      });
      return true;
    } catch {
      return false;
    }
  }

  private async checkOpenAIHealth(): Promise<boolean> {
    if (!this.openai) return false;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 10
      });
      return true;
    } catch {
      return false;
    }
  }

  getProviderComparison() {
    return {
      anthropic: {
        name: 'Anthropic Claude',
        model: ANTHROPIC_MODEL,
        strengths: [
          'Superior reasoning and analysis',
          'Better at complex tasks',
          'More nuanced understanding',
          'Excellent at coding',
          'Larger context window (200k tokens)',
          'More recent training data'
        ],
        weaknesses: [
          'Slightly slower response time',
          'More expensive per token'
        ],
        bestFor: [
          'Complex financial analysis',
          'Tax calculations',
          'Code generation',
          'Document analysis',
          'Strategic planning'
        ]
      },
      openai: {
        name: 'OpenAI GPT',
        models: [OPENAI_MODEL, OPENAI_FALLBACK_MODEL],
        strengths: [
          'Fast response times',
          'Good general knowledge',
          'Cost-effective (GPT-3.5)',
          'Wide availability',
          'Good at creative tasks'
        ],
        weaknesses: [
          'Smaller context window',
          'Less recent training data',
          'May struggle with complex logic'
        ],
        bestFor: [
          'Quick responses',
          'Simple queries',
          'Content generation',
          'Customer support',
          'Basic calculations'
        ]
      }
    };
  }
}

// Singleton instance
export const aiFailoverService = new AIFailoverService();