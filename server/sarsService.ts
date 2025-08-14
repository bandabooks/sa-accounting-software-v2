import { storage } from "./storage";
import { cryptoService } from "./crypto";
import type { SarsVendorConfig, CompanySarsLink, InsertSarsVendorConfig, InsertCompanySarsLink } from "@shared/schema";

interface SarsOAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface SarsApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class SarsEFilingService {
  private readonly baseUrl = "https://secure.sarsefiling.co.za";
  
  /**
   * Configure SARS ISV vendor credentials (Super Admin only)
   */
  async configureVendor(config: InsertSarsVendorConfig): Promise<SarsVendorConfig> {
    // Encrypt sensitive data before storage
    const encryptedConfig = {
      ...config,
      clientSecret: cryptoService.encrypt(config.clientSecret),
      apiKey: cryptoService.encrypt(config.apiKey),
    };
    
    return await storage.createOrUpdateSarsVendorConfig(encryptedConfig);
  }

  /**
   * Get vendor configuration (decrypted for internal use)
   */
  async getVendorConfig(): Promise<SarsVendorConfig | null> {
    const config = await storage.getSarsVendorConfig();
    if (!config) return null;

    try {
      return {
        ...config,
        clientSecret: cryptoService.decrypt(config.clientSecret),
        apiKey: cryptoService.decrypt(config.apiKey),
      };
    } catch (error) {
      console.error("Failed to decrypt SARS vendor config:", error);
      return null;
    }
  }

  /**
   * Generate OAuth authorization URL for company admin to connect
   */
  async generateAuthUrl(companyId: number, redirectUri: string): Promise<string> {
    const config = await this.getVendorConfig();
    if (!config) {
      throw new Error("SARS vendor configuration not found. Please contact your system administrator.");
    }

    const state = cryptoService.generateState();
    
    // Store state temporarily (you might want to use a session or temporary storage)
    // For now, we'll include companyId in the state
    const stateWithCompany = `${state}:${companyId}`;
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: 'efiling_read efiling_write',
      state: stateWithCompany,
    });

    return `${this.baseUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(
    code: string, 
    state: string, 
    redirectUri: string
  ): Promise<{ companyId: number; tokens: SarsOAuthTokenResponse }> {
    const config = await this.getVendorConfig();
    if (!config) {
      throw new Error("SARS vendor configuration not found");
    }

    // Extract company ID from state
    const [, companyIdStr] = state.split(':');
    const companyId = parseInt(companyIdStr);
    
    if (!companyId) {
      throw new Error("Invalid state parameter");
    }

    const tokenResponse = await fetch(`${config.apiUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    const tokens: SarsOAuthTokenResponse = await tokenResponse.json();
    
    return { companyId, tokens };
  }

  /**
   * Link company to SARS using OAuth tokens
   */
  async linkCompany(companyId: number, tokens: SarsOAuthTokenResponse): Promise<CompanySarsLink> {
    const config = await this.getVendorConfig();
    if (!config) {
      throw new Error("SARS vendor configuration not found");
    }

    // Encrypt tokens before storage
    const encryptedTokens = {
      accessToken: cryptoService.encrypt(tokens.access_token),
      refreshToken: cryptoService.encrypt(tokens.refresh_token),
    };

    const linkData: InsertCompanySarsLink = {
      companyId,
      isvNumber: config.isvNumber,
      status: 'connected',
      accessToken: encryptedTokens.accessToken,
      refreshToken: encryptedTokens.refreshToken,
      linkedAt: new Date(),
    };

    // Check if link already exists
    const existingLink = await storage.getCompanySarsLink(companyId);
    if (existingLink) {
      return await storage.updateCompanySarsLink(companyId, linkData) as CompanySarsLink;
    } else {
      return await storage.createCompanySarsLink(linkData);
    }
  }

  /**
   * Get company SARS connection status
   */
  async getCompanyStatus(companyId: number): Promise<CompanySarsLink | null> {
    return await storage.getCompanySarsLink(companyId);
  }

  /**
   * Refresh expired access tokens
   */
  async refreshTokens(companyId: number): Promise<boolean> {
    const config = await this.getVendorConfig();
    const link = await storage.getCompanySarsLink(companyId);
    
    if (!config || !link || !link.refreshToken) {
      return false;
    }

    try {
      const refreshToken = cryptoService.decrypt(link.refreshToken);
      
      const response = await fetch(`${config.apiUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh tokens');
      }

      const tokens: SarsOAuthTokenResponse = await response.json();
      
      // Update stored tokens
      await storage.updateCompanySarsLink(companyId, {
        accessToken: cryptoService.encrypt(tokens.access_token),
        refreshToken: cryptoService.encrypt(tokens.refresh_token),
        status: 'connected',
        error: null,
      });

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Mark as disconnected
      await storage.updateCompanySarsLink(companyId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Token refresh failed',
      });
      
      return false;
    }
  }

  /**
   * Make authenticated API call to SARS
   */
  async makeApiCall<T = any>(
    companyId: number, 
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<SarsApiResponse<T>> {
    const config = await this.getVendorConfig();
    const link = await storage.getCompanySarsLink(companyId);
    
    if (!config || !link || link.status !== 'connected') {
      return { success: false, error: 'Company not connected to SARS' };
    }

    try {
      let accessToken = cryptoService.decrypt(link.accessToken!);
      
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle token expiration
      if (response.status === 401) {
        const refreshed = await this.refreshTokens(companyId);
        if (refreshed) {
          // Retry with new token
          const updatedLink = await storage.getCompanySarsLink(companyId);
          accessToken = cryptoService.decrypt(updatedLink!.accessToken!);
          
          const retryResponse = await fetch(`${config.apiUrl}${endpoint}`, {
            ...options,
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });
          
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            return { success: true, data };
          }
        }
        
        return { success: false, error: 'Authentication failed' };
      }

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const error = await response.text();
        return { success: false, error };
      }
    } catch (error) {
      console.error('SARS API call failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'API call failed' 
      };
    }
  }

  /**
   * Disconnect company from SARS
   */
  async disconnectCompany(companyId: number): Promise<boolean> {
    return await storage.deleteSarsLink(companyId);
  }

  /**
   * Test SARS connection
   */
  async testConnection(companyId: number): Promise<SarsApiResponse> {
    const result = await this.makeApiCall(companyId, '/test');
    
    if (result.success) {
      // Update last sync time
      await storage.updateCompanySarsLink(companyId, {
        lastSyncAt: new Date(),
        error: null,
      });
    }
    
    return result;
  }

  /**
   * Submit VAT201 return to SARS
   */
  async submitVat201(companyId: number, vatData: any): Promise<SarsApiResponse> {
    return await this.makeApiCall(companyId, '/vat201/submit', {
      method: 'POST',
      body: JSON.stringify(vatData),
    });
  }

  /**
   * Get VAT return status from SARS
   */
  async getVatReturnStatus(companyId: number, referenceNumber: string): Promise<SarsApiResponse> {
    return await this.makeApiCall(companyId, `/vat201/status/${referenceNumber}`);
  }
}

export const sarsService = new SarsEFilingService();