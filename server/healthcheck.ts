import { Request, Response } from 'express';
import { storage } from './storage';
import { generateSessionToken, hashPassword, verifyPassword } from './auth';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy';
  message?: string;
  timestamp: string;
}

export const performHealthCheck = async (): Promise<HealthCheckResult[]> => {
  const results: HealthCheckResult[] = [];
  const timestamp = new Date().toISOString();

  // Test database connection
  try {
    await storage.getUser(1);
    results.push({
      service: 'database',
      status: 'healthy',
      timestamp
    });
  } catch (error) {
    results.push({
      service: 'database',
      status: 'unhealthy',
      message: `Database connection failed: ${error}`,
      timestamp
    });
  }

  // Test authentication functions
  try {
    const token = generateSessionToken();
    if (token && token.length === 64) {
      results.push({
        service: 'auth_token_generation',
        status: 'healthy',
        timestamp
      });
    } else {
      throw new Error('Invalid token generated');
    }
  } catch (error) {
    results.push({
      service: 'auth_token_generation',
      status: 'unhealthy',
      message: `Token generation failed: ${error}`,
      timestamp
    });
  }

  // Test password hashing
  try {
    const testPassword = 'test123';
    const hashed = await hashPassword(testPassword);
    const verified = await verifyPassword(testPassword, hashed);
    
    if (verified) {
      results.push({
        service: 'password_hashing',
        status: 'healthy',
        timestamp
      });
    } else {
      throw new Error('Password verification failed');
    }
  } catch (error) {
    results.push({
      service: 'password_hashing',
      status: 'unhealthy',
      message: `Password hashing failed: ${error}`,
      timestamp
    });
  }

  // Test admin user exists
  try {
    const adminUser = await storage.getUserByUsername('admin');
    if (adminUser) {
      results.push({
        service: 'admin_user',
        status: 'healthy',
        timestamp
      });
    } else {
      throw new Error('Admin user not found');
    }
  } catch (error) {
    results.push({
      service: 'admin_user',
      status: 'unhealthy',
      message: `Admin user check failed: ${error}`,
      timestamp
    });
  }

  return results;
};

export const healthCheckEndpoint = async (req: Request, res: Response) => {
  try {
    const results = await performHealthCheck();
    const allHealthy = results.every(r => r.status === 'healthy');
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Health check failed: ${error}`,
      timestamp: new Date().toISOString()
    });
  }
};