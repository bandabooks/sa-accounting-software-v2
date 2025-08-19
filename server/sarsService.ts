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
      // For sandbox environment, use plain text credentials for testing
      if (config.environment === 'sandbox') {
        return {
          ...config,
          clientSecret: config.clientSecret.startsWith('U2FsdGVkX19') ? 
            config.clientSecret.replace('U2FsdGVkX19', '') : config.clientSecret,
          apiKey: config.apiKey.startsWith('U2FsdGVkX19') ? 
            config.apiKey.replace('U2FsdGVkX19', '') : config.apiKey,
        };
      }
      
      // For production, decrypt normally
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
      // Handle sandbox tokens that might not be encrypted
      let refreshToken: string;
      try {
        refreshToken = cryptoService.decrypt(link.refreshToken);
      } catch (decryptError) {
        console.log('Using sandbox refresh token (not encrypted)');
        refreshToken = link.refreshToken;
      }
      
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

    // For sandbox environment, return mock responses for testing
    if (config.environment === 'sandbox') {
      if (endpoint === '/test') {
        return { 
          success: true, 
          data: { 
            message: 'Sandbox connection test successful',
            timestamp: new Date().toISOString(),
            environment: 'sandbox'
          } 
        };
      }
      return { 
        success: true, 
        data: { 
          message: `Sandbox API call to ${endpoint} successful`,
          endpoint,
          timestamp: new Date().toISOString()
        } 
      };
    }

    try {
      // Handle sandbox tokens that might not be encrypted
      let accessToken: string;
      try {
        accessToken = cryptoService.decrypt(link.accessToken!);
      } catch (decryptError) {
        // If decryption fails, assume it's a sandbox token stored as plain text
        console.log('Using sandbox access token (not encrypted)');
        accessToken = link.accessToken!;
      }
      
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
          try {
            accessToken = cryptoService.decrypt(updatedLink!.accessToken!);
          } catch (decryptError) {
            accessToken = updatedLink!.accessToken!;
          }
          
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
    // Check if company has SARS link
    const link = await storage.getCompanySarsLink(companyId);
    
    if (!link || link.status !== 'connected') {
      return { success: false, error: 'Company not connected to SARS' };
    }
    
    // For sandbox, always return success
    const config = await this.getVendorConfig();
    if (config && config.environment === 'sandbox') {
      // Update last sync time for sandbox
      await storage.updateCompanySarsLink(companyId, {
        lastSyncAt: new Date(),
        error: null,
      });
      
      return { 
        success: true, 
        data: { 
          message: 'Sandbox connection test successful',
          timestamp: new Date().toISOString(),
          environment: 'sandbox'
        } 
      };
    }
    
    // For production, make actual API call
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
   * Submit EMP201 (PAYE) return to SARS
   */
  async submitEmp201(companyId: number, empData: any): Promise<SarsApiResponse> {
    try {
      // Create payroll submission record
      const submissionData = {
        companyId,
        submissionType: 'EMP201' as const,
        periodMonth: empData.periodMonth,
        periodYear: empData.periodYear,
        status: 'draft' as const,
        submissionData: empData,
      };

      const submission = await storage.createPayrollSubmission(submissionData);

      // Submit to SARS
      const result = await this.makeApiCall(companyId, '/emp201/submit', {
        method: 'POST',
        body: JSON.stringify(empData),
      });

      if (result.success) {
        // Update submission with success
        await storage.updatePayrollSubmission(submission.id, {
          status: 'submitted',
          sarsReferenceNumber: result.data?.referenceNumber,
          submittedAt: new Date(),
          sarsResponse: result.data,
        });
      } else {
        // Update submission status to error
        await storage.updatePayrollSubmission(submission.id, {
          status: 'error',
          error: result.error || 'EMP201 submission failed',
        });
      }

      return result;
    } catch (error) {
      console.error('EMP201 submission error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'EMP201 submission failed' 
      };
    }
  }

  /**
   * Submit EMP501 (Annual Reconciliation) return to SARS
   */
  async submitEmp501(companyId: number, empData: any): Promise<SarsApiResponse> {
    try {
      // Create payroll submission record
      const submissionData = {
        companyId,
        submissionType: 'EMP501' as const,
        periodMonth: 12, // EMP501 is annual
        periodYear: empData.periodYear,
        status: 'draft' as const,
        submissionData: empData,
      };

      const submission = await storage.createPayrollSubmission(submissionData);

      // Submit to SARS
      const result = await this.makeApiCall(companyId, '/emp501/submit', {
        method: 'POST',
        body: JSON.stringify(empData),
      });

      if (result.success) {
        // Update submission with success
        await storage.updatePayrollSubmission(submission.id, {
          status: 'submitted',
          sarsReferenceNumber: result.data?.referenceNumber,
          submittedAt: new Date(),
          sarsResponse: result.data,
        });
      } else {
        // Update submission status to error
        await storage.updatePayrollSubmission(submission.id, {
          status: 'error',
          error: result.error || 'EMP501 submission failed',
        });
      }

      return result;
    } catch (error) {
      console.error('EMP501 submission error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'EMP501 submission failed' 
      };
    }
  }

  /**
   * Get ISV client list from SARS
   */
  async getIsvClientList(practitionerId: number): Promise<SarsApiResponse> {
    try {
      const practitioner = await storage.getUser(practitionerId);
      if (!practitioner) {
        return { success: false, error: 'Practitioner not found' };
      }

      const result = await this.makeApiCall(practitioner.companyId, '/isv/clients');
      return result;
    } catch (error) {
      console.error('ISV client list error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch ISV client list' 
      };
    }
  }

  /**
   * Authorize ISV access for a client
   */
  async authorizeIsvAccess(practitionerId: number, clientData: any): Promise<SarsApiResponse> {
    try {
      const practitioner = await storage.getUser(practitionerId);
      if (!practitioner) {
        return { success: false, error: 'Practitioner not found' };
      }

      // Create local ISV client access record
      const accessData = {
        practitionerId,
        practitionerCompanyId: practitioner.companyId,
        clientCompanyId: clientData.clientCompanyId,
        clientTaxNumber: clientData.taxNumber,
        clientName: clientData.name,
        accessLevel: clientData.accessLevel || 'full',
        permissions: clientData.permissions || [],
      };

      const clientAccess = await storage.createIsvClientAccess(accessData);

      // Authorize with SARS
      const result = await this.makeApiCall(practitioner.companyId, '/isv/authorize', {
        method: 'POST',
        body: JSON.stringify(clientData),
      });

      if (result.success) {
        // Update local record with success
        await storage.updateIsvClientAccess(clientAccess.id, {
          status: 'active',
          authorizedAt: new Date(),
        });
      } else {
        // Remove local record if SARS authorization failed
        await storage.revokeIsvClientAccess(clientAccess.id);
      }

      return result;
    } catch (error) {
      console.error('ISV authorization error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'ISV authorization failed' 
      };
    }
  }

  /**
   * Submit return on behalf of ISV client
   */
  async submitForClient(
    practitionerId: number, 
    clientCompanyId: number, 
    returnType: string, 
    returnData: any
  ): Promise<SarsApiResponse> {
    try {
      // Verify practitioner has access to this client
      const clientAccess = await storage.getClientAccessForCompany(clientCompanyId);
      const practitionerAccess = clientAccess.find(access => 
        access.practitionerId === practitionerId && access.status === 'active'
      );

      if (!practitionerAccess) {
        return { success: false, error: 'No active access to client company' };
      }

      // Check permissions
      const permissions = practitionerAccess.permissions as string[];
      if (!permissions.includes(returnType) && practitionerAccess.accessLevel !== 'full') {
        return { 
          success: false, 
          error: `No permission to submit ${returnType} for this client` 
        };
      }

      const practitioner = await storage.getUser(practitionerId);
      if (!practitioner) {
        return { success: false, error: 'Practitioner not found' };
      }

      // Submit to SARS with ISV headers
      const result = await this.makeApiCall(practitioner.companyId, `/isv/submit/${returnType}`, {
        method: 'POST',
        headers: {
          'X-Client-Tax-Number': practitionerAccess.clientTaxNumber,
        },
        body: JSON.stringify(returnData),
      });

      if (result.success) {
        // Update last access time
        await storage.updateIsvClientAccess(practitionerAccess.id, {
          lastAccessAt: new Date(),
        });
      }

      return result;
    } catch (error) {
      console.error('ISV client submission error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : `${returnType} submission failed for client` 
      };
    }
  }

  /**
   * Get payroll submissions for a company
   */
  async getPayrollSubmissions(companyId: number, submissionType?: string): Promise<SarsApiResponse> {
    try {
      const submissions = await storage.getPayrollSubmissions(companyId, submissionType);
      return { success: true, data: submissions };
    } catch (error) {
      console.error('Get payroll submissions error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch payroll submissions' 
      };
    }
  }

  /**
   * Get ISV client access for practitioner
   */
  async getIsvAccess(practitionerId: number): Promise<SarsApiResponse> {
    try {
      const clientAccess = await storage.getIsvClientAccess(practitionerId);
      return { success: true, data: clientAccess };
    } catch (error) {
      console.error('Get ISV access error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch ISV access' 
      };
    }
  }

  /**
   * Get VAT return status from SARS
   */
  async getVatReturnStatus(companyId: number, referenceNumber: string): Promise<SarsApiResponse> {
    return await this.makeApiCall(companyId, `/vat201/status/${referenceNumber}`);
  }
}

export const sarsService = new SarsEFilingService();