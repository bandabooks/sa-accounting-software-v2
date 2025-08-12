// Central AI service exports
export { callClaude, checkAIHealth } from './anthropicClient.js';
export { 
  redactString, 
  redactObject, 
  redactForLogging, 
  sanitizeForAI, 
  containsPII,
  getSafeExcerpt 
} from './redact.js';

// AI health status cache
let lastHealthCheck: {
  timestamp: number;
  status: any;
} | null = null;

const HEALTH_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

/**
 * Get cached health status or trigger new check
 */
export async function getAIHealthStatus(forceCheck: boolean = false) {
  const now = Date.now();
  
  // Return cached status if fresh
  if (!forceCheck && lastHealthCheck && (now - lastHealthCheck.timestamp) < HEALTH_CHECK_INTERVAL) {
    return lastHealthCheck.status;
  }

  // Perform new health check
  const { checkAIHealth } = await import('./anthropicClient.js');
  const status = await checkAIHealth();
  
  // Cache the result
  lastHealthCheck = {
    timestamp: now,
    status
  };

  // Log health check result
  if (!status.ok) {
    console.error('[AI Health] AI service unhealthy:', status.error);
  } else {
    console.log('[AI Health] AI service healthy:', {
      provider: status.provider,
      model: status.model,
      latency: status.latencyMs
    });
  }

  return status;
}

/**
 * Initialize AI health monitoring
 */
export function initializeAIHealthMonitoring() {
  // Initial health check
  getAIHealthStatus(true).catch(err => {
    console.error('[AI Health] Initial health check failed:', err);
  });

  // Schedule periodic health checks
  setInterval(() => {
    getAIHealthStatus(true).catch(err => {
      console.error('[AI Health] Periodic health check failed:', err);
    });
  }, HEALTH_CHECK_INTERVAL);

  console.log('[AI Health] Health monitoring initialized');
}