import { apiRequest } from './queryClient';

export interface AIHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  message: string;
  timestamp: string;
  features: {
    basicChat: boolean;
    imageAnalysis: boolean;
    documentAnalysis: boolean;
    codeGeneration: boolean;
  };
  modelInfo: {
    model: string;
    maxTokens: number;
    contextWindow: number;
  };
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
    remainingRequests?: number;
    remainingTokens?: number;
  };
}

export interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
  features: string[];
  lastError?: {
    message: string;
    timestamp: string;
  };
}

export interface AIConversation {
  id: number;
  title: string;
  context?: string;
  contextId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant' | 'system';
  message: string;
  metadata?: any;
  createdAt: string;
}

export interface SystemStatus {
  configured: boolean;
  healthy: boolean;
  monitoring: boolean;
  lastCheck: string;
  features: {
    basicChat: boolean;
    imageAnalysis: boolean;
    documentAnalysis: boolean;
    codeGeneration: boolean;
  };
  metrics: AIMetrics;
}

export interface FunctionTestResult {
  functionName: string;
  success: boolean;
  responseTime: number;
  result?: any;
  error?: string;
}

export class AIClient {
  /**
   * Get current AI health status
   */
  static async getHealthStatus(): Promise<AIHealthStatus> {
    const response = await fetch('/api/ai/health');
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get AI performance metrics
   */
  static async getMetrics(): Promise<AIMetrics> {
    const response = await fetch('/api/ai/metrics');
    if (!response.ok) {
      throw new Error(`Failed to get metrics: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get comprehensive system status (requires authentication)
   */
  static async getSystemStatus(): Promise<SystemStatus> {
    return apiRequest('/api/ai/system-status');
  }

  /**
   * Test a specific AI function
   */
  static async testFunction(functionName: string, testPayload: any): Promise<FunctionTestResult> {
    return apiRequest('/api/ai/test-function', {
      method: 'POST',
      body: JSON.stringify({ functionName, testPayload })
    });
  }

  /**
   * Start health monitoring
   */
  static async startMonitoring(intervalMinutes: number = 5): Promise<{ message: string; interval: number }> {
    return apiRequest('/api/ai/monitoring/start', {
      method: 'POST',
      body: JSON.stringify({ intervalMinutes })
    });
  }

  /**
   * Stop health monitoring
   */
  static async stopMonitoring(): Promise<{ message: string }> {
    return apiRequest('/api/ai/monitoring/stop', {
      method: 'POST'
    });
  }

  /**
   * Reset metrics
   */
  static async resetMetrics(): Promise<{ message: string }> {
    return apiRequest('/api/ai/metrics/reset', {
      method: 'POST'
    });
  }

  /**
   * Check if AI is available (public endpoint)
   */
  static async checkAvailability(): Promise<{
    available: boolean;
    providers: string[];
    status: string;
  }> {
    const response = await fetch('/api/ai/available');
    if (!response.ok) {
      throw new Error(`Availability check failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get user's AI conversations
   */
  static async getConversations(): Promise<AIConversation[]> {
    return apiRequest('/api/ai/conversations');
  }

  /**
   * Create a new conversation
   */
  static async createConversation(data: {
    title: string;
    context?: string;
    contextId?: number;
  }): Promise<AIConversation> {
    return apiRequest('/api/ai/conversations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Send a chat message
   */
  static async sendMessage(data: {
    conversationId: number;
    message: string;
    context?: {
      context?: string;
      contextId?: number;
      contextData?: any;
    };
  }): Promise<{ response: string; messageId: number }> {
    return apiRequest('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Get conversation history
   */
  static async getConversationHistory(conversationId: number): Promise<AIMessage[]> {
    return apiRequest(`/api/ai/conversations/${conversationId}/messages`);
  }

  /**
   * Archive a conversation
   */
  static async archiveConversation(conversationId: number): Promise<{ message: string }> {
    return apiRequest(`/api/ai/conversations/${conversationId}/archive`, {
      method: 'POST'
    });
  }

  /**
   * Quick AI analysis functions
   */

  /**
   * Analyze an invoice
   */
  static async analyzeInvoice(invoiceId: number): Promise<{ response: string; messageId: number }> {
    return apiRequest(`/api/ai/analyze/invoice/${invoiceId}`, {
      method: 'POST'
    });
  }

  /**
   * Get chart of accounts suggestions
   */
  static async suggestChartOfAccounts(industry: string): Promise<{ response: string; messageId: number }> {
    return apiRequest('/api/ai/suggest/chart-of-accounts', {
      method: 'POST',
      body: JSON.stringify({ industry })
    });
  }

  /**
   * Get VAT compliance help
   */
  static async getVATHelp(): Promise<{ response: string; messageId: number }> {
    return apiRequest('/api/ai/help/vat-compliance', {
      method: 'POST'
    });
  }

  /**
   * Utility functions
   */

  /**
   * Format response time for display
   */
  static formatResponseTime(ms: number): string {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  }

  /**
   * Get status color for UI components
   */
  static getStatusColor(status: 'healthy' | 'degraded' | 'down'): string {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Get status background color for UI components
   */
  static getStatusBgColor(status: 'healthy' | 'degraded' | 'down'): string {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'down':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800';
    }
  }

  /**
   * Format feature name for display
   */
  static formatFeatureName(feature: string): string {
    return feature
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
  }

  /**
   * Calculate success rate percentage
   */
  static calculateSuccessRate(metrics: AIMetrics): number {
    if (metrics.totalRequests === 0) return 100;
    return (metrics.successfulRequests / metrics.totalRequests) * 100;
  }

  /**
   * Format uptime for display
   */
  static formatUptime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds.toFixed(0)}s`;
    } else if (seconds < 3600) {
      return `${(seconds / 60).toFixed(1)}m`;
    } else {
      return `${(seconds / 3600).toFixed(1)}h`;
    }
  }

  /**
   * Check if AI feature is available
   */
  static isFeatureAvailable(features: any, feature: string): boolean {
    return features && features[feature] === true;
  }

  /**
   * Get feature description
   */
  static getFeatureDescription(feature: string): string {
    const descriptions: Record<string, string> = {
      basicChat: 'General AI conversation and assistance',
      imageAnalysis: 'Image content analysis and description',
      documentAnalysis: 'Document parsing and information extraction',
      codeGeneration: 'Code generation and programming assistance'
    };
    
    return descriptions[feature] || 'AI feature functionality';
  }
}

export default AIClient;