import crypto from 'crypto';
import { URLSearchParams } from 'url';

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  testMode: boolean;
}

export interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  custom_int1?: string;
  custom_int2?: string;
  custom_int3?: string;
  custom_int4?: string;
  custom_int5?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
}

export class PayFastService {
  private config: PayFastConfig;
  private baseUrl: string;

  constructor(config: PayFastConfig) {
    this.config = config;
    this.baseUrl = config.testMode 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';
  }

  /**
   * Generate MD5 signature for PayFast
   */
  private generateSignature(data: PayFastPaymentData): string {
    // Create parameter string
    const params = new URLSearchParams();
    
    // Add all non-empty parameters
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    // Add passphrase if provided
    if (this.config.passphrase) {
      params.append('passphrase', this.config.passphrase);
    }
    
    // Generate signature
    const paramString = params.toString();
    return crypto.createHash('md5').update(paramString).digest('hex');
  }

  /**
   * Create PayFast payment data with signature
   */
  createPaymentData(paymentData: Omit<PayFastPaymentData, 'merchant_id' | 'merchant_key'>): PayFastPaymentData & { signature: string } {
    const data: PayFastPaymentData = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      ...paymentData,
    };

    const signature = this.generateSignature(data);

    return {
      ...data,
      signature,
    };
  }

  /**
   * Verify PayFast ITN (Instant Transaction Notification)
   */
  verifyITN(postData: Record<string, string>): boolean {
    const { signature, ...data } = postData;
    
    if (!signature) {
      return false;
    }

    const generatedSignature = this.generateSignature(data as unknown as PayFastPaymentData);
    return generatedSignature === signature;
  }

  /**
   * Generate PayFast payment URL
   */
  getPaymentUrl(): string {
    return this.baseUrl;
  }

  /**
   * Validate PayFast server IP (for security)
   */
  validateServerIP(ip: string): boolean {
    const validIPs = [
      '197.97.145.144',
      '197.97.145.145',
      '197.97.145.146',
      '197.97.145.147',
      '197.97.145.148',
      '41.74.179.194',
      '41.74.179.195',
      '41.74.179.196',
      '41.74.179.197',
      '41.74.179.198',
      '41.74.179.199',
    ];
    
    return validIPs.includes(ip);
  }

  /**
   * Get PayFast payment status meanings
   */
  getPaymentStatusMeaning(status: string): string {
    const statusMap: Record<string, string> = {
      'COMPLETE': 'Payment completed successfully',
      'FAILED': 'Payment failed',
      'PENDING': 'Payment is pending',
      'CANCELLED': 'Payment was cancelled by user',
    };
    
    return statusMap[status] || 'Unknown status';
  }
}

// Default PayFast configuration from environment
export function createPayFastService(): PayFastService {
  const config: PayFastConfig = {
    merchantId: process.env.PAYFAST_MERCHANT_ID || '18432458', // Default merchant ID
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || 'm5vlzssivllny', // Default merchant key
    passphrase: process.env.PAYFAST_PASSPHRASE || 'Testpayfastapi', // Default passphrase
    testMode: false, // LIVE MODE ENABLED - Set to false for production payments
  };

  console.log('PayFast service configuration:', {
    merchantId: config.merchantId,
    merchantKey: config.merchantKey ? '***hidden***' : 'missing',
    passphrase: config.passphrase ? '***hidden***' : 'missing',
    testMode: config.testMode
  });

  if (!config.merchantId || !config.merchantKey) {
    throw new Error('PayFast merchant ID and key are required');
  }

  return new PayFastService(config);
}

// PayFast payment methods
export const PAYFAST_PAYMENT_METHODS = [
  { id: 'cc', name: 'Credit Card' },
  { id: 'dc', name: 'Debit Card' },
  { id: 'bc', name: 'Bank Transfer' },
  { id: 'mp', name: 'Mobile Payment' },
  { id: 'mc', name: 'Masterpass' },
  { id: 'sc', name: 'Scan to Pay' },
] as const;

export type PayFastPaymentMethod = typeof PAYFAST_PAYMENT_METHODS[number]['id'];